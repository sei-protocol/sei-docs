const fs = require('fs').promises;
const path = require('path');

const SCRAPED_DOCS_DIR = path.join(process.cwd(), 'public', '_scraped-docs');
const OUTPUT_PATH = path.join(process.cwd(), 'lib', 'search-index.json');

const STOP_WORDS = new Set([
	'a',
	'an',
	'the',
	'is',
	'are',
	'was',
	'were',
	'be',
	'been',
	'being',
	'have',
	'has',
	'had',
	'do',
	'does',
	'did',
	'will',
	'would',
	'could',
	'should',
	'may',
	'might',
	'shall',
	'can',
	'to',
	'of',
	'in',
	'for',
	'on',
	'with',
	'at',
	'by',
	'from',
	'as',
	'into',
	'through',
	'during',
	'before',
	'after',
	'above',
	'below',
	'between',
	'out',
	'off',
	'over',
	'under',
	'again',
	'further',
	'then',
	'once',
	'here',
	'there',
	'when',
	'where',
	'why',
	'how',
	'all',
	'each',
	'every',
	'both',
	'few',
	'more',
	'most',
	'other',
	'some',
	'such',
	'no',
	'nor',
	'not',
	'only',
	'own',
	'same',
	'so',
	'than',
	'too',
	'very',
	'just',
	'because',
	'but',
	'and',
	'or',
	'if',
	'while',
	'about',
	'up',
	'its',
	'it',
	'this',
	'that',
	'these',
	'those',
	'i',
	'me',
	'my',
	'we',
	'our',
	'you',
	'your',
	'he',
	'him',
	'his',
	'she',
	'her',
	'they',
	'them',
	'their',
	'what',
	'which',
	'who',
	'whom'
]);

function stem(word) {
	if (word.length < 4) return word;
	if (word.endsWith('ies') && word.length > 4) return word.slice(0, -3) + 'y';
	if (word.endsWith('ves') && word.length > 4) return word.slice(0, -3) + 'f';
	if (word.endsWith('ing') && word.length > 5) {
		const base = word.slice(0, -3);
		if (base.endsWith(base[base.length - 1]) && base.length > 2) return base.slice(0, -1);
		return base;
	}
	if (word.endsWith('tion') || word.endsWith('sion')) return word.slice(0, -3);
	if (word.endsWith('ment') && word.length > 5) return word.slice(0, -4);
	if (word.endsWith('ness') && word.length > 5) return word.slice(0, -4);
	if (word.endsWith('able') && word.length > 5) return word.slice(0, -4);
	if (word.endsWith('ible') && word.length > 5) return word.slice(0, -4);
	if (word.endsWith('ally') && word.length > 5) return word.slice(0, -4);
	if (word.endsWith('ful') && word.length > 5) return word.slice(0, -3);
	if (word.endsWith('ous') && word.length > 5) return word.slice(0, -3);
	if (word.endsWith('ize') && word.length > 5) return word.slice(0, -3);
	if (word.endsWith('ise') && word.length > 5) return word.slice(0, -3);
	if (word.endsWith('ity') && word.length > 5) return word.slice(0, -3);
	if (word.endsWith('ed') && word.length > 4) {
		const base = word.slice(0, -2);
		if (base.endsWith(base[base.length - 1]) && base.length > 2) return base.slice(0, -1);
		return base;
	}
	if (word.endsWith('er') && word.length > 4) return word.slice(0, -2);
	if (word.endsWith('ly') && word.length > 4) return word.slice(0, -2);
	if (word.endsWith('es') && word.length > 4) return word.slice(0, -2);
	if (word.endsWith('s') && !word.endsWith('ss') && word.length > 3) return word.slice(0, -1);
	return word;
}

function tokenize(text) {
	return text
		.toLowerCase()
		.replace(/[^\w\s-]/g, ' ')
		.split(/\s+/)
		.filter((w) => w.length > 1 && !STOP_WORDS.has(w))
		.map(stem);
}

