'use client';

import React, { useState } from 'react';
import { IconSend, IconRobot, IconUser, IconLoader2, IconSparkles, IconTerminal2 } from '@tabler/icons-react';

interface Message {
	role: 'user' | 'assistant';
	content: string;
	timestamp: Date;
}

const exampleResponses: Record<string, string> = {
	balance: 'Let me check your SEI balance...\n\nYour address `0x742d35Cc6634C0532925a3b844e3e28170Dc71a9` has a balance of **42.5 SEI** on mainnet.',
	send: "I'll send 1 SEI to that address.\n\n✅ Transaction submitted!\n- **Hash**: `0xabc123def456...`\n- **Block**: 12,345,678\n- **Gas Used**: 21,000\n- **Status**: Confirmed",
	contract:
		'Let me analyze this address...\n\n✅ This is a **smart contract**\n- **Type**: ERC20 Token\n- **Name**: USD Coin\n- **Symbol**: USDC\n- **Decimals**: 6\n- **Total Supply**: 1,000,000 USDC',
	nft: 'Checking NFT ownership...\n\n🎨 **NFT Details**:\n- **Collection**: Sei Punks\n- **Token ID**: #1234\n- **Owner**: `0x742d35Cc6634...`\n- **Attributes**: Rare background, Gold chain\n- **Last Sale**: 100 SEI',
	block:
		'Analyzing the latest block...\n\n📦 **Block #15,234,567**\n- **Timestamp**: 2 seconds ago\n- **Transactions**: 142\n- **Gas Used**: 12.5M / 30M\n- **Validator**: SeiValidator1'
};

