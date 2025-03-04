const { execSync } = require('child_process');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuration
const SITE_URL = 'http://localhost:3000';
const OUTPUT_DIR = './out/pagefind';
const ROUTES_FILE = './out/routes.json';

async function main() {
	console.log('Starting deferred PageFind indexing...');

	// 1. Start your Next.js server
	console.log('Starting Next.js server...');
	const server = require('child_process').spawn('yarn', ['run', 'start'], {
		stdio: 'inherit',
		detached: true
	});

	// Give server time to start
	await new Promise((resolve) => setTimeout(resolve, 5000));

	try {
		// 2. Launch headless browser
		console.log('Launching headless browser...');
		const browser = await puppeteer.launch({
			headless: true
		});

		// 3. Read routes from routes file
		const routes = JSON.parse(fs.readFileSync(ROUTES_FILE, 'utf8'));

		// 4. Create temporary directory for rendered HTML
		const tempDir = path.join(process.cwd(), './out/temp-static');
		if (!fs.existsSync(tempDir)) {
			fs.mkdirSync(tempDir, { recursive: true });
		}

		// 5. Render and save each page
		console.log('Rendering pages...');
		for (const route of routes) {
			console.log(`Rendering ${route}...`);
			const page = await browser.newPage();

			// Navigate to the page
			await page.goto(`${SITE_URL}${route}`, {
				waitUntil: 'networkidle0' // Wait until all content is loaded
			});

			// Wait a bit longer for any delayed JavaScript execution
			await new Promise((resolve) => setTimeout(resolve, 2000));

			// Get the fully rendered HTML
			const html = await page.content();

			// Create directory structure for the route
			const routePath = route === '/' ? '/index' : route;
			const outputPath = path.join(tempDir, routePath);
			fs.mkdirSync(path.dirname(outputPath), { recursive: true });

			// Save the HTML
			fs.writeFileSync(`${outputPath}.html`, html);

			await page.close();
		}

		// 6. Close browser
		await browser.close();

		// 7. Run PageFind on the rendered HTML
		console.log('Running PageFind on rendered HTML...');
		execSync(`npx pagefind --source ${tempDir} --output-path ${OUTPUT_DIR}`, {
			stdio: 'inherit'
		});

		console.log('PageFind indexing complete!');
	} catch (error) {
		console.error('Error during indexing:', error);
	} finally {
		// 8. Clean up
		console.log('Cleaning up...');
		process.kill(-server.pid); // Kill the server
	}
}

main();
