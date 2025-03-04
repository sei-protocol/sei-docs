const { execSync, spawn } = require('child_process');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const SITE_URL = 'http://localhost:3000';
const OUTPUT_DIR = './out/_pagefind';
const ROUTES_FILE = './out/routes.json';
const TEMP_DIR = path.join(process.cwd(), './out/temp-static');

async function main() {
	console.log('Starting deferred PageFind indexing...');
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
		await new Promise((resolve) => setTimeout(resolve, 5000));

		// 2. Launch headless browser
		console.log('Launching headless browser...');
		browser = await puppeteer.launch({
			headless: true,
			args: ['--no-sandbox', '--disable-setuid-sandbox']
		});

		// 3. Read routes from routes file
		console.log('Reading routes from file...');
		if (!fs.existsSync(ROUTES_FILE)) {
			throw new Error(`Routes file not found at ${ROUTES_FILE}`);
		}
		const routes = JSON.parse(fs.readFileSync(ROUTES_FILE, 'utf8'));

		// 4. Create temporary directory for rendered HTML
		console.log('Creating temporary directory...');
		if (fs.existsSync(TEMP_DIR)) {
			fs.rmSync(TEMP_DIR, { recursive: true, force: true });
		}
		fs.mkdirSync(TEMP_DIR, { recursive: true });

		// 5. Render and save each page
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
				await new Promise((resolve) => setTimeout(resolve, 200));

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

		// 7. Run PageFind on the rendered HTML
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
		// 8. Clean up
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