export function MCPDemo() {
	const [messages, setMessages] = useState<Message[]>([
		{
			role: 'assistant',
			content:
				"Hi! I'm your AI assistant powered by Sei MCP Server. Try asking me to:\n\n• Check your balance\n• Send SEI to an address\n• Analyze a contract\n• Get NFT info\n• Explore the latest block",
			timestamp: new Date()
		}
	]);
	const [input, setInput] = useState('');
	const [isTyping, setIsTyping] = useState(false);

	const handleSend = () => {
		if (!input.trim()) return;

		const userMessage: Message = {
			role: 'user',
			content: input,
			timestamp: new Date()
		};

		setMessages((prev) => [...prev, userMessage]);
		setInput('');
		setIsTyping(true);

		// Simulate AI response
		setTimeout(() => {
			let response = 'I can help you with that! In a real implementation, I would use the MCP Server to execute this request.';

			// Check for keywords and provide appropriate response
			const lowerInput = input.toLowerCase();
			if (lowerInput.includes('balance')) {
				response = exampleResponses.balance;
			} else if (lowerInput.includes('send') && lowerInput.includes('sei')) {
				response = exampleResponses.send;
			} else if (lowerInput.includes('contract') || lowerInput.includes('0x3894085ef7ff0f0aedf52e2a2704928d1ec074f1')) {
				response = exampleResponses.contract;
			} else if (lowerInput.includes('nft')) {
				response = exampleResponses.nft;
			} else if (lowerInput.includes('block')) {
				response = exampleResponses.block;
			}

			const assistantMessage: Message = {
				role: 'assistant',
				content: response,
				timestamp: new Date()
			};

			setMessages((prev) => [...prev, assistantMessage]);
			setIsTyping(false);
		}, 1500);
	};

	return (
		<div className='w-full max-w-5xl mx-auto my-12'>
			<div className=' overflow-hidden border border-neutral-200/50 dark:border-neutral-800/50 bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-red-500/5 dark:from-purple-900/20 dark:via-blue-900/10 dark:to-red-900/20 shadow-xl'>
				{/* Header */}
				<div className='bg-gradient-to-r from-purple-600 via-purple-600 to-blue-600 p-6'>
					<div className='flex items-center gap-4'>
						<div className='w-12 h-12  bg-white/20 backdrop-blur-sm flex items-center justify-center'>
							<IconTerminal2 className='h-6 w-6 text-white' />
						</div>
						<div>
							<h3 className='text-white font-semibold text-lg flex items-center gap-2'>
								MCP Server Interactive Demo
								<IconSparkles className='h-5 w-5 text-yellow-300' />
							</h3>
							<p className='text-white/80 text-sm mt-0.5'>Experience AI-powered blockchain interactions</p>
						</div>
					</div>
				</div>

				{/* Notice Bar */}
				<div className='bg-white/50 dark:bg-neutral-900/30 border-b border-neutral-200/50 dark:border-neutral-800/30 px-6 py-3'>
					<p className='text-sm text-neutral-700 dark:text-neutral-300 flex items-center gap-2'>
						<span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'>
							Demo Mode
						</span>
						<span>This is a simulation. To use real blockchain operations, configure MCP in your AI assistant.</span>
					</p>
				</div>

				{/* Chat Area */}
				<div className='h-[500px] overflow-y-auto p-6 space-y-6 scroll-smooth bg-white/30 dark:bg-neutral-950/30' style={{ scrollbarWidth: 'thin' }}>
					{messages.map((message, index) => (
						<div
							key={index}
							className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
							{message.role === 'assistant' && (
								<div className='w-10 h-10  bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg'>
									<IconRobot className='h-5 w-5 text-white' />
								</div>
							)}

							<div className={`max-w-[75%] ${message.role === 'user' ? 'order-1' : ''}`}>
								<div
									className={` px-5 py-3 ${
										message.role === 'user'
											? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
											: 'bg-white dark:bg-neutral-800/80 backdrop-blur-sm border border-neutral-200 dark:border-neutral-700 shadow-md'
									}`}>
									<div
										className={`text-sm leading-relaxed whitespace-pre-wrap ${message.role === 'assistant' ? 'prose prose-sm dark:prose-invert max-w-none' : ''}`}>
										{message.content.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).map((part, i) => {
											if (part.startsWith('`') && part.endsWith('`')) {
												return (
													<code
														key={i}
														className={`px-1.5 py-0.5 rounded ${
															message.role === 'user' ? 'bg-white/20 text-white' : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
														} font-mono text-xs`}>
														{part.slice(1, -1)}
													</code>
												);
											} else if (part.startsWith('**') && part.endsWith('**')) {
												return <strong key={i}>{part.slice(2, -2)}</strong>;
											}
											return part;
										})}
									</div>
								</div>
								<div
									className={`text-xs mt-2 ${
										message.role === 'user' ? 'text-right text-neutral-500 dark:text-neutral-400' : 'text-neutral-500 dark:text-neutral-400'
									}`}>
									{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
								</div>
							</div>

							{message.role === 'user' && (
								<div className='w-10 h-10  bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shrink-0 shadow-lg order-2'>
									<IconUser className='h-5 w-5 text-white' />
								</div>
							)}
						</div>
					))}

					{isTyping && (
						<div className='flex gap-4 justify-start animate-in fade-in slide-in-from-bottom-2 duration-300'>
							<div className='w-10 h-10  bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg'>
								<IconRobot className='h-5 w-5 text-white' />
							</div>
							<div className='bg-white dark:bg-neutral-800/80 backdrop-blur-sm border border-neutral-200 dark:border-neutral-700  px-5 py-3 shadow-md'>
								<div className='flex items-center gap-2'>
									<IconLoader2 className='h-4 w-4 animate-spin text-purple-600' />
									<span className='text-sm text-neutral-600 dark:text-neutral-400'>AI is thinking...</span>
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Input Area */}
				<div className='border-t border-neutral-200/50 dark:border-neutral-800/30 bg-white/50 dark:bg-neutral-900/30 p-6'>
					<div className='flex gap-3'>
						<input
							type='text'
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
							placeholder="Try: 'Check my balance' or 'Is 0x3894085ef7ff0f0aedf52e2a2704928d1ec074f1 a contract?'"
							className='flex-1 px-4 py-3 bg-white/80 dark:bg-neutral-800/50 backdrop-blur-sm border border-neutral-300/50 dark:border-neutral-600/50  text-sm placeholder:text-neutral-500 dark:placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 dark:focus:ring-purple-400/50 focus:border-transparent transition-all'
						/>
						<button
							onClick={handleSend}
							disabled={!input.trim() || isTyping}
							className='px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-neutral-400 disabled:to-neutral-500 text-white  transition-all flex items-center gap-2 font-medium shadow-lg hover:shadow-xl disabled:shadow-none'>
							<IconSend className='h-4 w-4' />
							Send
						</button>
					</div>
					<p className='text-xs text-neutral-500 dark:text-neutral-400 mt-3 text-center'>
						This demo simulates MCP interactions. Configure MCP in Cursor, Windsurf, or Claude for real blockchain operations.
					</p>
				</div>
			</div>
		</div>
	);
}
