import { streamText, tool, jsonSchema, stepCountIs } from 'ai';
import type { ModelMessage } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { NextRequest } from 'next/server';
import { searchDocs } from '@/lib/search-docs';

const SYSTEM_PROMPT = `You are the Sei Documentation AI Assistant. You help developers building on Sei, the fastest EVM blockchain with 400ms finality and parallel execution.

When answering questions:
- Search the documentation to find accurate, up-to-date information before responding.
- Always cite your sources by including the page URL in your response.
- Provide code examples when relevant, using the correct syntax for the language.
- If you cannot find relevant information in the docs, say so honestly.
- Be concise and direct. Developers prefer actionable answers.
- When referring to Sei-specific concepts, use precise terminology (e.g., "Twin Turbo Consensus", "parallel EVM", "SeiDB").

Key context:
- Sei mainnet: Chain ID 1329, testnet: Chain ID 1328
- RPC: https://evm-rpc.sei-apis.com (mainnet), https://evm-rpc-testnet.sei-apis.com (testnet)
- Block time: 400ms finality
- Full EVM compatibility — standard Solidity, Hardhat, Foundry, wagmi, ethers.js work unmodified`;

async function getPageContent(pagePath: string): Promise<string> {
	try {
		const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://docs.sei.io';
		const cleanPath = pagePath.replace(/^\//, '').replace(/\.md$/, '');
		const res = await fetch(`${baseUrl}/${cleanPath}.md`, { next: { revalidate: 3600 } });
		if (!res.ok) return '';
		return await res.text();
	} catch {
		return '';
	}
}

function getTextContent(msg: any): string {
	if (typeof msg.content === 'string') return msg.content;
	if (Array.isArray(msg.parts)) {
		return msg.parts
			.filter((p: any) => p.type === 'text')
			.map((p: any) => p.text)
			.join('');
	}
	if (Array.isArray(msg.content)) {
		return msg.content
			.filter((p: any) => p.type === 'text')
			.map((p: any) => p.text)
			.join('');
	}
	return '';
}

function getToolInvocations(msg: any): any[] {
	if (Array.isArray(msg.parts)) {
		return msg.parts.filter((p: any) => p.type === 'tool-invocation').map((p: any) => p.toolInvocation);
	}
	if (Array.isArray(msg.toolInvocations)) {
		return msg.toolInvocations;
	}
	return [];
}

function uiToCoreMessages(uiMessages: any[]): ModelMessage[] {
	const result: ModelMessage[] = [];
	for (const msg of uiMessages) {
		if (msg.role === 'user') {
			const text = getTextContent(msg);
			if (text) result.push({ role: 'user', content: text });
		} else if (msg.role === 'assistant') {
			const text = getTextContent(msg);
			const toolInvocations = getToolInvocations(msg);

			if (toolInvocations.length > 0) {
				const contentParts: any[] = [];
				if (text) contentParts.push({ type: 'text', text });
				for (const ti of toolInvocations) {
					contentParts.push({
						type: 'tool-call',
						toolCallId: ti.toolCallId,
						toolName: ti.toolName,
						args: ti.args
					});
				}
				result.push({ role: 'assistant', content: contentParts });

				const toolResults = toolInvocations.filter((ti: any) => ti.state === 'result');
				if (toolResults.length > 0) {
					result.push({
						role: 'tool',
						content: toolResults.map((ti: any) => ({
							type: 'tool-result' as const,
							toolCallId: ti.toolCallId,
							toolName: ti.toolName,
							output: { type: 'text' as const, value: typeof ti.result === 'string' ? ti.result : JSON.stringify(ti.result) }
						}))
					});
				}
			} else if (text) {
				result.push({ role: 'assistant', content: text });
			}
		}
	}
	return result;
}

export async function POST(req: NextRequest) {
	const apiKey = process.env.ANTHROPIC_API_KEY;
	if (!apiKey) {
		return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }), {
			status: 503,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	const body = await req.json();
	const { messages, currentPageUrl } = body;

	if (!messages || !Array.isArray(messages)) {
		return new Response(JSON.stringify({ error: 'No messages provided' }), {
			status: 400,
			headers: { 'Content-Type': 'application/json' }
		});
	}

	let systemPrompt = SYSTEM_PROMPT;
	if (currentPageUrl) {
		const pageContent = await getPageContent(currentPageUrl);
		if (pageContent) {
			systemPrompt += `\n\nThe user is currently viewing: ${currentPageUrl}\nPage content:\n${pageContent.slice(0, 4000)}`;
		}
	}

	const coreMessages = uiToCoreMessages(messages);

	const result = streamText({
		model: anthropic('claude-haiku-4-5-20251001'),
		system: systemPrompt,
		messages: coreMessages,
		tools: {
			search_docs: tool({
				description:
					'Search Sei documentation for relevant content. Use this to find accurate answers to user questions about Sei blockchain, EVM development, smart contracts, node operations, and more.',
				inputSchema: jsonSchema<{ query: string }>({
					type: 'object',
					properties: {
						query: { type: 'string', description: 'The search query to find relevant documentation' }
					},
					required: ['query']
				}),
				execute: async ({ query }) => {
					const results = await searchDocs(query, 20);
					if (results.length === 0) {
						return 'No results found in the documentation for this query.';
					}
					return results.map((r) => `**${r.title}** (${r.url})\nRelevance: ${(r.score * 100).toFixed(0)}%\n${r.content}`).join('\n\n---\n\n');
				}
			})
		},
		stopWhen: stepCountIs(5)
	});

	return result.toUIMessageStreamResponse();
}
