// scripts/check-pages.mjs
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { globby } from 'globby';
import fetch from 'node-fetch';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PAGES_DIR = path.join(__dirname, '../pages');

async function getAllFiles() {
	const files = await globby(['**/*.{md,mdx}'], {
		cwd: PAGES_DIR,
		ignore: ['_*.{md,mdx}', 'api/**'] // Ignore Next.js special files and API routes
	});

	return files.map((file) => path.join(PAGES_DIR, file));
}

async function extractLinks(content) {
	const mdLinks = Array.from(content.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)).map((match) => match[2]);

	return mdLinks.filter((link) => !link.startsWith('http') && !link.startsWith('#') && !link.startsWith('mailto:'));
}

async function checkLink(link) {
	try {
		// Convert relative path to URL
		const urlPath = link.replace(/\.mdx?$/, '');
		const url = new URL(urlPath, 'http://localhost:3000').toString();

		const response = await fetch(url);
		const isError = response.status === 404;

		return {
			link,
			status: response.status,
			isError,
			message: isError ? 'Page returns 404' : null
		};
	} catch (error) {
		return {
			link,
			status: 0,
			isError: true,
			message: error.message
		};
	}
}

async function main() {
	const files = await getAllFiles();
	const brokenLinks = [];

	console.log(`Found ${files.length} documentation files in pages directory`);

	for (const file of files) {
		const relativePath = path.relative(PAGES_DIR, file);
		const content = await fs.readFile(file, 'utf-8');
		const links = await extractLinks(content);

		if (links.length > 0) {
			console.log(`\nChecking ${links.length} links in ${relativePath}...`);

			for (const link of links) {
				const result = await checkLink(link);

				if (result.isError) {
					brokenLinks.push({
						file: relativePath,
						...result
					});
					console.log(`❌ ${link} - ${result.message}`);
				} else {
					console.log(`✓ ${link}`);
				}
			}
		}
	}

	if (brokenLinks.length > 0) {
		console.error('\n🚨 Found broken links:');
		brokenLinks.forEach(({ file, link, status, message }) => {
			console.error(`\nIn file: ${file}`);
			console.error(`Broken link: ${link}`);
			console.error(`Status: ${status}`);
			if (message) console.error(`Error: ${message}`);
		});
		process.exit(1);
	} else {
		console.log('\n✅ All links are valid!');
	}
}

main().catch((error) => {
	console.error('Script failed:', error);
	process.exit(1);
});
