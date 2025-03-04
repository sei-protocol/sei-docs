const fs = require('fs');
const path = require('path');

// Configuration
const PAGES_DIR = './out';
const OUTPUT_FILE = './out/routes.json';

// Function to recursively get all HTML file routes
function getRoutes(dir, routes = [], basePath = '') {
	const files = fs.readdirSync(dir, { withFileTypes: true });

	for (const file of files) {
		const filePath = path.join(dir, file.name);

		if (file.isDirectory()) {
			// Skip special directories if needed
			if (file.name === 'api' || file.name === 'public') {
				continue;
			}

			// Handle dynamic routes (keeping the same convention)
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

// Generate and save routes
const routes = getRoutes(PAGES_DIR);
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(routes, null, 2));
console.log(`Generated ${routes.length} routes from HTML files to ${OUTPUT_FILE}`);
