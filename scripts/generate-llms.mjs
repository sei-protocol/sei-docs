#!/usr/bin/env node
/**
 * Generates `llms.txt` and `llms-full.txt` at the repo root following
 * https://llmstxt.org. Sources page content from Mintlify's auto-generated
 * per-page `.md` endpoints (e.g. https://docs.sei.io/learn/index.md) so we
 * don't have to scrape HTML or re-implement the renderer.
 *
 * Run:
 *   node scripts/generate-llms.mjs
 *
 * Env (optional):
 *   DOCS_BASE_URL    Base URL to fetch .md pages from (default: https://docs.sei.io)
 *   CONCURRENCY      Parallel fetch limit (default: 10)
 */

import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const REPO_ROOT = resolve(dirname(__filename), '..');
const DOCS_JSON_PATH = join(REPO_ROOT, 'docs.json');
const DOCS_BASE_URL = (process.env.DOCS_BASE_URL || 'https://docs.sei.io').replace(/\/$/, '');
const CONCURRENCY = Number.parseInt(process.env.CONCURRENCY || '10', 10);

const SEI_LLMS_CONFIG = {
	projectName: 'Sei Documentation',
	blockquote:
		'Technical documentation for Sei — a parallelized EVM Layer 1 with sub-second finality, full Ethereum tooling compatibility, and a clear roadmap toward Sei Giga (200K TPS, 5 gigagas/s).',
	intro:
		'Sei is a parallelized EVM Layer 1 blockchain with 400ms finality, ~100 MGas/s throughput today, and full Ethereum tooling compatibility. Deploy standard Solidity contracts with no modifications. Chain ID: mainnet 1329, testnet 1328. The next major upgrade, Sei Giga, targets 200K TPS via Autobahn multi-proposer BFT consensus and a custom EVM execution engine.',
	constraints: [
		'Prerequisites: Node.js ≥ 18, a wallet (Compass, Rabby, MetaMask, or any EVM-compatible wallet), and SEI tokens for gas.',
		'Authentication: No API key is required for public RPC endpoints. Rate limits apply — use a dedicated provider (Ankr, DRPC, Nirvana) for production workloads.',
		'Version compatibility: Solidity ≥ 0.8.x recommended. Sei EVM tracks the Pectra EVM (without blob transactions).',
		'Network requirements: Mainnet chain ID 1329 (pacific-1), testnet chain ID 1328 (atlantic-2). Gas is paid in SEI (18 decimals).',
		'Important notes: Sei has 400ms block times — set lower polling intervals than on Ethereum. Transactions touching independent state are parallelized automatically; shared-state writes are serialized.',
		'IBC deprecation: Per SIP-03, inbound/outbound IBC transfers are being disabled. Holders of IBC assets (USDC.n, USDT.kava, Wormhole-bridged tokens) must migrate before the governance proposal activates — see /learn/sip-03-migration.'
	].join('\n'),
	quickReference: [
		'Chain ID: mainnet 1329 (pacific-1), testnet 1328 (atlantic-2)',
		'RPC (mainnet): https://evm-rpc.sei-apis.com',
		'RPC (testnet): https://evm-rpc-testnet.sei-apis.com',
		'Native token: SEI (gas, staking, governance)',
		'USDC (mainnet): 0xe15fC38F6D8c56aF07bbCBe3BAf5708A2Bf42392 (6 decimals)',
		'USDC (testnet): 0x4fCF1784B31630811181f670Aea7A7bEF803eaED (6 decimals)',
		'Block time: 400ms finality',
		'Throughput: ~100 MGas/s today; Sei Giga target 200K TPS / 5 gigagas/s',
		'EVM compatibility: Full — standard Solidity, Hardhat, Foundry, wagmi, ethers.js, viem work unmodified'
	].join('\n'),
	examples: [
		{
			title: 'Deploy a contract with Hardhat',
			language: 'javascript',
			code: [
				'// hardhat.config.js',
				'module.exports = {',
				'  solidity: "0.8.26",',
				'  networks: {',
				'    sei: {',
				'      url: "https://evm-rpc.sei-apis.com",',
				'      chainId: 1329,',
				'      accounts: [process.env.PRIVATE_KEY],',
				'    },',
				'  },',
				'};'
			].join('\n')
		},
		{
			title: 'Query a balance with viem',
			language: 'typescript',
			code: [
				'import { createPublicClient, http } from "viem";',
				'import { sei } from "viem/chains";',
				'',
				'const client = createPublicClient({ chain: sei, transport: http() });',
				'const balance = await client.getBalance({',
				'  address: "0xYourAddress",',
				'});',
				'console.log("Balance:", balance);'
			].join('\n')
		},
		{
			title: 'Connect a wallet with wagmi',
			language: 'typescript',
			code: [
				'import { http, createConfig } from "wagmi";',
				'import { sei } from "wagmi/chains";',
				'import { injected } from "wagmi/connectors";',
				'',
				'export const config = createConfig({',
				'  chains: [sei],',
				'  connectors: [injected()],',
				'  transports: { [sei.id]: http() },',
				'});'
			].join('\n')
		}
	],
	keyResources: [
		{
			title: 'GitHub',
			url: 'https://github.com/sei-protocol',
			description: 'Open source repositories including sei-chain, sei-js, and MCP server'
		},
		{
			title: 'Developer Hub',
			url: 'https://www.sei.io/developers',
			description: 'Curated entry points, ecosystem programs, and grant info'
		},
		{
			title: 'Ecosystem',
			url: 'https://www.sei.io/ecosystem',
			description: 'Directory of projects building on Sei'
		},
		{
			title: 'Blog',
			url: 'https://blog.sei.io',
			description: 'Announcements and technical deep dives'
		},
		{
			title: 'Dashboard',
			url: 'https://dashboard.sei.io',
			description: 'Transfer, bridge, and stake on Sei'
		}
	]
};

