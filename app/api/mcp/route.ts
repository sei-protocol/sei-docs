import { NextRequest, NextResponse } from 'next/server';
import { searchDocs } from '@/lib/search-docs';

const DOCS_BASE_URL = 'https://docs.sei.io';

// MCP HTTP Streamable transport — handles the MCP protocol over HTTP
// See: https://modelcontextprotocol.io/specification/2025-03-26/basic/transports#streamable-http
export async function GET() {
	// Server metadata endpoint
	return NextResponse.json({
		name: 'sei-docs',
		version: '1.0.0',
		protocolVersion: '2025-03-26',
		capabilities: {
			tools: { listChanged: false }
		},
		serverInfo: {
			name: 'Sei Documentation',
			version: '1.0.0'
		}
	});
}

export async function POST(req: NextRequest) {
	const body = await req.json();
	const { method, id, params } = body;

	if (method === 'initialize') {
		return NextResponse.json({
			jsonrpc: '2.0',
			id,
			result: {
				protocolVersion: '2025-03-26',
				capabilities: {
					tools: { listChanged: false }
				},
				serverInfo: {
					name: 'Sei Documentation',
					version: '1.0.0'
				}
			}
		});
	}

	if (method === 'tools/list') {
		return NextResponse.json({
			jsonrpc: '2.0',
			id,
			result: {
				tools: [
					{
						name: 'search_sei_docs',
						description:
							'Search Sei blockchain documentation. Returns relevant documentation pages about Sei EVM development, smart contracts, node operations, AI tooling, and more.',
						inputSchema: {
							type: 'object',
							properties: {
								query: {
									type: 'string',
									description: 'The search query to find relevant Sei documentation'
								}
							},
							required: ['query']
						}
					}
				]
			}
		});
	}

	if (method === 'tools/call') {
		const toolName = params?.name;
		const toolArgs = params?.arguments;

		if (toolName === 'search_sei_docs') {
			const query = toolArgs?.query;
			if (!query) {
				return NextResponse.json({
					jsonrpc: '2.0',
					id,
					result: {
						content: [{ type: 'text', text: 'Error: query parameter is required' }],
						isError: true
					}
				});
			}

			const results = await searchDocs(query, 8);

			if (results.length === 0) {
				return NextResponse.json({
					jsonrpc: '2.0',
					id,
					result: {
						content: [
							{
								type: 'text',
								text: `No results found for "${query}". You can browse docs at ${DOCS_BASE_URL}`
							}
						]
					}
				});
			}

			const text = results
				.map((r: any, i: number) => `## ${i + 1}. ${r.title}\nURL: ${r.url}\nRelevance: ${(r.score * 100).toFixed(0)}%\n\n${r.content}`)
				.join('\n\n---\n\n');

			return NextResponse.json({
				jsonrpc: '2.0',
				id,
				result: {
					content: [{ type: 'text', text }]
				}
			});
		}

		return NextResponse.json({
			jsonrpc: '2.0',
			id,
			error: { code: -32601, message: `Unknown tool: ${toolName}` }
		});
	}

	// Unsupported method
	return NextResponse.json({
		jsonrpc: '2.0',
		id,
		error: { code: -32601, message: `Method not found: ${method}` }
	});
}
