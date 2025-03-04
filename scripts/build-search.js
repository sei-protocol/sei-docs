const { execSync, spawn } = require('child_process');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const SITE_URL = 'http://localhost:3000';
const TEMP_DIR = path.join(process.cwd(), './out/temp-static');
const PAGES_DIR = './out';
const OUTPUT_DIR = PAGES_DIR + '/_pagefind';

// Function to recursively get all HTML file routes
function getRoutes(dir, routes = [], basePath = '') {
	const files = fs.readdirSync(dir, { withFileTypes: true });
	for (const file of files) {
		const filePath = path.join(dir, file.name);
		if (file.isDirectory()) {
			if (file.name === 'api' || file.name === 'public') {
				continue;
			}

			let routePath = file.name;
			if (file.name.startsWith('[') && file.name.endsWith(']')) {
				routePath = ':' + file.name.slice(1, -1);
			}
			getRoutes(filePath, routes, path.join(basePath, routePath));
		} else if (file.name.endsWith('.html')) {
			// Process HTML files
			let route = path.join(basePath, file.name === 'index.html' ? '' : file.name.replace('.html', ''));
			// Handle index routes
			if (route === '') {
				route = '/';
			} else if (!route.startsWith('/')) {
				route = '/' + route;
			}
			routes.push(route);
		}
	}
	return routes;
}

async function main() {
	console.log('Starting routes generation and PageFind indexing...');

	// Generate routes
	console.log('Generating routes...');
	const routes = getRoutes(PAGES_DIR);
	console.log(`Generated ${routes.length} routes from HTML files`);

	let server = null;
	let browser = null;
	try {
		// 1. Start Next.js server
		console.log('Starting Next.js server...');
		server = spawn('yarn', ['run', 'start'], {
			stdio: 'inherit',
			detached: true
		});

		// Give server time to start
		await new Promise((resolve) => setTimeout(resolve, 10000));

		// 2. Launch headless browser
		console.log('Launching headless browser...');
		browser = await puppeteer.launch({
			headless: true,
			args: ['--no-sandbox', '--disable-setuid-sandbox']
		});

		// 3. Create temporary directory for rendered HTML
		console.log('Creating temporary directory...');
		if (fs.existsSync(TEMP_DIR)) {
			fs.rmSync(TEMP_DIR, { recursive: true, force: true });
		}
		fs.mkdirSync(TEMP_DIR, { recursive: true });

		// 4. Render and save each page
		console.log('Rendering pages...');
		for (const route of routes) {
			console.log(`Rendering ${route}...`);
			const page = await browser.newPage();
			try {
				// Navigate to the page
				await page.goto(`${SITE_URL}${route}`, {
					waitUntil: 'networkidle0', // Wait until all content is loaded
					timeout: 60000 // 60 second timeout
				});

				// Wait a bit longer for any delayed JavaScript execution
				await new Promise((resolve) => setTimeout(resolve, 100));

				// Get the fully rendered HTML
				const html = await page.content();

				// Create directory structure for the route
				const routePath = route === '/' ? '/index' : route;
				const outputPath = path.join(TEMP_DIR, routePath);
				fs.mkdirSync(path.dirname(outputPath), { recursive: true });

				// Save the HTML
				fs.writeFileSync(`${outputPath}.html`, html);
			} catch (pageError) {
				console.error(`Error rendering ${route}:`, pageError.message);
			} finally {
				await page.close();
			}
		}

		// 5. Run PageFind on the rendered HTML
		console.log('Running PageFind on rendered HTML...');
		if (!fs.existsSync(path.dirname(OUTPUT_DIR))) {
			fs.mkdirSync(path.dirname(OUTPUT_DIR), { recursive: true });
		}
		execSync(`npx pagefind --site ${TEMP_DIR} --output-path ${OUTPUT_DIR}`, {
			stdio: 'inherit'
		});

		console.log('PageFind indexing complete!');
	} catch (error) {
		console.error('Error during indexing:', error);
		process.exitCode = 1;
	} finally {
		// 6. Clean up
		console.log('Cleaning up...');

		// Close browser if it was opened
		if (browser) {
			try {
				await browser.close();
				console.log('Browser closed successfully');
			} catch (err) {
				console.error('Error closing browser:', err.message);
			}
		}

		// Kill the server properly
		if (server) {
			try {
				process.kill(-server.pid, 'SIGTERM');
				console.log('Server terminated successfully');
			} catch (err) {
				console.error('Error terminating server:', err.message);
			}
		}

		// Clean up temporary directory
		try {
			if (fs.existsSync(TEMP_DIR)) {
				fs.rmSync(TEMP_DIR, { recursive: true, force: true });
				console.log('Temporary directory removed');
			}
		} catch (err) {
			console.error('Error removing temporary directory:', err.message);
		}
	}
}

// Handle unexpected termination
process.on('SIGINT', () => {
	console.log('Process interrupted, cleaning up...');
	process.exit();
});

process.on('SIGTERM', () => {
	console.log('Process terminated, cleaning up...');
	process.exit();
});

main();
