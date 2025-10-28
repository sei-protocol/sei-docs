import fs from 'fs/promises';
import path from 'path';

const CONTENT_DIR = path.resolve('./content');
const OUTPUT_JSON = path.resolve('./public/_seo-audit.json');

async function findMdxFiles(dir) {
	const dirents = await fs.readdir(dir, { withFileTypes: true });
	const files = [];
	for (const d of dirents) {
		const full = path.join(dir, d.name);
		if (d.isDirectory()) {
			files.push(...(await findMdxFiles(full)));
		} else if (d.isFile() && d.name.endsWith('.mdx')) {
			files.push(full);
		}
	}
	return files;
}

function extractFrontmatter(content) {
	const match = content.match(/^---\n([\s\S]*?)\n---/);
	if (!match) return null;
	const body = match[1];
	const lines = body.split('\n');
	const meta = {};
	let currentKey = null;
	let inArray = false;
	let arrayValues = [];
	for (const raw of lines) {
		const line = raw.trim();
		if (!line) continue;
		const keyVal = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
		if (keyVal && !inArray) {
			if (currentKey && inArray) {
				meta[currentKey] = arrayValues;
				arrayValues = [];
			}
			currentKey = keyVal[1];
			const val = keyVal[2];
			if (val === '' || val === '|') {
				meta[currentKey] = '';
			} else if (val === 'true' || val === 'false') {
				meta[currentKey] = val === 'true';
			} else if (val.startsWith('[') && val.endsWith(']')) {
				try {
					meta[currentKey] = JSON.parse(val.replace(/'/g, '"'));
				} catch {
					meta[currentKey] = val;
				}
			} else if (val === '-') {
				inArray = true;
				arrayValues = [];
			} else {
				meta[currentKey] = val.replace(/^['"]|['"]$/g, '');
			}
		} else if (inArray) {
			if (line.startsWith('- ')) {
				arrayValues.push(line.slice(2).replace(/^['"]|['"]$/g, ''));
			} else {
				inArray = false;
				if (currentKey) meta[currentKey] = arrayValues;
				arrayValues = [];
			}
		}
	}
	if (currentKey && inArray) meta[currentKey] = arrayValues;
	return meta;
}

function stripFrontmatter(content) {
	return content.replace(/^---[\s\S]*?---\n?/, '');
}

function countWords(text) {
	const cleaned = text
		.replace(/```[\s\S]*?```/g, ' ')
		.replace(/<[^>]+>/g, ' ')
		.replace(/\{\/[\s\S]*?\}/g, ' ')
		.replace(/\s+/g, ' ') // collapse whitespace
		.trim();
	if (!cleaned) return 0;
	return cleaned.split(' ').length;
}

function normalizeTitle(title) {
	if (!title) return '';
	return title
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

async function main() {
	const files = await findMdxFiles(CONTENT_DIR);
	const results = [];
	const titleIndex = new Map();

	for (const file of files) {
		const raw = await fs.readFile(file, 'utf8');
		const fm = extractFrontmatter(raw) || {};
		const body = stripFrontmatter(raw);
		const words = countWords(body);
		const titleKey = normalizeTitle(fm.title || '');

		results.push({
			file,
			url:
				'https://docs.sei.io' +
				file
					.replace(CONTENT_DIR, '')
					.replace(/index\.mdx$/, '')
					.replace(/\.mdx$/, ''),
			hasFrontmatter: Boolean(extractFrontmatter(raw)),
			title: fm.title || null,
			description: fm.description || null,
			date: fm.date || null,
			updated: fm.updated || null,
			canonical: fm.canonical || null,
			noindex: fm.noindex === true,
			words,
			isThin: words < 200
		});

		if (titleKey) {
			const arr = titleIndex.get(titleKey) || [];
			arr.push(file);
			titleIndex.set(titleKey, arr);
		}
	}

	const duplicates = [];
	for (const [key, group] of titleIndex.entries()) {
		if (group.length > 1) {
			duplicates.push({ titleSlug: key, files: group });
		}
	}

	const report = {
		generatedAt: new Date().toISOString(),
		totals: {
			mdxCount: files.length,
			withFrontmatter: results.filter((r) => r.hasFrontmatter).length,
			thinPages: results.filter((r) => r.isThin).length,
			missingDescriptions: results.filter((r) => !r.description).length
		},
		duplicates,
		pages: results
	};

	await fs.writeFile(OUTPUT_JSON, JSON.stringify(report, null, 2));
	// eslint-disable-next-line no-console
	console.log(`SEO audit written to ${OUTPUT_JSON}`);
}

main().catch((err) => {
	// eslint-disable-next-line no-console
	console.error(err);
	process.exit(1);
});
