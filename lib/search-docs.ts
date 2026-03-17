import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

interface DocEntry {
	id: string;
	title: string;
	url: string;
	description: string;
	keywords: string[];
	content: string;
}

interface SearchResult {
	title: string;
	url: string;
	description: string;
	content: string;
	score: number;
}

const SCRAPED_DOCS_DIR = join(process.cwd(), 'public', '_scraped-docs');

let docsCache: DocEntry[] | null = null;

async function loadDocs(): Promise<DocEntry[]> {
	if (docsCache) return docsCache;

	const files = await readdir(SCRAPED_DOCS_DIR);
	const mdxFiles = files.filter((f) => f.endsWith('.mdx'));

	const docs: DocEntry[] = [];
	for (const fileName of mdxFiles) {
		const raw = await readFile(join(SCRAPED_DOCS_DIR, fileName), 'utf8');

		const titleMatch = raw.match(/^title:\s*"(.+?)"/m);
		const urlMatch = raw.match(/^url:\s*"(.+?)"/m);
		const descMatch = raw.match(/^description:\s*"(.+?)"/m);
		const keywordsMatch = raw.match(/^keywords:\n((?:\s+-\s*".+?"\n?)+)/m);

		const keywords: string[] = [];
		if (keywordsMatch) {
			for (const m of keywordsMatch[1].matchAll(/"(.+?)"/g)) {
				keywords.push(m[1].toLowerCase());
			}
		}

		const body = raw.replace(/^---[\s\S]*?---\s*/, '').trim();

		docs.push({
			id: fileName.replace('.mdx', ''),
			title: titleMatch?.[1] ?? fileName.replace('.mdx', ''),
			url: urlMatch?.[1] ?? `https://docs.sei.io/${fileName.replace('.mdx', '')}`,
			description: descMatch?.[1] ?? '',
			keywords,
			content: body
		});
	}

	docsCache = docs;
	return docs;
}

function tokenize(text: string): string[] {
	return text
		.toLowerCase()
		.replace(/[^\w\s]/g, ' ')
		.split(/\s+/)
		.filter((w) => w.length > 1);
}

export async function searchDocs(query: string, topK = 5): Promise<SearchResult[]> {
	const docs = await loadDocs();
	const queryTokens = tokenize(query);

	if (queryTokens.length === 0) return [];

	const scored = docs.map((doc) => {
		const titleLower = doc.title.toLowerCase();
		const contentLower = doc.content.toLowerCase();
		const descLower = doc.description.toLowerCase();

		let score = 0;

		for (const token of queryTokens) {
			if (titleLower.includes(token)) score += 10;
			if (doc.keywords.includes(token)) score += 5;
			if (descLower.includes(token)) score += 3;

			const contentMatches = contentLower.split(token).length - 1;
			score += Math.min(contentMatches, 10);
		}

		// Bonus for exact multi-word phrase match in title or description
		const phraseLC = query.toLowerCase();
		if (titleLower.includes(phraseLC)) score += 20;
		if (descLower.includes(phraseLC)) score += 10;

		return { doc, score };
	});

	return scored
		.filter((s) => s.score > 0)
		.sort((a, b) => b.score - a.score)
		.slice(0, topK)
		.map(({ doc, score }) => ({
			title: doc.title,
			url: doc.url,
			description: doc.description,
			content: doc.content.slice(0, 500),
			score: Math.min(score / (queryTokens.length * 15), 1)
		}));
}
