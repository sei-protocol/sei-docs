import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

interface DocSection {
	docId: string;
	title: string;
	url: string;
	sectionHeading: string;
	content: string;
	tokenFreq: Map<string, number>;
	length: number;
}

export interface SearchResult {
	title: string;
	url: string;
	description: string;
	content: string;
	score: number;
}

const SCRAPED_DOCS_DIR = join(process.cwd(), 'public', '_scraped-docs');

let sectionsCache: DocSection[] | null = null;
let idfCache: Map<string, number> | null = null;
let avgDlCache: number = 0;

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

function stem(word: string): string {
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

function tokenize(text: string): string[] {
	return text
		.toLowerCase()
		.replace(/[^\w\s-]/g, ' ')
		.split(/\s+/)
		.filter((w) => w.length > 1 && !STOP_WORDS.has(w))
		.map(stem);
}

function countFreq(tokens: string[]): Map<string, number> {
	const freq = new Map<string, number>();
	for (const t of tokens) {
		freq.set(t, (freq.get(t) || 0) + 1);
	}
	return freq;
}

function splitIntoSections(body: string, docId: string, title: string, url: string, description: string): DocSection[] {
	const sections: DocSection[] = [];
	const headingRegex = /^#{1,3}\s+(.+)$/gm;
	const headings: { index: number; heading: string }[] = [];
	let match;

	while ((match = headingRegex.exec(body)) !== null) {
		headings.push({ index: match.index, heading: match[1].trim() });
	}

	if (headings.length === 0) {
		const combined = `${title}. ${description}. ${body}`;
		const tokens = tokenize(combined);
		sections.push({ docId, title, url, sectionHeading: title, content: body, tokenFreq: countFreq(tokens), length: tokens.length });
		return sections;
	}

	for (let i = 0; i < headings.length; i++) {
		const start = headings[i].index;
		const end = i + 1 < headings.length ? headings[i + 1].index : body.length;
		const sectionContent = body.slice(start, end).trim();
		if (sectionContent.length < 30) continue;

		const combined = `${title} ${headings[i].heading} ${sectionContent}`;
		const tokens = tokenize(combined);
		sections.push({ docId, title, url, sectionHeading: headings[i].heading, content: sectionContent, tokenFreq: countFreq(tokens), length: tokens.length });
	}

	if (sections.length === 0) {
		const combined = `${title}. ${description}. ${body}`;
		const tokens = tokenize(combined);
		sections.push({ docId, title, url, sectionHeading: title, content: body, tokenFreq: countFreq(tokens), length: tokens.length });
	}

	return sections;
}

function loadSections(): { sections: DocSection[]; idf: Map<string, number>; avgDl: number } {
	if (sectionsCache && idfCache) {
		return { sections: sectionsCache, idf: idfCache, avgDl: avgDlCache };
	}

	const files = readdirSync(SCRAPED_DOCS_DIR);
	const mdxFiles = files.filter((f) => f.endsWith('.mdx'));
	const allSections: DocSection[] = [];

	for (const fileName of mdxFiles) {
		const raw = readFileSync(join(SCRAPED_DOCS_DIR, fileName), 'utf8');
		const titleMatch = raw.match(/^title:\s*"(.+?)"/m);
		const urlMatch = raw.match(/^url:\s*"(.+?)"/m);
		const descMatch = raw.match(/^description:\s*"(.+?)"/m);

		const docId = fileName.replace('.mdx', '');
		const title = titleMatch?.[1] ?? docId;
		const url = urlMatch?.[1] ?? `https://docs.sei.io/${docId}`;
		const description = descMatch?.[1] ?? '';
		const body = raw.replace(/^---[\s\S]*?---\s*/, '').trim();

		allSections.push(...splitIntoSections(body, docId, title, url, description));
	}

	const N = allSections.length;
	const df = new Map<string, number>();
	for (const sec of allSections) {
		const seen = new Set(sec.tokenFreq.keys());
		for (const t of seen) {
			df.set(t, (df.get(t) || 0) + 1);
		}
	}

	const idf = new Map<string, number>();
	for (const [term, freq] of df) {
		idf.set(term, Math.log((N - freq + 0.5) / (freq + 0.5) + 1));
	}

	const avgDl = allSections.reduce((sum, s) => sum + s.length, 0) / N;

	sectionsCache = allSections;
	idfCache = idf;
	avgDlCache = avgDl;
	return { sections: allSections, idf, avgDl };
}

const BM25_K1 = 1.2;
const BM25_B = 0.75;

function bm25Score(queryTokens: string[], section: DocSection, idf: Map<string, number>, avgDl: number): number {
	let score = 0;
	for (const qt of queryTokens) {
		const tf = section.tokenFreq.get(qt) || 0;
		if (tf === 0) continue;
		const termIdf = idf.get(qt) || 0;
		score += termIdf * ((tf * (BM25_K1 + 1)) / (tf + BM25_K1 * (1 - BM25_B + BM25_B * (section.length / avgDl))));
	}
	return score;
}

function extractSnippet(content: string, queryTokens: string[], maxLen: number = 1200): string {
	const sentences = content.split(/(?<=[.!?\n])\s+/);
	let bestStart = 0;
	let bestScore = -1;

	const windowSize = 3;
	for (let i = 0; i < sentences.length; i++) {
		const windowLower = sentences
			.slice(i, i + windowSize)
			.join(' ')
			.toLowerCase();
		let score = 0;
		for (const qt of queryTokens) {
			if (windowLower.indexOf(qt) !== -1) score += 2;
			score += Math.min(windowLower.split(qt).length - 1, 5);
		}
		if (score > bestScore) {
			bestScore = score;
			bestStart = i;
		}
	}

	const snippet = sentences.slice(bestStart, bestStart + windowSize + 2).join(' ');
	return snippet.length <= maxLen ? snippet : snippet.slice(0, maxLen) + '...';
}

export async function searchDocs(query: string, topK = 8): Promise<SearchResult[]> {
	const { sections, idf, avgDl } = loadSections();
	const queryTokens = tokenize(query);
	if (queryTokens.length === 0) return [];

	const scored = sections.map((section) => {
		let score = bm25Score(queryTokens, section, idf, avgDl);

		const titleLower = section.title.toLowerCase();
		const headingLower = section.sectionHeading.toLowerCase();
		const phraseLower = query.toLowerCase();

		if (titleLower.includes(phraseLower)) score *= 2.5;
		if (headingLower.includes(phraseLower)) score *= 2.0;
		for (const qt of queryTokens) {
			if (titleLower.includes(qt)) score *= 1.3;
			if (headingLower.includes(qt)) score *= 1.15;
		}

		return { section, score };
	});

	scored.sort((a, b) => b.score - a.score);

	const seenDocs = new Map<string, number>();
	const results: SearchResult[] = [];

	for (const { section, score } of scored) {
		if (results.length >= topK || score <= 0) break;

		const docCount = seenDocs.get(section.docId) || 0;
		if (docCount >= 2) continue;
		seenDocs.set(section.docId, docCount + 1);

		const heading = section.sectionHeading !== section.title ? ` > ${section.sectionHeading}` : '';
		const maxScore = scored[0]?.score || 1;

		results.push({
			title: `${section.title}${heading}`,
			url: section.url,
			description: '',
			content: extractSnippet(section.content, queryTokens),
			score: Math.min(score / maxScore, 1)
		});
	}

	return results;
}
