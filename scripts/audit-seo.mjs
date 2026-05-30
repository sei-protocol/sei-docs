#!/usr/bin/env node
/**
 * Audits SEO metadata and basic page structure for every page referenced in
 * `docs.json`. This is the free, no-AI replacement for Mintlify's "Audit SEO
 * metadata" workflow — auditing is fully deterministic (only *writing* good
 * metadata needs a human or an LLM).
 *
 * It walks the same navigation tree as `generate-llms.mjs`, so it only checks
 * the pages you actually publish — not README.md, this script, or the
 * deprecated cosmos-sdk section.
 *
 * Checks (per page):
 *   ERROR   — file referenced in nav is missing
 *   ERROR   — no frontmatter `title`
 *   ERROR   — no frontmatter `description`
 *   WARN    — title longer than MAX_TITLE chars (truncated in search results)
 *   WARN    — description outside [DESC_MIN, DESC_MAX] chars
 *   WARN    — body starts headings with a `# H1` (Mintlify renders the title
 *             from frontmatter; the body should start at `##` — see STYLE_GUIDE)
 *   WARN    — heading levels skip (e.g. `##` followed by `####`)
 *
 * Exit code: 1 if any ERROR, else 0. Warnings never fail the build.
 *
 * Run:
 *   node scripts/audit-seo.mjs
 *
 * Env (optional):
 *   SEO_STRICT=1   treat warnings as errors too (fail on any finding)
 */

import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const REPO_ROOT = resolve(dirname(__filename), '..');
const DOCS_JSON_PATH = join(REPO_ROOT, 'docs.json');

// SEO display thresholds (chars). Titles/descriptions outside these get
// truncated in Google results; not fatal, but worth flagging.
const MAX_TITLE = 60;
const DESC_MIN = 50;
const DESC_MAX = 160;

// Page-path prefixes excluded from the audit (kept in sync with the llms.txt
// generator). cosmos-sdk is deprecated per SIP-3 and not SEO-maintained.
const EXCLUDED_PREFIXES = ['cosmos-sdk'];

const STRICT = process.env.SEO_STRICT === '1';
const IN_CI = process.env.GITHUB_ACTIONS === 'true';

/** Recursively pull every page path out of the docs.json navigation tree. */
function collectPages(navigation) {
	const pages = [];
	function walk(node) {
		if (!node) return;
		if (Array.isArray(node)) {
			for (const item of node) walk(item);
			return;
		}
		if (typeof node === 'string') {
			pages.push(node);
			return;
		}
		if (typeof node !== 'object') return;
		if (Array.isArray(node.pages)) walk(node.pages);
		if (Array.isArray(node.groups)) walk(node.groups);
		if (Array.isArray(node.tabs)) walk(node.tabs);
	}
	walk(navigation);
	return Array.from(new Set(pages));
}

/** Split a page's frontmatter block from its body. Returns null frontmatter if absent. */
function splitFrontmatter(raw) {
	// Frontmatter must be the very first thing in the file: a `---` line,
	// some YAML, then a closing `---` line.
	if (!raw.startsWith('---')) return { frontmatter: null, body: raw, bodyStartLine: 1 };
	const lines = raw.split('\n');
	if (lines[0].trim() !== '---') return { frontmatter: null, body: raw, bodyStartLine: 1 };
	for (let i = 1; i < lines.length; i++) {
		if (lines[i].trim() === '---') {
			return {
				frontmatter: lines.slice(1, i).join('\n'),
				body: lines.slice(i + 1).join('\n'),
				bodyStartLine: i + 2
			};
		}
	}
	return { frontmatter: null, body: raw, bodyStartLine: 1 };
}

/** Minimal YAML scalar reader: pulls `key: value` (handles quotes). Good enough for title/description. */
function readScalar(frontmatter, key) {
	if (!frontmatter) return null;
	const re = new RegExp(`^${key}:\\s*(.*)$`, 'm');
	const m = frontmatter.match(re);
	if (!m) return null;
	let v = m[1].trim();
	// Strip a single layer of matching quotes.
	if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
		v = v.slice(1, -1);
	}
	return v.trim() || null;
}

/**
 * Scan a page body for heading problems, skipping fenced code blocks.
 * Returns { h1: <line|null>, skips: [{line, from, to}] }.
 */