function countFreq(tokens) {
	const freq = {};
	for (const t of tokens) {
		freq[t] = (freq[t] || 0) + 1;
	}
	return freq;
}

function splitIntoSections(body, docId, title, url, description) {
	const sections = [];
	const headingRegex = /^#{1,3}\s+(.+)$/gm;
	const headings = [];
	let match;

	while ((match = headingRegex.exec(body)) !== null) {
		headings.push({ index: match.index, heading: match[1].trim() });
	}

	if (headings.length === 0) {
		const combined = `${title}. ${description}. ${body}`;
		const tokens = tokenize(combined);
		sections.push({
			docId,
			title,
			url,
			sectionHeading: title,
			content: body,
			tokenFreq: countFreq(tokens),
			length: tokens.length
		});
		return sections;
	}

	for (let i = 0; i < headings.length; i++) {
		const start = headings[i].index;
		const end = i + 1 < headings.length ? headings[i + 1].index : body.length;
		const sectionContent = body.slice(start, end).trim();

		if (sectionContent.length < 30) continue;

		const combined = `${title} ${headings[i].heading} ${sectionContent}`;
		const tokens = tokenize(combined);

		sections.push({
			docId,
			title,
			url,
			sectionHeading: headings[i].heading,
			content: sectionContent,
			tokenFreq: countFreq(tokens),
			length: tokens.length
		});
	}

	if (sections.length === 0) {
		const combined = `${title}. ${description}. ${body}`;
		const tokens = tokenize(combined);
		sections.push({
			docId,
			title,
			url,
			sectionHeading: title,
			content: body,
			tokenFreq: countFreq(tokens),
			length: tokens.length
		});
	}

	return sections;
}

async function buildIndex() {
	console.log('Building search index...');

	let files;
	try {
		files = await fs.readdir(SCRAPED_DOCS_DIR);
	} catch {
		console.warn('No scraped docs found at', SCRAPED_DOCS_DIR, '— skipping search index build.');
		return;
	}

	const mdxFiles = files.filter((f) => f.endsWith('.mdx'));
	console.log(`Found ${mdxFiles.length} documents`);

	const allSections = [];

	for (const fileName of mdxFiles) {
		const raw = await fs.readFile(path.join(SCRAPED_DOCS_DIR, fileName), 'utf8');

		const titleMatch = raw.match(/^title:\s*"(.+?)"/m);
		const urlMatch = raw.match(/^url:\s*"(.+?)"/m);
		const descMatch = raw.match(/^description:\s*"(.+?)"/m);

		const docId = fileName.replace('.mdx', '');
		const title = titleMatch?.[1] ?? docId;
		const url = urlMatch?.[1] ?? `https://docs.sei.io/${docId}`;
		const description = descMatch?.[1] ?? '';
		const body = raw.replace(/^---[\s\S]*?---\s*/, '').trim();

		const sections = splitIntoSections(body, docId, title, url, description);
		allSections.push(...sections);
	}

	const N = allSections.length;
	const df = {};
	for (const sec of allSections) {
		const seen = new Set(Object.keys(sec.tokenFreq));
		for (const t of seen) {
			df[t] = (df[t] || 0) + 1;
		}
	}

	const idf = {};
	for (const [term, freq] of Object.entries(df)) {
		idf[term] = Math.log((N - freq + 0.5) / (freq + 0.5) + 1);
	}

	const avgDl = allSections.reduce((sum, s) => sum + s.length, 0) / N;

	const index = { sections: allSections, idf, avgDl };

	await fs.writeFile(OUTPUT_PATH, JSON.stringify(index));

	const sizeMB = (Buffer.byteLength(JSON.stringify(index)) / 1024 / 1024).toFixed(2);
	console.log(`Search index built: ${allSections.length} sections, ${Object.keys(idf).length} terms, ${sizeMB} MB`);
}

buildIndex().catch((err) => {
	console.error('Failed to build search index:', err);
	process.exit(1);
});
