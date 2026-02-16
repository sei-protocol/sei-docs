#!/usr/bin/env node
/**
 * Generate SEO-friendly answer pages from seed questions.
 *
 * Usage:
 *   node scripts/generate-answers.js                     # Generate all missing answers (reads from CSV)
 *   node scripts/generate-answers.js --dry-run           # Preview what would be generated
 *   node scripts/generate-answers.js --force             # Regenerate all answers
 *   node scripts/generate-answers.js --id=deploy-smart-contract-sei  # Generate specific answer
 *   node scripts/generate-answers.js --csv=path/to/file.csv          # Generate from custom CSV
 *   node scripts/generate-answers.js --min-msv=500                   # Custom MSV threshold
 *   node scripts/generate-answers.js --limit=10                      # Limit number of questions
 *   node scripts/generate-answers.js --concurrency=5                 # Parallel requests (default: 5)
 *
 * Configuration:
 *   Set AI_PROVIDER env var to 'openai' or 'claude'
 *   Auto-detects provider based on available API keys
 *
 *   API Keys (set whichever you have):
 *     OPENAI_API_KEY   - OpenAI/ChatGPT (paid)
 *     ANTHROPIC_API_KEY - Claude (paid)
 *
 * The script reads questions from scripts/pseocontent.csv by default and generates MDX files in
 * content/ai-answers/ that are:
 *   - Hidden from navigation (via _meta.js)
 *   - Accessible via direct URL
 *   - Included in sitemap for SEO
 *   - Sorted by MSV (Monthly Search Volume)
 */

const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

const ANSWERS_DIR = path.join(__dirname, '../content/ai-answers');
const DEFAULT_CSV_PATH = path.join(__dirname, './pseocontent.csv');
const DEFAULT_CONCURRENCY = 10;

// Category to related docs mapping for "Learn more" links
const CATEGORY_DOCS = {
	evm: [
		{ title: 'EVM Overview', href: '/evm' },
		{ title: 'Networks & RPC', href: '/evm/networks' },
		{ title: 'Deploy with Hardhat', href: '/evm/evm-hardhat' },
		{ title: 'Deploy with Foundry', href: '/evm/evm-foundry' }
	],
	learn: [
		{ title: 'Getting Started', href: '/learn' },
		{ title: 'Accounts', href: '/learn/accounts' },
		{ title: 'Faucet', href: '/learn/faucet' }
	],
	node: [
		{ title: 'Node Operations', href: '/node' },
		{ title: 'Validators', href: '/node/validators' }
	],
	glossary: [
		{ title: 'Getting Started', href: '/learn' },
		{ title: 'Token Standards', href: '/learn/dev-token-standards' },
		{ title: 'Staking', href: '/learn/general-staking' },
		{ title: 'Oracles', href: '/learn/oracles' }
	]
};

// Shared AI instructions for all providers
const AI_INSTRUCTIONS = `You are a technical documentation assistant for Sei Network, a high-performance Layer 1 blockchain with EVM compatibility.

Guidelines:
- Start with a clear, concise definition (2-3 sentences)
- Explain how this concept works in general blockchain context
- Then explain how it specifically applies to Sei Network (mention Sei's parallelization, ~400ms finality, or EVM compatibility where relevant)
- Include code examples where relevant (use \`\`\`solidity, \`\`\`typescript, or \`\`\`bash)
- Use clear headings like "## Overview", "## How It Works", "## On Sei Network"
- Keep the answer focused and scannable
- Do NOT include the question as a heading (it will be added separately)
- Format the response as markdown content (not full MDX)
- Do NOT include SEO keyword phrases like "if you're searching for X" or "what is X" in the body - write naturally

Respond with ONLY the markdown content for the answer body.`;

/**
 * Build the input prompt for AI generation
 */
function buildAIInput(question, category) {
	return `Generate a comprehensive, SEO-friendly answer for this question: "${question}"

Category: ${category}`;
}

// Keyword to category mapping for auto-categorization
const KEYWORD_CATEGORIES = {
	// EVM-specific
	evm: 'evm',
	solidity: 'evm',
	'smart contract': 'evm',
	hardhat: 'evm',
	foundry: 'evm',
	remix: 'evm',
	// Node/validator
	validator: 'node',
	node: 'node',
	'validator set': 'node',
	'validator commission': 'node',
	// Default to glossary for general blockchain terms
	default: 'glossary'
};