/** URL prefixes excluded entirely from llms.txt and llms-full.txt output. */
const EXCLUDED_PREFIXES = ['/cosmos-sdk'];

/**
 * Section definitions ordered by match priority.
 * More specific prefixes (e.g. /evm/ai-tooling) must come before broader ones (/evm).
 */
const LLMS_SECTION_ORDER = [
	{
		name: 'Learn',
		match: (p) => p.startsWith('/learn'),
		overview: [
			"Sei is a parallelized EVM Layer 1 blockchain. Performance comes from Twin Turbo Consensus (optimistic block processing), parallel EVM execution (concurrent transactions on independent state), and SeiDB (high-throughput storage). Full Ethereum tooling compatibility — deploy standard Solidity contracts with no modifications.",
			"Sei Giga is the next major upgrade targeting 200K TPS and 5 gigagas/s via Autobahn multi-proposer BFT consensus and a custom EVM execution engine. For developers, Sei Giga's parallel engine rewards contracts with user-scoped state (mapping per address) over shared global state.",
			'Mainnet (pacific-1): chain ID 1329. Testnet (atlantic-2): chain ID 1328.',
			'SIP-03 migration: inbound/outbound IBC transfers are being disabled. Holders of IBC assets must swap, migrate, or bridge out before the governance proposal activates.'
		].join('\n\n')
	},
	{
		name: 'AI Tooling & Micropayments',
		match: (p) => p.startsWith('/evm/ai-tooling') || p.startsWith('/evm/x402'),
		overview: [
			'The Sei MCP Server (@sei-js/mcp-server) connects AI assistants to Sei with 29+ tools. Install: `npx -y @sei-js/mcp-server`. Read-only tools: get_chain_info, get_balance, get_erc20_balance, get_token_info, get_nft_info, and more. Wallet tools (require PRIVATE_KEY): transfer_sei, transfer_erc20, deploy_contract, write_contract, and more. Documentation search: search_docs, search_sei_js_docs.',
			'The Cambrian Agent Kit enables autonomous AI agents on Sei with DeFi protocol integrations (Takara lending, Silo lending, Citrex perpetuals, Symphony aggregation, DragonSwap liquidity).',
			'The x402 protocol enables HTTP 402-based micropayments for machine-to-machine payments — agents pay per-request for APIs, content, and services with instant settlement on Sei (~400ms finality). sei-js provides both server-side (payment verification) and client-side (payment signing) x402 packages.'
		].join('\n\n')
	},
	{
		name: 'EVM Development',
		match: (p) => p.startsWith('/evm'),
		overview: [
			"Sei's EVM is fully compatible with Ethereum. Standard Solidity contracts deploy without modification. All Ethereum tooling (Hardhat, Foundry, wagmi, ethers.js, viem, RainbowKit) works as-is. Transactions touching independent state execute concurrently.",
			'Precompiled contracts at fixed addresses expose native Sei functionality (staking, governance, IBC, JSON, oracle, p256) to EVM.',
			'Native USDC: mainnet 0xe15fC38F6D8c56aF07bbCBe3BAf5708A2Bf42392, testnet 0x4fCF1784B31630811181f670Aea7A7bEF803eaED (6 decimals).'
		].join('\n\n')
	},
	{
		name: 'Node Operations',
		match: (p) => p.startsWith('/node'),
		overview:
			'Sei supports full nodes (recent state, consensus relay), archive nodes (complete historical state), and validator nodes (block production and consensus). StateSync enables fast bootstrap — new nodes fetch a recent state snapshot instead of replaying all historical blocks. The Sei Giga storage migration moves nodes to a new format optimized for the upcoming throughput targets.'
	}
];

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

