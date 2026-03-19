import { readFileSync } from 'fs';
import { join } from 'path';

interface IndexSection {
	docId: string;
	title: string;
	url: string;
	sectionHeading: string;
	content: string;
	tokenFreq: Record<string, number>;
	length: number;
}

interface SearchIndex {
	sections: IndexSection[];
	idf: Record<string, number>;
	avgDl: number;
}

export interface SearchResult {
	title: string;
	url: string;
	description: string;
	content: string;
	score: number;
}

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

/** Spaces, hyphens, underscores — same rules as scripts/build-search-index.js */
function tokenize(text: string): string[] {
	return text
		.toLowerCase()
		.replace(/[^\w\s-]/g, ' ')
		.split(/[\s_-]+/)
		.filter((w) => w.length > 1 && !STOP_WORDS.has(w))
		.map(stem);
}

function normalizeQueryText(raw: string): string {
	let s = raw.trim();
	s = s.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
	return s.replace(/_/g, ' ');
}

function foldForPhraseMatch(s: string): string {
	return s.toLowerCase().replace(/[\s\-_:]+/g, '');
}

function termInIndex(term: string, idf: Record<string, number>): boolean {
	return Object.prototype.hasOwnProperty.call(idf, term);
}

/**
 * When the user (or model) concatenates words ("seigiga"), BM25 sees one unknown token.
 * If the compound can be split into two known index terms, search both.
 */
function expandUnknownCompoundTokens(tokens: string[], idf: Record<string, number>): string[] {
	const out = new Set(tokens);
	let frontier = [...tokens];
	let changed = true;

	while (changed) {
		changed = false;
		const nextFrontier: string[] = [];
		for (const t of frontier) {
			if (termInIndex(t, idf) || t.length < 4) continue;
			for (let i = 2; i <= t.length - 2; i++) {
				const left = t.slice(0, i);
				const right = t.slice(i);
				if (termInIndex(left, idf) && termInIndex(right, idf)) {
					if (!out.has(left)) {
						out.add(left);
						nextFrontier.push(left);
						changed = true;
					}
					if (!out.has(right)) {
						out.add(right);
						nextFrontier.push(right);
						changed = true;
					}
				}
			}
		}
		frontier = nextFrontier;
	}

	return [...out];
}

let indexCache: SearchIndex | null = null;

const EMPTY_INDEX: SearchIndex = { sections: [], idf: {}, avgDl: 1 };

function loadIndex(): SearchIndex {
	if (indexCache) return indexCache;

	try {
		const indexPath = join(process.cwd(), 'lib', 'search-index.json');
		const raw = readFileSync(indexPath, 'utf8');
		const parsed = JSON.parse(raw) as SearchIndex;
		if (!parsed?.sections?.length || typeof parsed.avgDl !== 'number' || !Number.isFinite(parsed.avgDl)) {
			indexCache = EMPTY_INDEX;
			return indexCache;
		}
		indexCache = parsed;
		return indexCache;
	} catch {
		indexCache = EMPTY_INDEX;
		return indexCache;
	}
}

const BM25_K1 = 1.2;
const BM25_B = 0.75;

function bm25Score(queryTokens: string[], section: IndexSection, idf: Record<string, number>, avgDl: number): number {
	let score = 0;
	for (const qt of queryTokens) {
		const tf = section.tokenFreq[qt] || 0;
		if (tf === 0) continue;
		const termIdf = idf[qt] || 0;
		const numerator = tf * (BM25_K1 + 1);
		const denominator = tf + BM25_K1 * (1 - BM25_B + BM25_B * (section.length / avgDl));
		score += termIdf * (numerator / denominator);
	}
	return score;
}

function extractSnippet(content: string, queryTokens: string[], maxLen: number = 1200): string {
	const sentences = content.split(/(?<=[.!?\n])\s+/);

	let bestStart = 0;
	let bestScore = -1;

	const windowSize = 3;
	for (let i = 0; i < sentences.length; i++) {
		const window = sentences.slice(i, i + windowSize).join(' ');
		const windowLower = window.toLowerCase();
		let score = 0;
		for (const qt of queryTokens) {
			if (windowLower.indexOf(qt) !== -1) score += 2;
			const parts = windowLower.split(qt);
			score += Math.min(parts.length - 1, 5);
		}
		if (score > bestScore) {
			bestScore = score;
			bestStart = i;
		}
	}

	const snippet = sentences.slice(bestStart, bestStart + windowSize + 2).join(' ');
	if (snippet.length <= maxLen) return snippet;
	return snippet.slice(0, maxLen) + '...';
}

export async function searchDocs(query: string, topK = 8): Promise<SearchResult[]> {
	const { sections, idf, avgDl } = loadIndex();
	const normalized = normalizeQueryText(query);
	const queryTokens = expandUnknownCompoundTokens(tokenize(normalized), idf);

	if (queryTokens.length === 0) return [];

	const phraseLower = normalized.toLowerCase();
	const phraseFolded = foldForPhraseMatch(phraseLower);
	const useFoldedPhrase = phraseFolded.length >= 4;

	const scored = sections.map((section) => {
		let score = bm25Score(queryTokens, section, idf, avgDl);

		const titleLower = section.title.toLowerCase();
		const headingLower = section.sectionHeading.toLowerCase();

		if (titleLower.includes(phraseLower)) score *= 2.5;
		else if (useFoldedPhrase && foldForPhraseMatch(titleLower).includes(phraseFolded)) score *= 2.35;

		if (headingLower.includes(phraseLower)) score *= 2.0;
		else if (useFoldedPhrase && foldForPhraseMatch(headingLower).includes(phraseFolded)) score *= 1.85;

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
		if (results.length >= topK) break;
		if (score <= 0) break;

		const docCount = seenDocs.get(section.docId) || 0;
		if (docCount >= 2) continue;
		seenDocs.set(section.docId, docCount + 1);

		const heading = section.sectionHeading !== section.title ? ` > ${section.sectionHeading}` : '';
		const snippet = extractSnippet(section.content, queryTokens);

		const maxScore = scored[0]?.score || 1;
		results.push({
			title: `${section.title}${heading}`,
			url: section.url,
			description: '',
			content: snippet,
			score: Math.min(score / maxScore, 1)
		});
	}

	return results;
}
