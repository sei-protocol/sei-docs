const fs = require('fs').promises;
const path = require('path');
const { JSDOM } = require('jsdom');

// Configuration for parallel processing
const CONCURRENCY_LIMIT = 20; // Number of files to process simultaneously

/**
 * Scrape documentation from the built HTML files in .next/server/app
 */
async function scrapeBuiltHtml() {
	const buildDir = './.next/server/app';
	const outputPath = './public/_scraped-docs';
	const scrapedPages = [];

	try {
		console.log('🚀 Starting built HTML documentation scraping...');
		await fs.mkdir(outputPath, { recursive: true });

		// Find all HTML files in the build directory
		const htmlFiles = await findHtmlFiles(buildDir);
		console.log(`📋 Found ${htmlFiles.length} HTML files`);

		// Process files in parallel with concurrency limit
		const processedPages = await processFilesInParallel(htmlFiles, buildDir);

		// Filter out null results (failed or skipped files)
		scrapedPages.push(...processedPages.filter((page) => page !== null));

		console.log(`✅ Successfully processed ${scrapedPages.length} pages out of ${htmlFiles.length} total files`);
		await saveScrapedContent(scrapedPages, outputPath);
	} catch (err) {
		console.error('❌ Fatal error:', err);
		process.exit(1);
	}
}

/**
 * Process files in parallel with concurrency limiting
 */
async function processFilesInParallel(htmlFiles, buildDir) {
	const results = [];
	let completed = 0;
	let errors = 0;

	// Create chunks for parallel processing
	const chunks = [];
	for (let i = 0; i < htmlFiles.length; i += CONCURRENCY_LIMIT) {
		chunks.push(htmlFiles.slice(i, i + CONCURRENCY_LIMIT));
	}

	console.log(`🔄 Processing ${htmlFiles.length} files in ${chunks.length} chunks of max ${CONCURRENCY_LIMIT} files each`);

	// Process each chunk in parallel
	for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
		const chunk = chunks[chunkIndex];
		const chunkStartTime = Date.now();

		console.log(`\n📦 Processing chunk ${chunkIndex + 1}/${chunks.length} (${chunk.length} files)`);

		// Process all files in the current chunk simultaneously
		const chunkPromises = chunk.map(async (filePath, fileIndex) => {
			const globalIndex = chunkIndex * CONCURRENCY_LIMIT + fileIndex + 1;

			try {
				console.log(`   ➡️ (${globalIndex}/${htmlFiles.length}) Starting: ${filePath}`);

				const pageData = await processHtmlFile(filePath, buildDir);

				if (pageData) {
					console.log(`   ✅ (${globalIndex}/${htmlFiles.length}) Done: ${path.basename(filePath)} (${pageData.content.length} chars)`);
					completed++;
					return pageData;
				} else {
					console.log(`   ⚠️ (${globalIndex}/${htmlFiles.length}) Skipped: ${path.basename(filePath)} (no content or too short)`);
					completed++;
					return null;
				}
			} catch (error) {
				console.warn(`   ❌ (${globalIndex}/${htmlFiles.length}) Error processing ${path.basename(filePath)}:`, error.message);
				errors++;
				return null;
			}
		});

		// Wait for all files in this chunk to complete
		const chunkResults = await Promise.all(chunkPromises);
		results.push(...chunkResults);

		const chunkDuration = ((Date.now() - chunkStartTime) / 1000).toFixed(2);
		const successCount = chunkResults.filter((r) => r !== null).length;

		console.log(`   📊 Chunk ${chunkIndex + 1} completed in ${chunkDuration}s - Success: ${successCount}/${chunk.length}`);
		console.log(
			`   📈 Overall progress: ${completed + errors}/${htmlFiles.length} files processed (${(((completed + errors) / htmlFiles.length) * 100).toFixed(1)}%)`
		);
	}

	console.log(`\n🏁 Parallel processing complete!`);
	console.log(`   ✅ Successfully processed: ${completed} files`);
	console.log(`   ❌ Errors: ${errors} files`);
	console.log(`   📄 Total valid pages: ${results.filter((r) => r !== null).length}`);

	return results;
}

