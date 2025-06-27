const puppeteer = require('puppeteer-core');
const fs = require('fs').promises;
const path = require('path');
const { URL } = require('url');
const { spawn } = require('child_process');
const net = require('net');

async function scrapeSeiDocs() {
	// Find an available port starting from 3001
	const port = await findAvailablePort(3001);
	const localBaseUrl = `http://localhost:${port}`;
	const prodBaseUrl = 'https://docs.sei.io'; // Use production URL for final output
	const outputPath = './public/_scraped-docs';
	const visitedUrls = new Set();
	const scrapedPages = [];
	let devServer = null;

	try {
		console.log('🚀 Starting documentation scraping...');

		// Ensure output directory exists
		await fs.mkdir(outputPath, { recursive: true });

		// Start dedicated server for scraping
		console.log(`🌟 Starting dedicated server on port ${port}...`);
		devServer = await startDevServer(port);
		console.log('✅ Dedicated server is ready!');

		// Launch browser
		console.log('🌐 Launching browser...');
		const browser = await launchBrowser();

		// Get all possible URLs from file structure
		const allUrls = await generateUrlsFromFileStructure(localBaseUrl);

		// Add main sections to ensure they're included
		const mainSections = [`${localBaseUrl}/learn`, `${localBaseUrl}/evm`, `${localBaseUrl}/cosmos-sdk`, `${localBaseUrl}/node`, `${localBaseUrl}`];

		// Combine and deduplicate URLs
		const urlsToScrape = [...new Set([...mainSections, ...allUrls])];
		console.log(`📋 Total URLs to scrape: ${urlsToScrape.length}`);

		// Scrape all URLs concurrently
		await scrapeUrlsConcurrently(browser, urlsToScrape, localBaseUrl, prodBaseUrl, scrapedPages);

		await browser.close();

		console.log(`✅ Successfully scraped ${scrapedPages.length} pages`);

		// Save individual files and create consolidated content
		await saveScrapedContent(scrapedPages, outputPath);

		console.log('✨ Documentation scraping complete!');
	} catch (error) {
		console.error('❌ Error scraping documentation:', error);
		process.exit(1);
	} finally {
		// Clean up: stop the dedicated server
		if (devServer) {
			console.log('🛑 Stopping dedicated server...');
			devServer.kill();
			// Give it a moment to clean up
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}
	}
}

async function scrapeUrlsConcurrently(browser, urls, localBaseUrl, prodBaseUrl, scrapedPages) {
	console.log(`🔄 Scraping ${urls.length} URLs with controlled concurrency`);

	// Use conservative processing settings optimized for performance
	const batchSize = 3; // Smaller batches for better stability
	const pauseTime = 500; // Longer pauses for better reliability

	console.log(`📊 Using batch size: ${batchSize}, pause time: ${pauseTime}ms`);

	for (let i = 0; i < urls.length; i += batchSize) {
		const batch = urls.slice(i, i + batchSize);
		console.log(`📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(urls.length / batchSize)} (${batch.length} URLs)`);

		const batchPromises = batch.map(async (url) => {
			const page = await browser.newPage();

			try {
				// Set viewport and user agent
				await page.setViewport({ width: 1200, height: 800 });
				await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');

				// Set longer timeout for better reliability
				page.setDefaultTimeout(10000); // 90 seconds
				page.setDefaultNavigationTimeout(10000);

				const pageData = await scrapeSinglePage(page, url, localBaseUrl, prodBaseUrl);

				if (pageData) {
					scrapedPages.push(pageData);
					console.log(`✅ Scraped: ${url}`);
				}
			} catch (error) {
				console.warn(`⚠️  Failed to scrape ${url}:`, error.message);
			} finally {
				// Ensure page is properly closed
				try {
					await page.close();
				} catch (closeError) {
					console.warn(`⚠️  Error closing page: ${closeError.message}`);
				}
			}
		});

		// Wait for current batch to complete before starting next batch
		await Promise.all(batchPromises);

		// Brief pause between batches to let server breathe
		if (i + batchSize < urls.length) {
			await new Promise((resolve) => setTimeout(resolve, 2000));
		}
	}
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

async function findAvailablePort(startPort = 3001) {
	return new Promise((resolve, reject) => {
		const server = net.createServer();

		server.listen(startPort, () => {
			const port = server.address().port;
			server.close(() => {
				resolve(port);
			});
		});

		server.on('error', (err) => {
			if (err.code === 'EADDRINUSE') {
				// Port is in use, try the next one
				resolve(findAvailablePort(startPort + 1));
			} else {
				reject(err);
			}
		});
	});
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
	const isServerless = process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.VERCEL;
	// ─── 1.   try Sparticuz Chromium (works only on AWS-Linux-2) ───
	const chromium = require('@sparticuz/chromium');

	chromium.setHeadlessMode = true; // always headless in Lambda
	// chromium.setGraphicsMode = false; // uncomment to disable GPU compositing

	const extraFlags = [
		'--no-sandbox',
		'--disable-setuid-sandbox',
		'--disable-dev-shm-usage',
		'--window-size=1280x720',
		'--memory-pressure-off',
		'--max_old_space_size=4096',
		'--disable-background-networking',
		'--disable-default-apps',
		'--disable-extensions',
		'--disable-sync',
		'--disable-translate',
		'--hide-scrollbars',
		'--mute-audio',
		'--no-first-run',
		'--safebrowsing-disable-auto-update',
		'--single-process'
	];

	const chromiumExecutable =
		typeof chromium.executablePath === 'function'
			? await chromium.executablePath() // ≤ v135
			: chromium.executablePath; // ≥ v136 (string or null)

	if (chromiumExecutable) {
		const puppeteerCore = require('puppeteer-core');

		return puppeteerCore.launch({
			args: [...chromium.args, ...extraFlags],
			defaultViewport: chromium.defaultViewport,
			executablePath: chromiumExecutable,
			headless: chromium.headless,
			ignoreHTTPSErrors: true
		});
	}

	// ─── 2.   local fallback: full Puppeteer with your own Chrome ───
	console.warn('⚠️  Sparticuz Chromium not available on this platform; using full puppeteer instead.');

	const puppeteer = require('puppeteer'); // downloads its own Chrome (or uses channel=chrome on >=22)

	return puppeteer.launch({
		args: extraFlags,
		headless: true,
		// fastest on puppeteer ≥22:  headless: 'new'
		// If you already have Chrome installed and want to skip the download:
		// channel: 'chrome',
		ignoreHTTPSErrors: true
	});
}

// Run the scraper
scrapeSeiDocs();
