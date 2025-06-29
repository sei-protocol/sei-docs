const puppeteer = require('puppeteer-core');
const fs = require('fs').promises;
const path = require('path');
const { URL } = require('url');
const { spawn } = require('child_process');
const net = require('net');

/**
 * Top‑level entry
 */
async function scrapeSeiDocs() {
	const port = 3000;
	const localBaseUrl = `http://localhost:${port}`;
	const prodBaseUrl = 'https://docs.sei.io';
	const outputPath = './public/_scraped-docs';
	const scrapedPages = [];
	let devServer;

	try {
		console.log('🚀  Starting documentation scraping…');
		await fs.mkdir(outputPath, { recursive: true });

		console.log(`🌟  Booting Next.js server on :${port}`);
		devServer = await startDevServer(port);

		const browser = await launchBrowser();

		// Generate list of URLs to scrape
		const allUrls = await generateUrlsFromFileStructure(localBaseUrl);
		const main = [`${localBaseUrl}/learn`, `${localBaseUrl}/evm`, `${localBaseUrl}/cosmos-sdk`, `${localBaseUrl}/node`, `${localBaseUrl}`];
		const urls = [...new Set([...main, ...allUrls])];

		console.log(`📋  Total URLs: ${urls.length}`);
		await scrapeUrlsSequential(browser, urls, localBaseUrl, prodBaseUrl, scrapedPages);

		await browser.close();
		console.log(`✅  Scraped ${scrapedPages.length} pages`);

		await saveScrapedContent(scrapedPages, outputPath);
	} catch (err) {
		console.error('❌  Fatal error:', err);
		process.exit(1);
	} finally {
		if (devServer) {
			console.log('🛑  Shutting dev server');
			devServer.kill();
			await new Promise((r) => setTimeout(r, 1_000));
		}
	}
}

/**
 * Sequential scraping with a single re‑used page (Rec. #4),
 * blocking images/fonts/css (Rec. #3) and retry/back‑off.
 */
async function scrapeUrlsSequential(browser, urls, localBaseUrl, prodBaseUrl, scrapedPages) {
	const page = await browser.newPage();

	// Intercept requests – drop heavy assets (Rec. #3)
	await page.setRequestInterception(true);
	page.on('request', (req) => {
		const type = req.resourceType();
		if (['image', 'font', 'stylesheet', 'media'].includes(type)) {
			return req.abort();
		}
		req.continue();
	});

	const MAX_RETRIES = 3;

	for (let i = 0; i < urls.length; i++) {
		const url = urls[i];
		console.log(`➡️  (${i + 1}/${urls.length}) ${url}`);

		for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
			try {
				await page.goto(url, {
					waitUntil: 'domcontentloaded', // lighter than networkidle
					timeout: 60_000
				});

				const pageData = await extractPageData(page, url, localBaseUrl, prodBaseUrl);
				if (pageData) {
					scrapedPages.push(pageData);
					console.log(`   ✅  Done (${pageData.content.length} chars)`);
				}
				break; // success – break retry loop
			} catch (err) {
				console.warn(`   ⏳  Attempt ${attempt}/${MAX_RETRIES} failed: ${err.message}`);
				if (attempt === MAX_RETRIES) console.warn(`   ❌  Giving up on ${url}`);
				else await new Promise((r) => setTimeout(r, attempt * 2_000)); // back‑off
			}
		}
	}

	await page.close();
}

/**
 * Extract text + metadata once the page is loaded.
 */
async function extractPageData(page, url, localBaseUrl, prodBaseUrl) {
	// Only docs URLs
	if (!url.startsWith(localBaseUrl)) return null;

	const pageData = await page.evaluate(() => {
		const selectorsToNuke = ['nav', 'header', 'footer', '.nx-sidebar', '.nx-toc', '[data-nextra-nav]', '[data-nextra-sidebar]', 'button', '.search', '#search'];
		selectorsToNuke.forEach((sel) => document.querySelectorAll(sel).forEach((el) => el.remove()));

		const main = document.querySelector('main') || document.body;
		return {
			title: document.title || (document.querySelector('h1')?.textContent ?? 'Untitled'),
			content: main.innerText.trim()
		};
	});

	// filter empty pages
	if (!pageData.content || pageData.content.length < 50) return null;
	const prodUrl = url.replace(localBaseUrl, prodBaseUrl);
	const originalMetadata = await getOriginalMetadata(url, localBaseUrl);

	return {
		url: prodUrl,
		title: originalMetadata?.title || pageData.title,
		description: originalMetadata?.description || null,
		keywords: originalMetadata?.keywords || null,
		content: pageData.content
	};
}