/**
 * Recursively find all HTML files in the build directory
 */
async function findHtmlFiles(dir, htmlFiles = []) {
	const items = await fs.readdir(dir);

	for (const item of items) {
		const fullPath = path.join(dir, item);
		const stat = await fs.stat(fullPath);

		if (stat.isDirectory()) {
			await findHtmlFiles(fullPath, htmlFiles);
		} else if (item.endsWith('.html') && !item.startsWith('_')) {
			htmlFiles.push(fullPath);
		}
	}

	return htmlFiles;
}

/**
 * Process a single HTML file
 */
async function processHtmlFile(filePath, buildDir) {
	try {
		const htmlContent = await fs.readFile(filePath, 'utf8');

		// Create DOM from HTML
		const dom = new JSDOM(htmlContent);
		const document = dom.window.document;

		// Generate URL from file path
		const url = generateUrlFromPath(filePath, buildDir);

		// Extract metadata
		const title = extractTitle(document);
		const description = extractDescription(document);
		const keywords = extractKeywords(document);

		// Extract and clean content
		const content = extractAndCleanContent(document);

		if (!content || content.length < 100) {
			return null; // Skip pages with little content
		}

		return {
			url: `https://docs.sei.io${url}`,
			title,
			description,
			keywords,
			content,
			filePath
		};
	} catch (error) {
		console.warn(`Could not process ${filePath}:`, error.message);
		return null;
	}
}

/**
 * Generate URL from file path
 */