/**
 * Parse a simple CSV (handles basic quoting)
 */
function parseCSV(content) {
	const lines = content.trim().split('\n');
	const headers = parseCSVLine(lines[0]);
	const rows = [];

	for (let i = 1; i < lines.length; i++) {
		const values = parseCSVLine(lines[i]);
		if (values.length >= headers.length) {
			const row = {};
			headers.forEach((header, idx) => {
				row[header.trim()] = values[idx]?.trim() || '';
			});
			rows.push(row);
		}
	}

	return rows;
}

/**
 * Parse a single CSV line (handles quoted fields)
 */
function parseCSVLine(line) {
	const result = [];
	let current = '';
	let inQuotes = false;

	for (let i = 0; i < line.length; i++) {
		const char = line[i];

		if (char === '"') {
			inQuotes = !inQuotes;
		} else if (char === ',' && !inQuotes) {
			result.push(current);
			current = '';
		} else {
			current += char;
		}
	}
	result.push(current);

	return result;
}

/**
 * Slugify a question into a URL-friendly filename
 */
function slugify(text) {
	return text
		.toLowerCase()
		.replace(/[?'":\[\]]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}

/**
 * Auto-detect category from keywords
 */
function detectCategory(question, keyword) {
	const lowerQ = (question + ' ' + keyword).toLowerCase();

	for (const [key, category] of Object.entries(KEYWORD_CATEGORIES)) {
		if (key !== 'default' && lowerQ.includes(key)) {
			return category;
		}
	}

	return KEYWORD_CATEGORIES.default;
}

/**
 * Convert CSV rows to question format
 */
function csvToQuestions(rows) {
	return rows.map((row) => {
		// Handle different possible column names
		const question = row['What is [Blockchain Term] and How Does it Work?'] || row['Question'] || row['question'] || Object.values(row)[0];

		const keyword = row['Target Keyword'] || row['Keyword'] || row['keyword'] || '';

		const msv = row['MSV'] || row['Volume'] || row['volume'] || '';

		const id = slugify(question);
		const category = detectCategory(question, keyword);

		return {
			id,
			question,
			category,
			keyword: keyword || undefined,
			msv: msv !== 'n/a' ? parseInt(msv, 10) || undefined : undefined
		};
	});
}

/**
 * Generate answer using OpenAI API with flex service tier
 */
async function generateWithOpenAI(question, apiKey) {
	const { question: q, category } = question;
	const input = buildAIInput(q, category);

	const client = new OpenAI({
		apiKey,
		timeout: 15 * 1000 * 60 // 15 minutes timeout
	});

	const response = await client.responses.create(
		{
			model: 'gpt-5.2',
			instructions: AI_INSTRUCTIONS,
			input,
			service_tier: 'flex'
		},
		{ timeout: 15 * 1000 * 60 }
	);

	return response.output_text || '';
}

/**
 * Generate answer using Claude API (Anthropic)
 */
async function generateWithClaude(question, apiKey) {
	const { question: q, category } = question;
	const input = buildAIInput(q, category);

	const response = await fetch('https://api.anthropic.com/v1/messages', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'x-api-key': apiKey,
			'anthropic-version': '2023-06-01'
		},
		body: JSON.stringify({
			model: 'claude-sonnet-4-20250514',
			max_tokens: 2048,
			system: AI_INSTRUCTIONS,
			messages: [{ role: 'user', content: input }]
		})
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Claude API error: ${response.status} ${response.statusText} - ${errorText}`);
	}

	const data = await response.json();
	return data.content?.[0]?.text || '';
}

/**
 * Generate JSON-LD schema for SEO/GEO optimization
 */
function generateJsonLdSchema(question, content) {
	const { question: q, category, keyword } = question;

	// Extract first paragraph as the answer summary for FAQ schema
	const firstParagraph = content.split('\n\n').find((p) => p.trim() && !p.startsWith('#') && !p.startsWith('```')) || '';
	const answerSummary = firstParagraph
		.replace(/[*_`#]/g, '')
		.trim()
		.slice(0, 500);

	const schema = {
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'FAQPage',
				mainEntity: [
					{
						'@type': 'Question',
						name: q,
						acceptedAnswer: {
							'@type': 'Answer',
							text: answerSummary
						}
					}
				]
			},
			{
				'@type': 'TechArticle',
				headline: q,
				description: `Learn about ${keyword || q} and how it works in blockchain and on Sei Network.`,
				author: {
					'@type': 'Organization',
					name: 'Sei Network',
					url: 'https://sei.io'
				},
				publisher: {
					'@type': 'Organization',
					name: 'Sei Network',
					url: 'https://sei.io'
				},
				about: {
					'@type': 'Thing',
					name: keyword || q
				},
				articleSection: category,
				inLanguage: 'en'
			}
		]
	};

	return JSON.stringify(schema, null, '\t');
}

/**
 * Wrap AI-generated content in MDX template
 */
function wrapInMDX(question, content) {
	const { id, question: q, category, keyword } = question;
	const relatedDocs = CATEGORY_DOCS[category] || CATEGORY_DOCS.glossary;
	const slug = id || slugify(q);

	// Build keywords array - filter more aggressively
	const keywordParts = keyword ? keyword.split(' ').filter((k) => k.length > 3) : [];
	const slugParts = slug.split('-').filter((k) => k.length > 3 && !['what', 'how', 'does', 'work', 'they', 'and', 'the', 'are'].includes(k));
	const allKeywords = ['sei', 'blockchain', category, ...new Set([...keywordParts, ...slugParts])];

	const relatedLinks = relatedDocs.map((doc) => `- [${doc.title}](${doc.href})`).join('\n');

	// Generate JSON-LD schema
	const jsonLdSchema = generateJsonLdSchema(question, content);

	return `---
title: '${q.replace(/'/g, "\\'")}'
description: 'Learn about ${keyword || q.replace(/'/g, "\\'")} and how it works in blockchain and on Sei Network.'
keywords: [${allKeywords.map((k) => `'${k}'`).join(', ')}]
---

import { Callout } from 'nextra/components';

export const jsonLd = ${jsonLdSchema};

<head>
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
</head>

# ${q}

<Callout type="info" emoji="🤖">
This content was generated with the assistance of AI and is intended for informational purposes only. Please verify all information independently before making decisions based on this content.
</Callout>

${content}

## Related Documentation

${relatedLinks}

---

_Have a question that's not answered here? Join our [Discord](https://discord.gg/sei) community._
`;
}

/**
 * Main generation logic
 */
async function main() {
	const args = process.argv.slice(2);
	const dryRun = args.includes('--dry-run');
	const force = args.includes('--force');
	const specificId = args.find((a) => a.startsWith('--id='))?.split('=')[1];
	const csvPath = args.find((a) => a.startsWith('--csv='))?.split('=')[1];
	const minMsv = parseInt(args.find((a) => a.startsWith('--min-msv='))?.split('=')[1] || '0', 10);
	const limit = parseInt(args.find((a) => a.startsWith('--limit='))?.split('=')[1] || '0', 10);
	const concurrency = parseInt(args.find((a) => a.startsWith('--concurrency='))?.split('=')[1] || String(DEFAULT_CONCURRENCY), 10);

	const claudeKey = process.env.ANTHROPIC_API_KEY;
	const openaiKey = process.env.OPENAI_API_KEY;

	// Auto-detect provider based on available API keys
	let provider = process.env.AI_PROVIDER;
	if (!provider) {
		if (openaiKey) provider = 'openai';
		else if (claudeKey) provider = 'claude';
	}

	if (!provider) {
		console.error('❌ No AI provider configured. Set one of: OPENAI_API_KEY or ANTHROPIC_API_KEY');
		process.exit(1);
	}

	console.log(`\n📝 Answer Generator for Sei Docs`);
	console.log(`   Provider: ${provider}`);
	console.log(`   Concurrency: ${concurrency}`);
	console.log(`   Dry run: ${dryRun}`);
	console.log(`   Force regenerate: ${force}`);
	console.log(`   Source: ${csvPath || 'scripts/pseocontent.csv (default)'}`);
	if (specificId) console.log(`   Specific ID: ${specificId}`);
	if (minMsv) console.log(`   Min MSV: ${minMsv}`);
	if (limit) console.log(`   Limit: ${limit}`);
	console.log('');

	// Ensure answers directory exists
	if (!fs.existsSync(ANSWERS_DIR)) {
		if (dryRun) {
			console.log(`Would create directory: ${ANSWERS_DIR}`);
		} else {
			fs.mkdirSync(ANSWERS_DIR, { recursive: true });
			console.log(`✅ Created ${ANSWERS_DIR}`);
		}
	}

	// Load questions from CSV
	let questions;
	const effectiveCsvPath = csvPath || DEFAULT_CSV_PATH;

	if (fs.existsSync(effectiveCsvPath)) {
		const content = fs.readFileSync(effectiveCsvPath, 'utf8');
		const rows = parseCSV(content);
		questions = csvToQuestions(rows);
		console.log(`📄 Loaded ${questions.length} questions from CSV: ${effectiveCsvPath}\n`);
	} else {
		console.error(`❌ No question source found. Create ${effectiveCsvPath}`);
		process.exit(1);
	}

	// Apply filters
	const originalCount = questions.length;

	if (specificId) {
		questions = questions.filter((q) => q.id === specificId);
		if (questions.length === 0) {
			console.error(`❌ No question found with id: ${specificId}`);
			process.exit(1);
		}
	}

	if (minMsv > 0) {
		questions = questions.filter((q) => q.msv && q.msv >= minMsv);
	}

	// Sort by MSV descending (highest value first)
	questions.sort((a, b) => (b.msv || 0) - (a.msv || 0));

	if (limit > 0) {
		questions = questions.slice(0, limit);
	}

	if (questions.length !== originalCount) {
		console.log(`📋 Filtered: ${originalCount} → ${questions.length} questions\n`);
	}

	let generated = 0;
	let skipped = 0;
	let failed = 0;

	/**
	 * Process a single question - returns result object
	 */
	async function processQuestion(question) {
		const slug = question.id || slugify(question.question);
		const filePath = path.join(ANSWERS_DIR, `${slug}.mdx`);
		const exists = fs.existsSync(filePath);

		if (exists && !force) {
			console.log(`⏭️  Skipping (exists): ${slug}`);
			return { status: 'skipped', slug };
		}

		console.log(`📄 Generating: ${slug}`);

		try {
			let aiContent;
			if (provider === 'openai') {
				aiContent = await generateWithOpenAI(question, openaiKey);
			} else if (provider === 'claude') {
				aiContent = await generateWithClaude(question, claudeKey);
			}
			const content = wrapInMDX(question, aiContent);

			if (dryRun) {
				console.log(`   Would write to: ${filePath}`);
				console.log(`   Content length: ${content.length} chars`);
			} else {
				fs.writeFileSync(filePath, content);
				console.log(`   ✅ Written: ${filePath}`);
			}

			return { status: 'generated', slug };
		} catch (error) {
			console.error(`   ❌ Failed (${slug}): ${error.message}`);
			return { status: 'failed', slug, error: error.message };
		}
	}

	/**
	 * Process questions with a worker pool - each worker immediately picks up the next task when done
	 */
	async function processWithPool(items, poolSize) {
		const results = [];
		let nextIndex = 0;
		let completed = 0;
		const total = items.length;

		async function worker(workerId) {
			while (true) {
				const index = nextIndex++;
				if (index >= items.length) break;

				const result = await processQuestion(items[index]);
				results[index] = result;
				completed++;

				// Progress indicator
				const pct = Math.round((completed / total) * 100);
				console.log(`   📊 Progress: ${completed}/${total} (${pct}%) - Worker ${workerId} finished`);
			}
		}

		console.log(`\n🚀 Starting ${poolSize} parallel workers for ${total} items...\n`);

		// Start all workers and wait for them to complete
		const workers = Array.from({ length: Math.min(poolSize, items.length) }, (_, i) => worker(i + 1));
		await Promise.all(workers);

		return results;
	}

	const results = await processWithPool(questions, concurrency);

	// Tally results
	for (const result of results) {
		if (result.status === 'generated') generated++;
		else if (result.status === 'skipped') skipped++;
		else if (result.status === 'failed') failed++;
	}

	console.log(`\n📊 Summary:`);
	console.log(`   Generated: ${generated}`);
	console.log(`   Skipped: ${skipped}`);
	console.log(`   Failed: ${failed}`);

	if (dryRun) {
		console.log(`\n💡 Run without --dry-run to actually generate files.`);
	}
}

main().catch((err) => {
	console.error('Fatal error:', err);
	process.exit(1);
});
