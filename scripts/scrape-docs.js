const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
const { URL } = require('url');

async function scrapeSeiDocs() {
	const baseUrl = 'http://localhost:3000';
	const outputPath = './scraped-docs';
	const visitedUrls = new Set();
	const scrapedPages = [];
	const concurrencyLimit = 5; // Number of parallel pages

	try {
		console.log('🚀 Starting documentation scraping...');
		console.log('Make sure your dev server is running on http://localhost:3000');

		// Ensure output directory exists
		await fs.mkdir(outputPath, { recursive: true });

		// Launch browser
		console.log('🌐 Launching browser...');
		const browser = await puppeteer.launch({
			headless: true,
			args: ['--no-sandbox', '--disable-setuid-sandbox']
		});

		// Get all possible URLs from file structure
		const allUrls = await generateUrlsFromFileStructure(baseUrl);

		// Add main sections to ensure they're included
		const mainSections = [baseUrl, `${baseUrl}/learn`, `${baseUrl}/evm`, `${baseUrl}/cosmos-sdk`, `${baseUrl}/node`, `${baseUrl}`];

		// Combine and deduplicate URLs
		const urlsToScrape = [...new Set([...mainSections, ...allUrls])];
		console.log(`📋 Total URLs to scrape: ${urlsToScrape.length}`);

		// Scrape URLs in parallel with controlled concurrency
		await scrapeUrlsInParallel(browser, urlsToScrape, baseUrl, scrapedPages, concurrencyLimit);

		await browser.close();

		console.log(`✅ Successfully scraped ${scrapedPages.length} pages`);

		// Save individual files and create consolidated content
		await saveScrapedContent(scrapedPages, outputPath);

		console.log('✨ Documentation scraping complete!');
	} catch (error) {
		console.error('❌ Error scraping documentation:', error);
		process.exit(1);
	}
}

async function scrapeUrlsInParallel(browser, urls, baseUrl, scrapedPages, concurrencyLimit) {
	const chunks = [];

	// Split URLs into chunks for controlled concurrency
	for (let i = 0; i < urls.length; i += concurrencyLimit) {
		chunks.push(urls.slice(i, i + concurrencyLimit));
	}

	console.log(`🔄 Scraping ${urls.length} URLs in ${chunks.length} batches of ${concurrencyLimit}`);

	for (let i = 0; i < chunks.length; i++) {
		const chunk = chunks[i];
		console.log(`📦 Processing batch ${i + 1}/${chunks.length} (${chunk.length} URLs)`);

		// Create promises for this batch
		const batchPromises = chunk.map(async (url) => {
			const page = await browser.newPage();

			try {
				// Set viewport and user agent
				await page.setViewport({ width: 1200, height: 800 });
				await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');

				const pageData = await scrapeSinglePage(page, url, baseUrl);

				if (pageData) {
					scrapedPages.push(pageData);
				}
			} catch (error) {
				console.warn(`⚠️  Failed to scrape ${url}:`, error.message);
			} finally {
				await page.close();
			}
		});

		// Wait for this batch to complete before starting the next
		await Promise.all(batchPromises);

		// Small delay between batches to be gentle on the server
		if (i < chunks.length - 1) {
			await new Promise((resolve) => setTimeout(resolve, 500));
		}
	}
}

async function scrapeSinglePage(page, url, baseUrl) {
	// Skip if not a docs URL
	if (!url.startsWith(baseUrl)) {
		return null;
	}

	console.log(`📄 Scraping: ${url}`);

	try {
		await page.goto(url, {
			waitUntil: 'networkidle0',
			timeout: 30000
		});

		// Wait for content to load
		await new Promise((resolve) => setTimeout(resolve, 200));

		// Extract page content
		const pageData = await page.evaluate(() => {
			// Remove navigation, headers, footers, and other non-content elements
			const elementsToRemove = [
				'nav',
				'header',
				'footer',
				'.nx-sidebar',
				'.nx-toc',
				'.nx-nav-container',
				'[data-nextra-nav]',
				'[data-nextra-sidebar]',
				'.nextra-nav-container',
				'.nextra-sidebar',
				'button',
				'.search',
				'#search'
			];

			elementsToRemove.forEach((selector) => {
				const elements = document.querySelectorAll(selector);
				elements.forEach((el) => el.remove());
			});

			// Get the main content area
			const mainContent =
				document.querySelector('main') ||
				document.querySelector('.nx-content') ||
				document.querySelector('[data-nextra-content]') ||
				document.querySelector('.nextra-content') ||
				document.body;

			const title = document.title || document.querySelector('h1')?.textContent || 'Untitled';
			const content = mainContent ? mainContent.innerText.trim() : '';

			return { title, content };
		});

		// Only return pages with substantial content
		if (pageData.content && pageData.content.length > 50) {
			return {
				url,
				title: pageData.title,
				content: pageData.content
			};
		}

		return null;
	} catch (error) {
		throw error;
	}
}

async function saveScrapedContent(scrapedPages, outputPath) {
	console.log('📝 Saving scraped content...');

	// Create consolidated content for LLM training
	let consolidatedContent = '';

	for (const page of scrapedPages) {
		const fileName = generateFileName(page.url);
		const mdxContent = `---
title: "${page.title}"
url: "${page.url}"
---

# ${page.title}

${page.content}
`;

		// Save individual file
		await fs.writeFile(path.join(outputPath, `${fileName}.mdx`), mdxContent, 'utf8');

		// Add to consolidated content
		consolidatedContent += `# ${page.title}\n\nURL: ${page.url}\n\n${page.content}\n\n---\n\n`;
	}

	// Save consolidated content
	await fs.writeFile(path.join(outputPath, 'sei-docs-consolidated.txt'), consolidatedContent, 'utf8');

	// Save structured JSON
	await fs.writeFile(path.join(outputPath, 'sei-docs-structured.json'), JSON.stringify(scrapedPages, null, 2), 'utf8');

	console.log(`📄 Created consolidated text file: ${outputPath}/sei-docs-consolidated.txt`);
	console.log(`📋 Created structured JSON file: ${outputPath}/sei-docs-structured.json`);
	console.log(`📁 Created ${scrapedPages.length} individual .mdx files`);
}

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

async function generateUrlsFromFileStructure(baseUrl) {
	const urls = new Set();
	const contentDir = './content';

	try {
		const fs = require('fs');

		// Recursively find all .mdx files and convert to URLs
		function findMdxFiles(dir, basePath = '') {
			const items = fs.readdirSync(dir);

			for (const item of items) {
				const fullPath = path.join(dir, item);
				const stat = fs.statSync(fullPath);

				if (stat.isDirectory() && !item.startsWith('_')) {
					findMdxFiles(fullPath, basePath + '/' + item);
				} else if (item.endsWith('.mdx') && item !== 'index.mdx') {
					const urlPath = basePath + '/' + item.replace('.mdx', '');
					urls.add(baseUrl + urlPath);
				} else if (item === 'index.mdx' && basePath) {
					urls.add(baseUrl + basePath);
				}
			}
		}

		if (fs.existsSync(contentDir)) {
			findMdxFiles(contentDir);
		}

		console.log(`📋 Generated ${urls.size} URLs from file structure`);
	} catch (error) {
		console.warn('⚠️  Could not generate URLs from file structure:', error.message);
	}

	return Array.from(urls);
}

// Run the scraper
scrapeSeiDocs();
