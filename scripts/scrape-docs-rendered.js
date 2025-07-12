const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
const { URL } = require('url');

/**
 * Web scraper that crawls the actual rendered documentation site
 */
async function scrapeRenderedDocs() {
	const baseUrl = 'https://docs.sei.io';
	const outputPath = './public/_scraped-docs';
	const scrapedPages = [];
	const visitedUrls = new Set();
	const urlsToVisit = [baseUrl];

	try {
		console.log('🚀 Starting rendered documentation scraping...');
		await fs.mkdir(outputPath, { recursive: true });

		// Launch browser
		console.log('🌐 Launching browser...');
		const browser = await puppeteer.launch({
			headless: 'new',
			args: ['--no-sandbox', '--disable-setuid-sandbox']
		});

		const page = await browser.newPage();

		// Set user agent and viewport
		await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
		await page.setViewport({ width: 1920, height: 1080 });

		// Process URLs
		while (urlsToVisit.length > 0 && visitedUrls.size < 100) {
			// Limit to 100 pages
			const currentUrl = urlsToVisit.shift();

			if (visitedUrls.has(currentUrl) || !isValidDocUrl(currentUrl, baseUrl)) {
				continue;
			}

			visitedUrls.add(currentUrl);
			console.log(`➡️ (${visitedUrls.size}/100) Processing: ${currentUrl}`);

			try {
				// Navigate to page
				await page.goto(currentUrl, {
					waitUntil: 'networkidle2',
					timeout: 30000
				});

				// Wait for content to load
				await page.waitForTimeout(2000);

				// Extract page data
				const pageData = await extractPageData(page, currentUrl);

				if (pageData && pageData.content.length > 100) {
					scrapedPages.push(pageData);
					console.log(`   ✅ Done (${pageData.content.length} chars)`);
				} else {
					console.log(`   ⚠️ Skipped (too short or no content)`);
				}

				// Find additional links to crawl
				const links = await findDocumentationLinks(page, baseUrl);
				links.forEach((link) => {
					if (!visitedUrls.has(link) && !urlsToVisit.includes(link)) {
						urlsToVisit.push(link);
					}
				});
			} catch (error) {
				console.warn(`   ❌ Error processing ${currentUrl}:`, error.message);
			}
		}

		await browser.close();
		console.log(`✅ Processed ${scrapedPages.length} pages`);
		await saveScrapedContent(scrapedPages, outputPath);
	} catch (err) {
		console.error('❌ Fatal error:', err);
		process.exit(1);
	}
}

/**
 * Check if URL is a valid documentation URL to crawl
 */
function isValidDocUrl(url, baseUrl) {
	try {
		const urlObj = new URL(url);
		const baseUrlObj = new URL(baseUrl);

		// Must be same domain
		if (urlObj.hostname !== baseUrlObj.hostname) {
			return false;
		}

		// Skip certain paths
		const skipPaths = ['/api/', '/images/', '/assets/', '/_next/', '/favicon'];
		if (skipPaths.some((path) => urlObj.pathname.startsWith(path))) {
			return false;
		}

		// Skip anchors and query params for crawling purposes
		return true;
	} catch {
		return false;
	}
}

/**
 * Extract page data from the rendered page
 */