async function scrapeSinglePage(page, url, localBaseUrl, prodBaseUrl) {
	// Skip if not a docs URL
	if (!url.startsWith(localBaseUrl)) {
		return null;
	}

	console.log(`📄 Scraping: ${url}`);

	try {
		await page.goto(url, {
			waitUntil: 'networkidle0', // Faster loading for better performance
			timeout: 30000 // Optimized timeout for reliability
		});

		// Wait for content to load
		await new Promise((resolve) => setTimeout(resolve, 1000));

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
			// Convert localhost URL to production URL
			const prodUrl = url.replace(localBaseUrl, prodBaseUrl);

			// Get original metadata from source file
			const originalMetadata = await getOriginalMetadata(url, localBaseUrl);

			return {
				url: prodUrl,
				title: originalMetadata?.title || pageData.title,
				description: originalMetadata?.description || null,
				keywords: originalMetadata?.keywords || null,
				content: pageData.content,
				originalMetadata
			};
		}

		return null;
	} catch (error) {
		throw error;
	}
}

async function getOriginalMetadata(url, localBaseUrl) {
	try {
		// Convert URL to file path
		const urlPath = url.replace(localBaseUrl, '');
		let filePath = path.join('./content', urlPath);

		// Handle index files
		if (urlPath === '' || urlPath === '/') {
			filePath = './content/index.mdx';
		} else if (!urlPath.includes('.')) {
			// Try both direct file and index file
			const directFile = filePath + '.mdx';
			const indexFile = path.join(filePath, 'index.mdx');

			// Check which file exists
			try {
				await fs.access(directFile);
				filePath = directFile;
			} catch {
				try {
					await fs.access(indexFile);
					filePath = indexFile;
				} catch {
					return null; // No source file found
				}
			}
		}

		// Read the source file
		const fileContent = await fs.readFile(filePath, 'utf8');

		// Extract frontmatter
		const frontmatterMatch = fileContent.match(/^---\n([\s\S]*?)\n---/);
		if (!frontmatterMatch) {
			return null; // No frontmatter found
		}

		const frontmatterContent = frontmatterMatch[1];
		const metadata = {};

		// Parse YAML-like frontmatter manually (basic parsing)
		const lines = frontmatterContent.split('\n');
		let currentKey = null;
		let currentValue = '';
		let inArray = false;

		for (const line of lines) {
			const trimmedLine = line.trim();
			if (!trimmedLine) continue;

			if (trimmedLine.startsWith('- ')) {
				// Array item
				if (inArray && currentKey) {
					if (!metadata[currentKey]) metadata[currentKey] = [];
					metadata[currentKey].push(trimmedLine.slice(2).replace(/['"]/g, ''));
				}
			} else if (trimmedLine.includes(':')) {
				// Save previous key-value pair
				if (currentKey && currentValue) {
					metadata[currentKey] = currentValue.replace(/['"]/g, '');
				}

				// New key-value pair
				const [key, ...valueParts] = trimmedLine.split(':');
				currentKey = key.trim();
				currentValue = valueParts.join(':').trim();

				// Check if this starts an array
				if (currentValue === '' || currentValue === '[') {
					inArray = true;
					metadata[currentKey] = [];
				} else {
					inArray = false;
					if (currentValue.startsWith('[') && currentValue.endsWith(']')) {
						// Inline array
						const items = currentValue
							.slice(1, -1)
							.split(',')
							.map((item) => item.trim().replace(/['"]/g, ''));
						metadata[currentKey] = items;
						currentKey = null;
						currentValue = '';
					}
				}
			}
		}

		// Save the last key-value pair
		if (currentKey && currentValue && !inArray) {
			metadata[currentKey] = currentValue.replace(/['"]/g, '');
		}

		return metadata;
	} catch (error) {
		console.warn(`⚠️  Could not read metadata for ${url}:`, error.message);
		return null;
	}
}

async function saveScrapedContent(scrapedPages, outputPath) {
	console.log('📝 Saving scraped content...');

	// Create consolidated content for LLM training
	let consolidatedContent = '';

	for (const page of scrapedPages) {
		const fileName = generateFileName(page.url);

		// Build frontmatter with original metadata
		let frontmatter = `---
title: "${page.title}"
url: "${page.url}"`;

		if (page.description) {
			// Escape quotes in description
			const escapedDescription = page.description.replace(/"/g, '\\"');
			frontmatter += `
description: "${escapedDescription}"`;
		}

		if (page.keywords && Array.isArray(page.keywords) && page.keywords.length > 0) {
			frontmatter += `
keywords:`;
			page.keywords.forEach((keyword) => {
				frontmatter += `
  - "${keyword}"`;
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

		// Add to consolidated content with metadata
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

async function startDevServer(port = 3001) {
	return new Promise((resolve, reject) => {
		// Start the Next.js development server on specified port
		const server = spawn('npx', ['next', 'start', '--port', port.toString()], {
			stdio: ['ignore', 'pipe', 'pipe'],
			env: { ...process.env, PORT: port.toString() }
		});

		let serverReady = false;

		// Listen for server output to detect when it's ready
		server.stdout.on('data', (data) => {
			const output = data.toString();
			console.log(`📡 Server (${port}):`, output.trim());

			// Check if server is ready
			if (output.includes('Ready in') || output.includes('ready') || output.includes(`http://localhost:${port}`)) {
				if (!serverReady) {
					serverReady = true;
					// Wait a bit more to ensure server is fully ready
					setTimeout(() => resolve(server), 3000);
				}
			}
		});

		server.stderr.on('data', (data) => {
			const errorOutput = data.toString();
			console.error(`📡 Server Error (${port}):`, errorOutput);

			// Don't reject on warnings, only on actual startup failures
			if (errorOutput.includes('EADDRINUSE') || errorOutput.includes('Error:')) {
				if (!serverReady) {
					reject(new Error(`Server startup failed: ${errorOutput}`));
				}
			}
		});

		server.on('error', (error) => {
			reject(new Error(`Failed to start server: ${error.message}`));
		});

		server.on('exit', (code) => {
			if (!serverReady) {
				reject(new Error(`Server exited with code ${code} before becoming ready`));
			}
		});

		// Timeout after 45 seconds (longer for potential build time)
		setTimeout(() => {
			if (!serverReady) {
				server.kill();
				reject(new Error('Server startup timeout - check if port is available'));
			}
		}, 45000);
	});
}

async function launchBrowser() {
	const isVercel = Boolean(process.env.VERCEL || process.env.NOW_BUILDER);
	let browser;

	if (!isVercel) {
		const puppeteer = require('puppeteer');
		browser = await puppeteer.launch({
			headless: 'new',
			protocolTimeout: 120_000,
			args: [
				'--single-process',
				'--no-zygote',
				'--disable-gpu',
				'--disable-dev-shm-usage',
				'--no-sandbox',
				'--disable-setuid-sandbox',
				'--disable-background-networking',
				'--disable-extensions'
			],
			defaultViewport: { width: 1280, height: 720 }
		});
	} else {
		const puppeteerCore = require('puppeteer-core');
		let chromium = require('@sparticuz/chromium-min');
		chromium = chromium.default ?? chromium;
		chromium.setHeadlessMode = true;
		chromium.setGraphicsMode = false;
		const remotePack = 'https://github.com/Sparticuz/chromium/releases/download/v137.0.1/chromium-v137.0.1-pack.x64.tar';
		const executablePath = typeof chromium.executablePath === 'function' ? await chromium.executablePath(remotePack) : await chromium.executablePath;

		browser = await puppeteerCore.launch({
			executablePath,
			headless: 'shell',
			protocolTimeout: 120_000,
			ignoreHTTPSErrors: true,
			args: [
				...chromium.args,
				'--single-process',
				'--no-zygote',
				'--disable-gpu',
				'--disable-dev-shm-usage',
				'--no-sandbox',
				'--disable-setuid-sandbox',
				'--disable-background-networking',
				'--disable-extensions'
			],
			defaultViewport: { width: 1280, height: 720 }
		});
	}

	// Fatal‑error diagnostics (Rec. #5)
	if (browser.process && browser.process()) {
		browser.process().stderr.on('data', (buf) => {
			const msg = buf.toString();
			if (/FATAL|OOM|zygote/i.test(msg)) {
				console.error('⚠️  Chromium fatal error:', msg);
			}
		});
	}

	return browser;
}

// Run the scraper
scrapeSeiDocs();