/** Turn a docs.json page path ("learn/index") into a URL path ("/learn"). */
function pageToUrlPath(page) {
	let p = page.startsWith('/') ? page : `/${page}`;
	p = p.replace(/\/index$/, '');
	return p || '/';
}

/** Strip Mintlify's auto-injected "Documentation Index" preamble blockquote. */
function stripPreamble(md) {
	const lines = md.split('\n');
	let i = 0;
	while (i < lines.length && lines[i].trim() === '') i++;
	if (i < lines.length && /^>\s*##\s*Documentation Index/i.test(lines[i])) {
		while (i < lines.length && lines[i].startsWith('>')) i++;
		while (i < lines.length && lines[i].trim() === '') i++;
	}
	return lines.slice(i).join('\n');
}

/**
 * Match Mintlify's auto-gen rule: truncate descriptions at 300 chars or the
 * first line break, whichever comes first. Keeps index entries compact.
 */
function truncateDescription(desc) {
	if (!desc) return null;
	let d = desc.split(/\r?\n/)[0].trim();
	if (d.length > 300) d = `${d.slice(0, 297).trimEnd()}…`;
	return d || null;
}

/** Pull `# Title` and the following `> description` blockquote out of a page. */
function extractMeta(md, fallbackTitle) {
	const lines = md.split('\n');
	let title = fallbackTitle;
	let description = null;

	for (let i = 0; i < lines.length; i++) {
		const m = lines[i].match(/^#\s+(.+?)\s*$/);
		if (m) {
			title = m[1].trim();
			for (let j = i + 1; j < Math.min(i + 6, lines.length); j++) {
				const q = lines[j].match(/^>\s+(.+?)\s*$/);
				if (q) {
					description = q[1].trim();
					break;
				}
				if (lines[j].trim() && !lines[j].startsWith('>')) break;
			}
			break;
		}
	}
	return { title, description: truncateDescription(description) };
}

async function fetchPageMarkdown(urlPath) {
	const url = `${DOCS_BASE_URL}${urlPath === '/' ? '' : urlPath}.md`;
	const res = await fetch(url, { headers: { 'cache-control': 'no-cache' } });
	if (!res.ok) {
		throw new Error(`HTTP ${res.status} for ${url}`);
	}
	const md = stripPreamble(await res.text());
	const fallbackTitle = urlPath
		.split('/')
		.filter(Boolean)
		.pop()
		?.replace(/[-_]/g, ' ')
		.replace(/\b\w/g, (c) => c.toUpperCase()) || 'Sei Docs';
	const { title, description } = extractMeta(md, fallbackTitle);
	return {
		urlPath,
		url: `${DOCS_BASE_URL}${urlPath}`,
		title,
		description,
		content: md.trim()
	};
}

async function fetchAllPages(urlPaths) {
	const results = new Array(urlPaths.length);
	let cursor = 0;
	let done = 0;
	const total = urlPaths.length;

	async function worker() {
		while (true) {
			const i = cursor++;
			if (i >= urlPaths.length) return;
			try {
				results[i] = await fetchPageMarkdown(urlPaths[i]);
			} catch (err) {
				console.warn(`  ⚠️  ${urlPaths[i]}: ${err.message}`);
				results[i] = null;
			}
			done++;
			if (done % 10 === 0 || done === total) {
				console.log(`  ${done}/${total}`);
			}
		}
	}

	await Promise.all(Array.from({ length: Math.min(CONCURRENCY, urlPaths.length) }, worker));
	return results.filter(Boolean);
}

function categorizePages(pages) {
	const sections = LLMS_SECTION_ORDER.map((sec) => ({
		name: sec.name,
		overview: sec.overview || null,
		pages: []
	}));
	const assigned = new Set();

	for (const page of pages) {
		for (let i = 0; i < LLMS_SECTION_ORDER.length; i++) {
			if (LLMS_SECTION_ORDER[i].match(page.urlPath)) {
				sections[i].pages.push(page);
				assigned.add(page.urlPath);
				break;
			}
		}
	}

	return {
		sections: sections.filter((s) => s.pages.length > 0),
		uncategorized: pages.filter((p) => !assigned.has(p.urlPath))
	};
}

function formatLink(page) {
	const desc = page.description ? `: ${page.description}` : '';
	return `- [${page.title}](${page.url})${desc}`;
}

function formatExamples(examples) {
	return examples.map((ex) => `### ${ex.title}\n\n\`\`\`${ex.language}\n${ex.code}\n\`\`\``).join('\n\n');
}

function buildIndex({ projectName, blockquote, intro, constraints, quickReference, examples, keyResources }, sections, uncategorized) {
	const out = [];
	out.push(`# ${projectName}`, '');
	out.push(`> ${blockquote}`, '');
	out.push(intro, '');
	out.push(constraints, '');
	out.push('## Quick Reference', '', quickReference, '');

	for (const section of sections) {
		out.push(`## ${section.name}`, '');
		if (section.overview) out.push(section.overview, '');
		for (const page of section.pages) out.push(formatLink(page));
		out.push('');
	}

	if (examples?.length) {
		out.push('## Examples', '', formatExamples(examples), '');
	}

	if (uncategorized.length) {
		out.push('## Optional', '');
		for (const page of uncategorized) out.push(formatLink(page));
		out.push('');
	}

	if (keyResources?.length) {
		out.push('## Resources', '');
		for (const r of keyResources) out.push(`- [${r.title}](${r.url}): ${r.description}`);
		out.push('');
	}

	return `${out.join('\n').replace(/\n{3,}/g, '\n\n').trim()}\n`;
}

function buildFull(config, sections, uncategorized, allPages) {
	const head = buildIndex(config, sections, uncategorized);
	const body = allPages
		.map((page) => {
			const meta = [`URL: ${page.url}`];
			if (page.description) meta.push(`Description: ${page.description}`);
			return `# ${page.title}\n\n${meta.join('\n')}\n\n${page.content}`;
		})
		.join('\n\n---\n\n');
	return `${head}\n---\n\n${body}\n`;
}

async function main() {
	console.log(`📥 Reading ${DOCS_JSON_PATH}`);
	const docsJson = JSON.parse(await readFile(DOCS_JSON_PATH, 'utf8'));

	const pagePaths = collectPages(docsJson.navigation);
	const urlPaths = pagePaths
		.map(pageToUrlPath)
		.filter((p) => !EXCLUDED_PREFIXES.some((prefix) => p.startsWith(prefix)));

	console.log(`🔎 ${pagePaths.length} pages in docs.json, ${urlPaths.length} after exclusions`);
	console.log(`🌐 Fetching markdown from ${DOCS_BASE_URL} (concurrency ${CONCURRENCY})`);
	const pages = await fetchAllPages(urlPaths);
	console.log(`✅ Fetched ${pages.length}/${urlPaths.length} pages`);

	const { sections, uncategorized } = categorizePages(pages);

	const llmsTxt = buildIndex(SEI_LLMS_CONFIG, sections, uncategorized);
	const llmsFull = buildFull(SEI_LLMS_CONFIG, sections, uncategorized, pages);

	const llmsPath = join(REPO_ROOT, 'llms.txt');
	const llmsFullPath = join(REPO_ROOT, 'llms-full.txt');
	await writeFile(llmsPath, llmsTxt, 'utf8');
	await writeFile(llmsFullPath, llmsFull, 'utf8');
	console.log(`📝 Wrote ${llmsPath} (${llmsTxt.length.toLocaleString()} chars)`);
	console.log(`📝 Wrote ${llmsFullPath} (${llmsFull.length.toLocaleString()} chars)`);
}

main().catch((err) => {
	console.error('❌', err);
	process.exit(1);
});