async function extractPageData(page, url) {
	const data = await page.evaluate(() => {
		// Remove navigation, footer, and other non-content elements
		const elementsToRemove = [
			'nav',
			'header',
			'footer',
			'[role="navigation"]',
			'.sidebar',
			'.nav',
			'.navigation',
			'.breadcrumb',
			'.pagination',
			'script',
			'style',
			'noscript'
		];

		elementsToRemove.forEach((selector) => {
			const elements = document.querySelectorAll(selector);
			elements.forEach((el) => el.remove());
		});

		// Try to find the main content area
		let contentElement =
			document.querySelector('main') ||
			document.querySelector('[role="main"]') ||
			document.querySelector('.content') ||
			document.querySelector('.main-content') ||
			document.querySelector('article') ||
			document.body;

		// Get title
		const title =
			document.querySelector('h1')?.textContent?.trim() || document.querySelector('title')?.textContent?.replace(' | Sei Docs', '')?.trim() || 'Untitled';

		// Get meta description
		const metaDesc = document.querySelector('meta[name="description"]');
		const description = metaDesc ? metaDesc.getAttribute('content') : null;

		// Get keywords
		const metaKeywords = document.querySelector('meta[name="keywords"]');
		const keywords = metaKeywords
			? metaKeywords
					.getAttribute('content')
					?.split(',')
					.map((k) => k.trim())
			: null;

		// Clean content
		if (contentElement) {
			// Remove empty elements
			const emptyElements = contentElement.querySelectorAll('*:empty:not(img):not(input):not(textarea):not(br):not(hr)');
			emptyElements.forEach((el) => el.remove());

			// Convert to markdown-like text
			let content = processElement(contentElement);

			// Clean up whitespace
			content = content
				.replace(/\n\s*\n\s*\n/g, '\n\n')
				.replace(/[ \t]+/g, ' ')
				.trim();

			return {
				title,
				description,
				keywords,
				content,
				url: window.location.href
			};
		}

		return null;
	});

	return data;
}

/**
 * Process DOM element to markdown-like text (runs in browser context)
 */
function processElement(element) {
	let result = '';

	for (const node of element.childNodes) {
		if (node.nodeType === Node.TEXT_NODE) {
			const text = node.textContent.trim();
			if (text) {
				result += text + ' ';
			}
		} else if (node.nodeType === Node.ELEMENT_NODE) {
			const tagName = node.tagName.toLowerCase();

			switch (tagName) {
				case 'h1':
					result += '\n# ' + node.textContent.trim() + '\n\n';
					break;
				case 'h2':
					result += '\n## ' + node.textContent.trim() + '\n\n';
					break;
				case 'h3':
					result += '\n### ' + node.textContent.trim() + '\n\n';
					break;
				case 'h4':
					result += '\n#### ' + node.textContent.trim() + '\n\n';
					break;
				case 'h5':
					result += '\n##### ' + node.textContent.trim() + '\n\n';
					break;
				case 'h6':
					result += '\n###### ' + node.textContent.trim() + '\n\n';
					break;
				case 'p':
					result += '\n' + node.textContent.trim() + '\n\n';
					break;
				case 'ul':
				case 'ol':
					result += '\n' + processListElement(node) + '\n';
					break;
				case 'li':
					// Handled by processListElement
					break;
				case 'a':
					const href = node.getAttribute('href');
					const text = node.textContent.trim();
					if (href && text) {
						result += `[${text}](${href})`;
					} else {
						result += text;
					}
					break;
				case 'strong':
				case 'b':
					result += '**' + node.textContent.trim() + '**';
					break;
				case 'em':
				case 'i':
					result += '*' + node.textContent.trim() + '*';
					break;
				case 'code':
					result += '`' + node.textContent.trim() + '`';
					break;
				case 'pre':
					result += '\n```\n' + node.textContent.trim() + '\n```\n\n';
					break;
				case 'blockquote':
					const lines = node.textContent.trim().split('\n');
					result += '\n' + lines.map((line) => '> ' + line.trim()).join('\n') + '\n\n';
					break;
				case 'table':
					result += '\n' + processTableElement(node) + '\n\n';
					break;
				case 'br':
					result += '\n';
					break;
				case 'hr':
					result += '\n---\n\n';
					break;
				default:
					// For other elements, just get the text content
					const textContent = node.textContent.trim();
					if (textContent) {
						result += textContent + ' ';
					}
					break;
			}
		}
	}

	return result;
}

/**
 * Process list elements (runs in browser context)
 */
function processListElement(listElement) {
	let result = '';
	const items = listElement.querySelectorAll('li');
	const isOrdered = listElement.tagName.toLowerCase() === 'ol';

	items.forEach((item, index) => {
		const prefix = isOrdered ? `${index + 1}. ` : '- ';
		const text = item.textContent.trim();
		if (text) {
			result += prefix + text + '\n';
		}
	});

	return result;
}

/**
 * Process table elements (runs in browser context)
 */