function analyzeHeadings(body, bodyStartLine) {
	const lines = body.split('\n');
	let inFence = false;
	let fenceMarker = '';
	let h1Line = null;
	const skips = [];
	// Treat the Mintlify-rendered title as the implicit level-1 heading, so the
	// first body heading is expected to be level 2.
	let prevLevel = 1;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const fence = line.match(/^\s*(```+|~~~+)/);
		if (fence) {
			if (!inFence) {
				inFence = true;
				fenceMarker = fence[1][0];
			} else if (fence[1][0] === fenceMarker) {
				inFence = false;
			}
			continue;
		}
		if (inFence) continue;

		const h = line.match(/^(#{1,6})\s+\S/);
		if (!h) continue;
		const level = h[1].length;
		const lineNo = bodyStartLine + i;
		if (level === 1 && h1Line === null) h1Line = lineNo;
		if (level > prevLevel + 1) skips.push({ line: lineNo, from: prevLevel, to: level });
		prevLevel = level;
	}
	return { h1: h1Line, skips };
}

function relForCi(absPath) {
	return absPath.startsWith(`${REPO_ROOT}/`) ? absPath.slice(REPO_ROOT.length + 1) : absPath;
}

async function main() {
	const docsJson = JSON.parse(await readFile(DOCS_JSON_PATH, 'utf8'));
	const pagePaths = collectPages(docsJson.navigation)
		// Skip external links and in-page anchors that can appear in nav.
		.filter((p) => !/^https?:\/\//.test(p) && !p.startsWith('#'))
		.filter((p) => !EXCLUDED_PREFIXES.some((prefix) => p === prefix || p.startsWith(`${prefix}/`)));

	const errors = [];
	const warnings = [];
	const add = (bucket, file, line, msg) => bucket.push({ file, line, msg });

	for (const page of pagePaths) {
		const mdx = join(REPO_ROOT, `${page}.mdx`);
		const md = join(REPO_ROOT, `${page}.md`);
		const filePath = existsSync(mdx) ? mdx : existsSync(md) ? md : null;
		if (!filePath) {
			add(errors, `${page}.mdx`, 1, `Page referenced in docs.json is missing on disk`);
			continue;
		}
		const rel = relForCi(filePath);
		const raw = await readFile(filePath, 'utf8');
		const { frontmatter, body, bodyStartLine } = splitFrontmatter(raw);

		const title = readScalar(frontmatter, 'title');
		const description = readScalar(frontmatter, 'description');

		if (!title) add(errors, rel, 1, `Missing frontmatter "title"`);
		else if (title.length > MAX_TITLE)
			add(warnings, rel, 1, `Title is ${title.length} chars (>${MAX_TITLE}); will be truncated in search results`);

		if (!description) add(errors, rel, 1, `Missing frontmatter "description"`);
		else if (description.length < DESC_MIN || description.length > DESC_MAX)
			add(
				warnings,
				rel,
				1,
				`Description is ${description.length} chars (ideal ${DESC_MIN}-${DESC_MAX})`
			);

		const { h1, skips } = analyzeHeadings(body, bodyStartLine);
		if (h1 !== null)
			add(warnings, rel, h1, `Body uses an H1 ("# ..."); start sections at "##" (Mintlify renders the title)`);
		for (const s of skips)
			add(warnings, rel, s.line, `Heading skips from H${s.from} to H${s.to} (don't skip levels)`);
	}

	// Emit findings.
	const emit = ({ file, line, msg }, level) => {
		if (IN_CI) console.log(`::${level} file=${file},line=${line}::${msg}`);
		else console.log(`  ${level === 'error' ? 'ERROR' : 'warn '}  ${file}:${line}  ${msg}`);
	};
	if (!IN_CI) console.log(`\nSEO + structure audit — ${pagePaths.length} pages\n`);
	for (const e of errors) emit(e, 'error');
	for (const w of warnings) emit(w, 'warning');

	const summary = `\n${errors.length} error(s), ${warnings.length} warning(s) across ${pagePaths.length} pages.`;
	console.log(summary);

	if (IN_CI && process.env.GITHUB_STEP_SUMMARY) {
		const md = [
			`### SEO + structure audit`,
			``,
			`- **${errors.length}** errors, **${warnings.length}** warnings across **${pagePaths.length}** pages.`,
			``
		].join('\n');
		const { appendFile } = await import('node:fs/promises');
		await appendFile(process.env.GITHUB_STEP_SUMMARY, md);
	}

	const failed = errors.length > 0 || (STRICT && warnings.length > 0);
	process.exit(failed ? 1 : 0);
}

main().catch((err) => {
	console.error('❌', err);
	process.exit(1);
});
