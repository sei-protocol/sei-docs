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
 *   node scripts/generate-answers.js --import-csv=path/to/file.csv   # Import CSV to seed-questions.json
 *   node scripts/generate-answers.js --priority=high                 # Only high priority (MSV >= 1000)
 *   node scripts/generate-answers.js --priority=medium               # Medium+ priority (MSV >= 100)
 *   node scripts/generate-answers.js --category=evm                  # Only specific category
 *   node scripts/generate-answers.js --min-msv=500                   # Custom MSV threshold
 *   node scripts/generate-answers.js --limit=10                      # Limit number of questions
 *   node scripts/generate-answers.js --concurrency=5                 # Parallel requests (default: 5)
 *
 * Configuration:
 *   Set AI_PROVIDER env var to 'gemini', 'openai', or 'claude'
 *   Auto-detects provider based on available API keys (prefers gemini as it's free)
 *
 *   API Keys (set whichever you have):
 *     GEMINI_API_KEY   - Google Gemini (FREE tier available - recommended)
 *     OPENAI_API_KEY   - OpenAI/ChatGPT (paid)
 *     ANTHROPIC_API_KEY - Claude (paid)
 *
 * The script reads questions from content/answers/pseocontent.csv by default
 * (falls back to src/data/seed-questions.json) and generates MDX files in
 * content/answers/ that are:
 *   - Hidden from navigation (via _meta.js)
 *   - Accessible via direct URL
 *   - Included in sitemap for SEO
 *   - Sorted by MSV (Monthly Search Volume) for priority ordering
 */

const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

const SEED_QUESTIONS_PATH = path.join(__dirname, '../src/data/seed-questions.json');
const ANSWERS_DIR = path.join(__dirname, '../content/answers');
const DEFAULT_CSV_PATH = path.join(__dirname, './pseocontent.csv');
const DEFAULT_CONCURRENCY = 5;

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
	'cosmos-sdk': [
		{ title: 'Cosmos SDK', href: '/cosmos-sdk' },
		{ title: 'Transactions', href: '/cosmos-sdk/transactions' }
	],
	glossary: [
		{ title: 'Getting Started', href: '/learn' },
		{ title: 'Token Standards', href: '/learn/dev-token-standards' },
		{ title: 'Staking', href: '/learn/general-staking' },
		{ title: 'Oracles', href: '/learn/oracles' }
	]
};

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
	// Cosmos
	ibc: 'cosmos-sdk',
	cosmos: 'cosmos-sdk',
	'interchain security': 'cosmos-sdk',
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
 * Calculate priority from MSV (Monthly Search Volume)
 */
function calculatePriority(msv) {
	const num = parseInt(msv, 10);
	if (isNaN(num) || msv === 'n/a') return 'low';
	if (num >= 1000) return 'high';
	if (num >= 100) return 'medium';
	return 'low';
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
		const priority = calculatePriority(msv);

		return {
			id,
			question,
			category,
			priority,
			keyword: keyword || undefined,
			msv: msv !== 'n/a' ? parseInt(msv, 10) || undefined : undefined
		};
	});
}

/**
 * Generate answer using Gemini API (free tier)
 */
async function generateWithGemini(question, apiKey) {
	const { question: q, category, keyword } = question;

	const prompt = `You are a technical documentation assistant for Sei Network, a high-performance Layer 1 blockchain with EVM compatibility.

Generate a comprehensive, SEO-friendly answer for this question: "${q}"

Target keyword: ${keyword || 'N/A'}
Category: ${category}

Guidelines:
- Start with a clear, concise definition (2-3 sentences)
- Explain how this concept works in general blockchain context
- Then explain how it specifically applies to Sei Network (mention Sei's parallelization, ~400ms finality, or EVM compatibility where relevant)
- Include code examples where relevant (use \`\`\`solidity, \`\`\`typescript, or \`\`\`bash)
- Use clear headings like "## Overview", "## How It Works", "## On Sei Network"
- Keep the answer focused and scannable
- Do NOT include the question as a heading (it will be added separately)
- Format the response as markdown content (not full MDX)

Respond with ONLY the markdown content for the answer body.

IMPORTANT: DO NOT OMIT CONTENTS TO BE ADDED LATER. ADD EVERYTHING TO THE ANSWER.`;

	// Try models in order of preference (newest first)
	const models = ['gemini-2.0-flash', 'gemini-1.5-flash-latest', 'gemini-1.5-flash'];
	let lastError = null;

	for (const model of models) {
		const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				contents: [{ parts: [{ text: prompt }] }],
				generationConfig: {
					temperature: 0.7,
					maxOutputTokens: 2048
				}
			})
		});

		if (response.ok) {
			const data = await response.json();
			return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
		}

		// If 404, try next model
		if (response.status === 404) {
			lastError = `Model ${model} not found`;
			continue;
		}

		// For other errors, throw immediately
		const errorText = await response.text();
		throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
	}

	throw new Error(`Gemini API error: No available models. Last error: ${lastError}`);
}