function generateUrlFromPath(filePath, buildDir) {
	// Normalize the buildDir to handle different path formats
	const normalizedBuildDir = buildDir.replace(/^\.\//, '');

	// Remove the build directory prefix and .html extension
	let url = filePath.replace(normalizedBuildDir, '').replace(/\.html$/, '');

	// Convert file system path to URL path
	url = url.replace(/\\/g, '/'); // Convert backslashes to forward slashes

	// Remove leading slash if present
	if (url.startsWith('/')) {
		url = url.substring(1);
	}

	// Handle index files and root
	if (url === 'index' || url === '') {
		return '/';
	}

	// Ensure it starts with /
	return '/' + url;
}

/**
 * Extract title from document
 */
function extractTitle(document) {
	// Try different methods to get the title
	const titleElement = document.querySelector('h1');
	if (titleElement) {
		return titleElement.textContent.trim();
	}

	const metaTitle = document.querySelector('title');
	if (metaTitle) {
		return metaTitle.textContent.replace(' | Sei Docs', '').trim();
	}

	return 'Untitled';
}

/**
 * Extract description from document
 */
function extractDescription(document) {
	const metaDesc = document.querySelector('meta[name="description"]');
	if (metaDesc) {
		return metaDesc.getAttribute('content');
	}

	const ogDesc = document.querySelector('meta[property="og:description"]');
	if (ogDesc) {
		return ogDesc.getAttribute('content');
	}

	return null;
}

/**
 * Extract keywords from document
 */
function extractKeywords(document) {
	const metaKeywords = document.querySelector('meta[name="keywords"]');
	if (metaKeywords) {
		const keywords = metaKeywords.getAttribute('content');
		return keywords ? keywords.split(',').map((k) => k.trim()) : null;
	}
	return null;
}

/**
 * Extract and clean content from document
 */
function extractAndCleanContent(document) {
	// Remove navigation, headers, footers and other non-content elements
	const elementsToRemove = [
		'nav',
		'header',
		'footer',
		'[role="navigation"]',
		'[role="banner"]',
		'[role="contentinfo"]',
		'.sidebar',
		'.nav',
		'.navigation',
		'.header',
		'.footer',
		'.breadcrumb',
		'.pagination',
		'.toc',
		'.table-of-contents',
		'script',
		'style',
		'noscript',
		'link[rel="stylesheet"]',
		'button:not(.copy-button)', // Keep copy buttons as they indicate code
		'.search',
		'#search',
		'[data-search]',
		'.nx-sidebar',
		'.nx-toc',
		'.nx-nav-container',
		'[data-nextra-nav]',
		'[data-nextra-sidebar]',
		'.nextra-nav-container',
		'.nextra-sidebar'
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
		document.querySelector('.nx-content') ||
		document.querySelector('[data-nextra-content]') ||
		document.body;

	if (!contentElement) {
		return null;
	}

	// Unroll tabs - make all tab content visible
	unrollTabContent(contentElement);

	// Remove empty elements
	const emptyElements = contentElement.querySelectorAll('*:empty:not(img):not(input):not(textarea):not(br):not(hr)');
	emptyElements.forEach((el) => el.remove());

	// Convert HTML to markdown-like text
	const content = htmlToMarkdown(contentElement);

	// Clean up whitespace
	return content
		.replace(/\n\s*\n\s*\n/g, '\n\n')
		.replace(/[ \t]+/g, ' ')
		.replace(/^\s+|\s+$/gm, '')
		.trim();
}

/**
 * Unroll tab content to make all tabs visible in sequence
 */
function unrollTabContent(contentElement) {
	console.log('Unrolling tab content...');

	// 1. Handle Nextra-specific tab patterns first
	const nextraTabGroups = contentElement.querySelectorAll('.nextra-tabs, [data-tabs]');
	console.log(`Found ${nextraTabGroups.length} Nextra tab groups`);

	nextraTabGroups.forEach((tabGroup) => {
		// Find all tab panels within this group
		const tabPanels = tabGroup.querySelectorAll('[role="tabpanel"], .tab-panel, [data-tab-panel]');
		const tabButtons = tabGroup.querySelectorAll('[role="tab"], .tab-button, [data-tab]');

		console.log(`Processing tab group with ${tabPanels.length} panels and ${tabButtons.length} buttons`);

		tabPanels.forEach((panel, index) => {
			// Remove hidden attribute and any hiding styles
			panel.removeAttribute('hidden');
			panel.style.display = 'block';
			panel.style.visibility = 'visible';
			panel.style.opacity = '1';
			panel.setAttribute('data-state', 'active');

			// Remove any transform or position styles that might hide content
			panel.style.transform = '';
			panel.style.position = '';
			panel.style.left = '';
			panel.style.top = '';

			// Try to find the corresponding tab button for labeling
			let tabLabel = '';
			if (tabButtons[index]) {
				tabLabel = tabButtons[index].textContent.trim();
			} else {
				// Try to find by aria-labelledby
				const labelledBy = panel.getAttribute('aria-labelledby');
				if (labelledBy) {
					const labelElement = contentElement.querySelector(`#${labelledBy}`);
					if (labelElement) {
						tabLabel = labelElement.textContent.trim();
					}
				}
			}

			// Add a header to identify the tab section if we found a label
			if (tabLabel && !panel.querySelector('h4, h3, h2')) {
				const headerEl = contentElement.ownerDocument.createElement('h3');
				headerEl.textContent = tabLabel;
				headerEl.style.marginTop = '2rem';
				headerEl.style.marginBottom = '1rem';
				headerEl.style.fontWeight = 'bold';
				headerEl.style.fontSize = '1.25em';
				panel.insertBefore(headerEl, panel.firstChild);
				console.log(`Added header for Nextra tab: ${tabLabel}`);
			}
		});
	});

	// 2. Handle Radix UI tabs specifically
	const radixTabPanels = contentElement.querySelectorAll('[role="tabpanel"]');
	console.log(`Found ${radixTabPanels.length} Radix tab panels`);

	radixTabPanels.forEach((panel, index) => {
		// Remove hidden attribute and any hiding styles
		panel.removeAttribute('hidden');
		panel.style.display = '';
		panel.style.visibility = 'visible';
		panel.style.opacity = '1';
		panel.setAttribute('data-state', 'active');

		// Find the corresponding tab trigger to get the label
		const triggerId = panel.getAttribute('aria-labelledby');
		if (triggerId) {
			// Escape CSS selector safely
			const escapedId = triggerId.replace(/"/g, '\\"').replace(/'/g, "\\'");
			const trigger = contentElement.querySelector(`#${escapedId}`);
			if (trigger) {
				const tabLabel = trigger.textContent.trim();
				if (tabLabel && !panel.querySelector('h4')) {
					// Add a header to identify the tab section
					const headerEl = contentElement.ownerDocument.createElement('h4');
					headerEl.textContent = tabLabel;
					headerEl.style.marginTop = '2rem';
					headerEl.style.marginBottom = '1rem';
					headerEl.style.fontWeight = 'bold';
					headerEl.style.fontSize = '1.25em';
					panel.insertBefore(headerEl, panel.firstChild);
					console.log(`Added header for tab: ${tabLabel}`);
				}
			}
		}
	});

	// 3. Handle any elements with data-state="inactive"
	const inactiveElements = contentElement.querySelectorAll('[data-state="inactive"]');
	console.log(`Found ${inactiveElements.length} inactive elements`);

	inactiveElements.forEach((el) => {
		el.setAttribute('data-state', 'active');
		el.removeAttribute('hidden');
		el.style.display = '';
		el.style.visibility = 'visible';
		el.style.opacity = '1';
	});

	// 4. Handle any elements with hidden attribute
	const hiddenElements = contentElement.querySelectorAll('[hidden]');
	console.log(`Found ${hiddenElements.length} hidden elements`);

	hiddenElements.forEach((el) => {
		// Only unhide if it looks like substantial content (not just UI elements)
		const textContent = el.textContent.trim();
		if (textContent.length > 50 || el.querySelector('pre, code, h1, h2, h3, h4, h5, h6')) {
			el.removeAttribute('hidden');
			el.style.display = '';
			el.style.visibility = 'visible';
			el.style.opacity = '1';
			console.log(`Unhid element with ${textContent.length} chars of content`);
		}
	});

	// 5. Look for any CSS-hidden content
	const hiddenByStyle = contentElement.querySelectorAll('[style*="display: none"], [style*="display:none"]');
	console.log(`Found ${hiddenByStyle.length} CSS-hidden elements`);

	hiddenByStyle.forEach((el) => {
		const textContent = el.textContent.trim();
		if (textContent.length > 50 || el.querySelector('pre, code, h1, h2, h3, h4, h5, h6')) {
			el.style.display = '';
			el.style.visibility = 'visible';
			el.style.opacity = '1';
			console.log(`Unhid CSS-hidden element with ${textContent.length} chars of content`);
		}
	});

	// 6. Handle any other tab-like patterns
	const genericTabPanels = contentElement.querySelectorAll('.tab-content, .tab-panel, [class*="tabcontent"], [class*="TabContent"]');

	genericTabPanels.forEach((panel) => {
		panel.style.display = '';
		panel.style.visibility = 'visible';
		panel.style.opacity = '1';
		panel.removeAttribute('hidden');
	});

	console.log('Tab unrolling complete');
}

/**
 * Convert HTML element to markdown-like text
 */
function htmlToMarkdown(element) {
	let result = '';

	// Process each child node
	for (const node of element.childNodes) {
		if (node.nodeType === 3) {
			// Text node - handle with context awareness
			const text = node.textContent;
			if (text.trim()) {
				// Preserve significant whitespace but normalize
				const normalizedText = text.replace(/\s+/g, ' ');
				result += normalizedText;
			}
		} else if (node.nodeType === 1) {
			// Element node
			const tagName = node.tagName.toLowerCase();

			switch (tagName) {
				case 'h1':
					result += ensureNewlines(result, 2) + '# ' + node.textContent.trim() + '\n\n';
					break;
				case 'h2':
					result += ensureNewlines(result, 2) + '## ' + node.textContent.trim() + '\n\n';
					break;
				case 'h3':
					result += ensureNewlines(result, 2) + '### ' + node.textContent.trim() + '\n\n';
					break;
				case 'h4':
					result += ensureNewlines(result, 2) + '#### ' + node.textContent.trim() + '\n\n';
					break;
				case 'h5':
					result += ensureNewlines(result, 2) + '##### ' + node.textContent.trim() + '\n\n';
					break;
				case 'h6':
					result += ensureNewlines(result, 2) + '###### ' + node.textContent.trim() + '\n\n';
					break;
				case 'p':
					const pText = node.textContent.trim();
					if (pText) {
						result += ensureNewlines(result, 1) + pText + '\n\n';
					}
					break;
				case 'ul':
				case 'ol':
					result += ensureNewlines(result, 1) + processListElement(node) + '\n';
					break;
				case 'li':
					// Handled by processListElement
					break;
				case 'a':
					const href = node.getAttribute('href');
					const text = node.textContent.trim();
					if (href && text) {
						result += `[${text}](${href})`;
					} else if (text) {
						result += text;
					}
					break;
				case 'strong':
				case 'b':
					const strongText = node.textContent.trim();
					if (strongText) {
						result += '**' + strongText + '**';
					}
					break;
				case 'em':
				case 'i':
					const emText = node.textContent.trim();
					if (emText) {
						result += '*' + emText + '*';
					}
					break;
				case 'code':
					const codeText = node.textContent.trim();
					if (codeText) {
						result += '`' + codeText + '`';
					}
					break;
				case 'pre':
					const preText = node.textContent.trim();
					if (preText) {
						result += ensureNewlines(result, 1) + '```\n' + preText + '\n```\n\n';
					}
					break;
				case 'blockquote':
					const quoteText = node.textContent.trim();
					if (quoteText) {
						const lines = quoteText.split('\n');
						result += ensureNewlines(result, 1) + lines.map((line) => '> ' + line.trim()).join('\n') + '\n\n';
					}
					break;
				case 'table':
					result += ensureNewlines(result, 1) + processTableElement(node) + '\n\n';
					break;
				case 'br':
					result += '\n';
					break;
				case 'hr':
					result += ensureNewlines(result, 2) + '---\n\n';
					break;
				case 'div':
				case 'section':
				case 'article':
					// Check if this is a block-level container that should add spacing
					const hasBlockContent = node.querySelector('h1, h2, h3, h4, h5, h6, p, ul, ol, pre, blockquote, table');
					if (hasBlockContent) {
						result += ensureNewlines(result, 1) + htmlToMarkdown(node) + '\n';
					} else {
						// Inline container
						result += htmlToMarkdown(node);
					}
					break;
				case 'span':
					// Always inline
					result += htmlToMarkdown(node);
					break;
				case 'dt':
					result += ensureNewlines(result, 1) + '**' + node.textContent.trim() + '**\n';
					break;
				case 'dd':
					result += node.textContent.trim() + '\n\n';
					break;
				case 'dl':
					result += ensureNewlines(result, 1) + htmlToMarkdown(node) + '\n';
					break;
				default:
					// For other elements, check if they might be important containers
					if (node.children && node.children.length > 0) {
						// If it has children, process them
						const childContent = htmlToMarkdown(node);
						if (childContent.trim()) {
							result += childContent;
						}
					} else {
						// For leaf elements, get text content
						const textContent = node.textContent.trim();
						if (textContent) {
							result += textContent;
						}
					}
					break;
			}
		}
	}

	return result;
}

/**
 * Ensure the result has the specified number of newlines at the end
 */
function ensureNewlines(text, count) {
	const trailingNewlines = (text.match(/\n*$/)?.[0] || '').length;
	const needed = Math.max(0, count - trailingNewlines);
	return '\n'.repeat(needed);
}

/**
 * Process list elements
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
 * Process table elements
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
url: "${page.url}"
file_path: "${page.filePath}"`;

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
		consolidatedContent += `# ${page.title}\n\nURL: ${page.url}\nFile: ${page.filePath}\n`;
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
scrapeBuiltHtml();
