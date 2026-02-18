import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request, { params }) {
	const { path: segments } = await params;
	const docPath = segments.join('/');

	const contentDir = path.join(process.cwd(), 'content');
	const candidates = [
		path.join(contentDir, `${docPath}.mdx`),
		path.join(contentDir, `${docPath}.md`),
		path.join(contentDir, docPath, 'index.mdx'),
		path.join(contentDir, docPath, 'index.md')
	];

	let raw = null;
	for (const filePath of candidates) {
		try {
			raw = await fs.readFile(filePath, 'utf8');
			break;
		} catch {
			continue;
		}
	}

	if (!raw) {
		return NextResponse.json({ error: 'Page not found' }, { status: 404 });
	}

	const markdown = mdxToMarkdown(raw, `https://docs.sei.io/${docPath}`);

	return new NextResponse(markdown, {
		headers: {
			'Content-Type': 'text/markdown; charset=utf-8',
			'X-Robots-Tag': 'noindex'
		}
	});
}

function mdxToMarkdown(source, url) {
	let result = source;

	// Extract and preserve frontmatter
	let frontmatter = '';
	const fmMatch = result.match(/^---\n([\s\S]*?)\n---/);
	if (fmMatch) {
		frontmatter = fmMatch[1];
		result = result.slice(fmMatch[0].length);
	}

	// Strip import statements
	result = result.replace(/^import\s+.*$/gm, '');

	// Strip JSX component wrappers like <Callout ...> and </Callout> but keep inner text
	result = result.replace(/<(Callout|Steps|Cards|Card|Tabs|Tab|FileTree)(\s[^>]*)?\/?>/gi, '');
	result = result.replace(/<\/(Callout|Steps|Cards|Card|Tabs|Tab|FileTree)>/gi, '');

	// Convert HTML tables to markdown tables
	result = convertHtmlTablesToMarkdown(result);

	// Strip remaining HTML/JSX wrapper tags (div, span, section) but keep content
	result = result.replace(/<\/?(div|span|section|article|thead|tbody|main)(\s[^>]*)?>/gi, '');

	// Clean up excessive blank lines
	result = result.replace(/\n{4,}/g, '\n\n\n');
	result = result.trim();

	// Rebuild with frontmatter including the URL
	let md = '---\n';
	if (frontmatter) md += frontmatter + '\n';
	md += `url: ${url}\n`;
	md += '---\n\n';
	md += result;

	return md;
}

function convertHtmlTablesToMarkdown(text) {
	return text.replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (_, tableContent) => {
		const rows = [];
		const rowMatches = tableContent.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);

		for (const rowMatch of rowMatches) {
			const cells = [];
			const cellMatches = rowMatch[1].matchAll(/<(th|td)[^>]*>([\s\S]*?)<\/\1>/gi);
			for (const cellMatch of cellMatches) {
				const cellText = cellMatch[2]
					.replace(/<[^>]*>/g, '')
					.replace(/\s+/g, ' ')
					.trim();
				cells.push(cellText);
			}
			if (cells.length > 0) rows.push(cells);
		}

		if (rows.length === 0) return '';

		let md = '';
		const colCount = Math.max(...rows.map((r) => r.length));

		rows.forEach((row, i) => {
			const padded = Array.from({ length: colCount }, (_, j) => row[j] || '');
			md += '| ' + padded.join(' | ') + ' |\n';
			if (i === 0) {
				md += '| ' + padded.map(() => '---').join(' | ') + ' |\n';
			}
		});

		return '\n' + md;
	});
}
