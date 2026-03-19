import { streamText, tool, jsonSchema, stepCountIs, gateway } from 'ai';
import type { ModelMessage, GatewayModelId } from 'ai';
import { NextRequest } from 'next/server';
import { searchDocs } from '@/lib/search-docs';

const PRIMARY_MODEL: GatewayModelId = 'anthropic/claude-sonnet-4-5-20251001';
const FALLBACK_MODELS: GatewayModelId[] = ['google/gemini-2.0-flash-lite', 'openai/gpt-4.1-nano'];

const SYSTEM_PROMPT = `You are the Sei Documentation AI Assistant — a knowledgeable technical guide for developers building on Sei, the fastest EVM blockchain with 400ms finality and parallel execution.

## CRITICAL RULES

1. **ALWAYS search before answering.** Never say "I don't have information" or "I'm not sure" without searching first. For every user question, call search_docs at least once — even for follow-up questions. Try multiple keyword variations if the first search returns poor results (e.g. run-together names: "seigiga" → also "sei giga"; camelCase → spaced words).
2. **Never refuse to search.** If the user asks about any topic, search for it. The documentation is comprehensive and regularly updated.

## Response style

Write thorough, well-structured answers that a developer would find genuinely useful:

- **Explain concepts clearly** — start with what it is, then how it works, then why it matters on Sei specifically.
- **Use markdown formatting** — use headings (##), bullet points, bold text, and code blocks to make answers scannable and readable.
- **Include code examples** when relevant — show actual code snippets with correct syntax, imports, and configuration.
- **Always cite sources** — include the documentation URL at the end so the user can read more.
- **Cover the full picture** — don't just give a one-line definition. If someone asks "What is Twin Turbo Consensus?", explain the mechanism, its components, and the performance implications.
- **Be specific to Sei** — relate everything back to how it works on Sei, including chain IDs, RPC endpoints, and tooling specifics when relevant.

Your responses MUST be at least 300 words, except if the user is explictly asking for shorter response. Aim for 200-1000 words depending on complexity. Never give a short 2-3 sentence answer — always elaborate with context, examples, and practical details and make sure to link to all relevant parts of the docs. If you find yourself writing a short answer, expand it by adding a code example, explaining related concepts, or listing next steps the developer should take.

## Key context

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
		model: gateway(PRIMARY_MODEL),
		system: systemPrompt,
		messages: coreMessages,
		tools: {
			search_docs: tool({
				description:
					'Search Sei documentation using keyword search. Use specific technical terms rather than natural language questions. You can call this multiple times with different queries to find comprehensive information — e.g. search "deploy hardhat" and "deploy foundry" separately if both are relevant.',
				inputSchema: jsonSchema<{ query: string }>({
					type: 'object',
					properties: {
						query: {
							type: 'string',
							description:
								'Short keyword query with 2-5 specific terms. Use technical terms, not full sentences. Good: "wagmi connect wallet", "hardhat deploy contract". Bad: "How do I deploy a smart contract using Hardhat on Sei?"'
						}
					},
					required: ['query']
				}),
				execute: async ({ query }) => {
					const results = await searchDocs(query, 8);
					if (results.length === 0) {
						return 'No results found in the documentation for this query. Try different keywords.';
					}
					return results.map((r) => `**${r.title}** (${r.url})\nRelevance: ${(r.score * 100).toFixed(0)}%\n${r.content}`).join('\n\n---\n\n');
				}
			})
		},
		providerOptions: {
			gateway: {
				models: FALLBACK_MODELS,
				tags: ['sei-docs-assistant', 'chat']
			}
		},
		stopWhen: stepCountIs(5)
	});

	return result.toUIMessageStreamResponse();
}