function processTableElement(tableElement) {
	let result = '';
	const rows = tableElement.querySelectorAll('tr');

	rows.forEach((row, rowIndex) => {
		const cells = row.querySelectorAll('th, td');
		const cellTexts = Array.from(cells).map((cell) => cell.textContent.trim());

		if (cellTexts.length > 0) {
			result += '| ' + cellTexts.join(' | ') + ' |\n';

			// Add separator row after header
			if (rowIndex === 0 && row.querySelector('th')) {
				result += '| ' + cellTexts.map(() => '---').join(' | ') + ' |\n';
			}
		}
	});

	return result;
}

/**
 * Find documentation links to crawl
 */
async function findDocumentationLinks(page, baseUrl) {
	const links = await page.evaluate((baseUrl) => {
		const linkElements = document.querySelectorAll('a[href]');
		const links = [];

		linkElements.forEach((link) => {
			const href = link.getAttribute('href');
			if (href) {
				try {
					const url = new URL(href, window.location.href);

					// Only include links from the same domain
					if (url.hostname === new URL(baseUrl).hostname) {
						// Clean URL (remove hash and query params for crawling)
						url.hash = '';
						url.search = '';
						links.push(url.toString());
					}
				} catch {
					// Ignore invalid URLs
				}
			}
		});

		return [...new Set(links)]; // Remove duplicates
	}, baseUrl);

	return links;
}

/**
 * Save scraped content
 */
async function saveScrapedContent(scrapedPages, outputPath) {
	console.log('📝 Saving scraped content...');

	// Create consolidated content
	let consolidatedContent = '';

	for (const page of scrapedPages) {
		const fileName = generateFileName(page.url);

		// Build frontmatter
		let frontmatter = `---
title: "${page.title.replace(/"/g, '\\"')}"
url: "${page.url}"`;

		if (page.description) {
			frontmatter += `
description: "${page.description.replace(/"/g, '\\"')}"`;
		}

		if (page.keywords && Array.isArray(page.keywords) && page.keywords.length > 0) {
			frontmatter += `
keywords:`;
			page.keywords.forEach((keyword) => {
				frontmatter += `
  - "${keyword.replace(/"/g, '\\"')}"`;
			});
		}

		frontmatter += `
---`;

		const mdxContent = `${frontmatter}

# ${page.title}

${page.content}
`;

		// Save individual file
		await fs.writeFile(path.join(outputPath, `${fileName}.mdx`), mdxContent, 'utf8');

		// Add to consolidated content
		consolidatedContent += `# ${page.title}\n\nURL: ${page.url}\n`;
		if (page.description) {
			consolidatedContent += `Description: ${page.description}\n`;
		}
		if (page.keywords && page.keywords.length > 0) {
			consolidatedContent += `Keywords: ${page.keywords.join(', ')}\n`;
		}
		consolidatedContent += `\n${page.content}\n\n---\n\n`;
	}

	// Save consolidated content
	await fs.writeFile(path.join(outputPath, 'sei-docs-consolidated.txt'), consolidatedContent, 'utf8');

	// Save structured JSON
	await fs.writeFile(path.join(outputPath, 'sei-docs-structured.json'), JSON.stringify(scrapedPages, null, 2), 'utf8');

	console.log(`📄 Created consolidated text file: ${outputPath}/sei-docs-consolidated.txt`);
	console.log(`📋 Created structured JSON file: ${outputPath}/sei-docs-structured.json`);
	console.log(`📁 Created ${scrapedPages.length} individual .mdx files`);
}

/**
 * Generate filename from URL
 */
function generateFileName(url) {
	try {
		const urlObj = new URL(url);
		let pathname = urlObj.pathname;

		// Remove leading/trailing slashes and replace special chars
		pathname = pathname.replace(/^\/+|\/+$/g, '');
		pathname = pathname.replace(/[/\\:*?"<>|]/g, '-');
		pathname = pathname.replace(/-+/g, '-');

		return pathname || 'index';
	} catch {
		return 'page-' + Date.now();
	}
}

// Run the scraper
scrapeRenderedDocs();