/**
 * Generate answer using OpenAI API with flex service tier
 */
async function generateWithOpenAI(question, apiKey) {
	const { question: q, category, keyword } = question;

	const instructions = `You are a technical documentation assistant for Sei Network, a high-performance Layer 1 blockchain with EVM compatibility.

Guidelines:
- Start with a clear, concise definition (2-3 sentences)
- Explain how this concept works in general blockchain context
- Then explain how it specifically applies to Sei Network (mention Sei's parallelization, ~400ms finality, or EVM compatibility where relevant)
- Include code examples where relevant (use \`\`\`solidity, \`\`\`typescript, or \`\`\`bash)
- Use clear headings like "## Overview", "## How It Works", "## On Sei Network"
- Keep the answer focused and scannable
- Do NOT include the question as a heading (it will be added separately)
- Format the response as markdown content (not full MDX)

Respond with ONLY the markdown content for the answer body.`;

	const input = `Generate a comprehensive, SEO-friendly answer for this question: "${q}"

Target keyword: ${keyword || 'N/A'}
Category: ${category}`;

	const client = new OpenAI({
		apiKey,
		timeout: 15 * 1000 * 60 // 15 minutes timeout
	});

	const response = await client.responses.create(
		{
			model: 'gpt-5.2',
			instructions,
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
	const { question: q, category, keyword } = question;

	const prompt = `You are a technical documentation assistant for Sei Network, a high-performance Layer 1 blockchain with EVM compatibility.

Generate a comprehensive, SEO-friendly answer for this question: "${q}"

Target keyword: ${keyword || 'N/A'}
Category: ${category}

Guidelines:
- Start with a clear, concise definition (2-3 sentences)
- Explain how this concept works in general blockchain context
- Then explain how it specifically applies to Sei Network (mention Sei's parallelization, ~400ms finality, or EVM compatibility where relevant)
- Include code examples where relevant (use \`\`\`solidity, \`\`\`typescript, or \`\`\`bash)
- Use clear headings like "## Overview", "## How It Works", "## On Sei Network"
- Keep the answer focused and scannable
- Do NOT include the question as a heading (it will be added separately)
- Format the response as markdown content (not full MDX)

Respond with ONLY the markdown content for the answer body.`;

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
			messages: [{ role: 'user', content: prompt }]
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
 * Wrap AI-generated content in MDX template
 */
function wrapInMDX(question, content) {
	const { id, question: q, category, keyword } = question;
	const relatedDocs = CATEGORY_DOCS[category] || CATEGORY_DOCS.glossary;
	const slug = id || slugify(q);

	// Build keywords array
	const keywordParts = keyword ? keyword.split(' ').filter((k) => k.length > 2) : [];
	const slugParts = slug.split('-').filter((k) => k.length > 2);
	const allKeywords = ['sei', 'blockchain', category, ...new Set([...keywordParts, ...slugParts])];

	const relatedLinks = relatedDocs.map((doc) => `- [${doc.title}](${doc.href})`).join('\n');

	return `---
title: '${q.replace(/'/g, "\\'")}'
description: 'Learn about ${keyword || q.replace(/'/g, "\\'")} and how it works in blockchain and on Sei Network.'
keywords: [${allKeywords.map((k) => `'${k}'`).join(', ')}]
---

import { Callout } from 'nextra/components';

# ${q}

${content}

## Related Documentation

${relatedLinks}

---

_Have a question that's not answered here? Join our [Discord](https://discord.gg/sei) community._
`;
}

/**
 * Import CSV to seed-questions.json
 */
function importCSVToJSON(csvPath, dryRun) {
	const content = fs.readFileSync(csvPath, 'utf8');
	const rows = parseCSV(content);
	const newQuestions = csvToQuestions(rows);

	// Load existing questions
	let existingQuestions = [];
	if (fs.existsSync(SEED_QUESTIONS_PATH)) {
		const seedData = JSON.parse(fs.readFileSync(SEED_QUESTIONS_PATH, 'utf8'));
		existingQuestions = seedData.questions || [];
	}

	// Merge (avoid duplicates by id)
	const existingIds = new Set(existingQuestions.map((q) => q.id));
	const toAdd = newQuestions.filter((q) => !existingIds.has(q.id));

	const merged = [...existingQuestions, ...toAdd];

	console.log(`\n📥 CSV Import`);
	console.log(`   CSV rows: ${rows.length}`);
	console.log(`   New questions: ${toAdd.length}`);
	console.log(`   Duplicates skipped: ${rows.length - toAdd.length}`);
	console.log(`   Total after merge: ${merged.length}`);

	if (dryRun) {
		console.log(`\n💡 Dry run - no changes made.`);
		console.log(`\nSample of new questions:`);
		toAdd.slice(0, 5).forEach((q) => {
			console.log(`   - [${q.category}] ${q.question}`);
		});
	} else {
		fs.writeFileSync(SEED_QUESTIONS_PATH, JSON.stringify({ questions: merged }, null, '\t'));
		console.log(`\n✅ Saved to ${SEED_QUESTIONS_PATH}`);
	}

	return toAdd;
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
	const importCsvPath = args.find((a) => a.startsWith('--import-csv='))?.split('=')[1];
	const priorityFilter = args.find((a) => a.startsWith('--priority='))?.split('=')[1];
	const categoryFilter = args.find((a) => a.startsWith('--category='))?.split('=')[1];
	const minMsv = parseInt(args.find((a) => a.startsWith('--min-msv='))?.split('=')[1] || '0', 10);
	const limit = parseInt(args.find((a) => a.startsWith('--limit='))?.split('=')[1] || '0', 10);
	const concurrency = parseInt(args.find((a) => a.startsWith('--concurrency='))?.split('=')[1] || String(DEFAULT_CONCURRENCY), 10);

	const claudeKey = process.env.ANTHROPIC_API_KEY;
	const geminiKey = process.env.GEMINI_API_KEY;
	const openaiKey = process.env.OPENAI_API_KEY;

	// Auto-detect provider: prefer gemini (free), then check others
	let provider = process.env.AI_PROVIDER;
	if (!provider) {
		if (geminiKey) provider = 'gemini';
		else if (openaiKey) provider = 'openai';
		else if (claudeKey) provider = 'claude';
	}

	if (!provider) {
		console.error('❌ No AI provider configured. Set one of: GEMINI_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY');
		process.exit(1);
	}

	// Handle import-only mode
	if (importCsvPath) {
		importCSVToJSON(importCsvPath, dryRun);
		return;
	}

	console.log(`\n📝 Answer Generator for Sei Docs`);
	console.log(`   Provider: ${provider}`);
	console.log(`   Concurrency: ${concurrency}`);
	console.log(`   Dry run: ${dryRun}`);
	console.log(`   Force regenerate: ${force}`);
	console.log(`   Source: ${csvPath || 'content/answers/pseocontent.csv (default)'}`);
	if (specificId) console.log(`   Specific ID: ${specificId}`);
	if (priorityFilter) console.log(`   Priority filter: ${priorityFilter}`);
	if (categoryFilter) console.log(`   Category filter: ${categoryFilter}`);
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

	// Load questions from CSV (default) or JSON fallback
	let questions;
	const effectiveCsvPath = csvPath || DEFAULT_CSV_PATH;

	if (fs.existsSync(effectiveCsvPath)) {
		const content = fs.readFileSync(effectiveCsvPath, 'utf8');
		const rows = parseCSV(content);
		questions = csvToQuestions(rows);
		console.log(`📄 Loaded ${questions.length} questions from CSV: ${effectiveCsvPath}\n`);
	} else if (fs.existsSync(SEED_QUESTIONS_PATH)) {
		const seedData = JSON.parse(fs.readFileSync(SEED_QUESTIONS_PATH, 'utf8'));
		questions = seedData.questions;
		console.log(`📄 Loaded ${questions.length} questions from JSON\n`);
	} else {
		console.error('❌ No question source found. Create content/answers/pseocontent.csv or src/data/seed-questions.json');
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

	if (priorityFilter) {
		if (priorityFilter === 'high') {
			questions = questions.filter((q) => q.priority === 'high' || (q.msv && q.msv >= 1000));
		} else if (priorityFilter === 'medium') {
			questions = questions.filter((q) => q.priority === 'high' || q.priority === 'medium' || (q.msv && q.msv >= 100));
		}
	}

	if (categoryFilter) {
		questions = questions.filter((q) => q.category === categoryFilter);
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
			if (provider === 'gemini') {
				aiContent = await generateWithGemini(question, geminiKey);
			} else if (provider === 'openai') {
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
	 * Process questions in parallel batches with concurrency limit
	 */
	async function processInBatches(items, batchSize) {
		const results = [];
		for (let i = 0; i < items.length; i += batchSize) {
			const batch = items.slice(i, i + batchSize);
			const batchNum = Math.floor(i / batchSize) + 1;
			const totalBatches = Math.ceil(items.length / batchSize);
			console.log(`\n🔄 Processing batch ${batchNum}/${totalBatches} (${batch.length} items)...`);

			const batchResults = await Promise.all(batch.map(processQuestion));
			results.push(...batchResults);

			// Small delay between batches to avoid rate limiting
			if (i + batchSize < items.length) {
				await new Promise((r) => setTimeout(r, 500));
			}
		}
		return results;
	}

	const results = await processInBatches(questions, concurrency);

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
