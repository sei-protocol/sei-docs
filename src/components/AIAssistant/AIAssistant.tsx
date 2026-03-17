'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AIAssistantIcon } from './AIAssistantIcon';

export function AIAssistant() {
	const [isOpen, setIsOpen] = useState(false);
	const [input, setInput] = useState('');
	const pathname = usePathname();
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLTextAreaElement>(null);

	const { messages, sendMessage, status, setMessages, error } = useChat({
		api: '/api/chat',
		body: { currentPageUrl: pathname }
	});

	const isLoading = status === 'submitted' || status === 'streaming';

	const isSearching =
		isLoading &&
		messages.some((msg: any) => {
			if (msg.role !== 'assistant') return false;
			if (Array.isArray(msg.parts)) {
				return msg.parts.some((p: any) => p.type === 'tool-invocation' && p.toolInvocation?.state !== 'result');
			}
			if (Array.isArray(msg.toolInvocations)) {
				return msg.toolInvocations.some((t: any) => t.state !== 'result');
			}
			return false;
		});

	const scrollToBottom = useCallback(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, []);

	useEffect(() => {
		scrollToBottom();
	}, [messages, scrollToBottom]);

	useEffect(() => {
		if (isOpen && inputRef.current) {
			inputRef.current.focus();
		}
	}, [isOpen]);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
				e.preventDefault();
				setIsOpen((prev) => !prev);
			}
			if (e.key === 'Escape' && isOpen) {
				setIsOpen(false);
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [isOpen]);

	const handleFormSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!input.trim() || isLoading) return;
		sendMessage({ text: input });
		setInput('');
	};

	const handleNewChat = () => {
		setMessages([]);
		setInput('');
	};

	const starterQuestions = ['How do I deploy a contract on Sei?', 'What is Twin Turbo Consensus?', 'How do I connect wagmi to Sei?'];

	return (
		<>
			<button onClick={() => setIsOpen(true)} className='sei-ai-trigger' aria-label='Ask AI' title='Ask AI (⌘I)'>
				<AIAssistantIcon />
				<span>Ask AI</span>
			</button>

			{isOpen &&
				createPortal(
					<div className='sei-ai-overlay' onClick={() => setIsOpen(false)}>
						<div className='sei-ai-panel' onClick={(e) => e.stopPropagation()}>
							<div className='sei-ai-header'>
								<div className='sei-ai-header-left'>
									<AIAssistantIcon />
									<span>Sei AI Assistant</span>
								</div>
								<div className='sei-ai-header-right'>
									<button onClick={handleNewChat} className='sei-ai-header-btn' title='New chat'>
										<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
											<path d='M12 5v14M5 12h14' />
										</svg>
									</button>
									<button onClick={() => setIsOpen(false)} className='sei-ai-header-btn' title='Close (Esc)'>
										<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
											<path d='M18 6L6 18M6 6l12 12' />
										</svg>
									</button>
								</div>
							</div>

							<div className='sei-ai-messages'>
								{messages.length === 0 ? (
									<div className='sei-ai-empty'>
										<div className='sei-ai-empty-icon'>
											<AIAssistantIcon size={32} />
										</div>
										<p className='sei-ai-empty-title'>Ask anything about Sei</p>
										<p className='sei-ai-empty-subtitle'>I can search the docs and answer questions about development, architecture, and more.</p>
										<div className='sei-ai-starters'>
											{starterQuestions.map((q) => (
												<button
													key={q}
													onClick={() => {
														setInput(q);
													}}
													className='sei-ai-starter'>
													{q}
												</button>
											))}
										</div>
									</div>
								) : (
									messages.map((msg: any) => {
										if (msg.role === 'assistant' && hasToolInvocations(msg)) return null;
										const text = getMessageText(msg);
										if (msg.role === 'assistant' && !text) return null;
										return (
											<div key={msg.id} className={`sei-ai-msg sei-ai-msg-${msg.role}`}>
												{msg.role === 'assistant' && (
													<div className='sei-ai-msg-avatar'>
														<AIAssistantIcon size={16} />
													</div>
												)}
												<div className='sei-ai-msg-content'>
													<MessageContent content={text} />
												</div>
											</div>
										);
									})
								)}
								{isLoading &&
									(() => {
										const lastVisibleAssistant = [...messages].reverse().find((m: any) => m.role === 'assistant' && !hasToolInvocations(m) && getMessageText(m));
										if (lastVisibleAssistant && lastVisibleAssistant === messages[messages.length - 1]) return null;
										return (
											<div className='sei-ai-msg sei-ai-msg-assistant'>
												<div className='sei-ai-msg-avatar'>
													<AIAssistantIcon size={16} />
												</div>
												<div className='sei-ai-msg-content'>
													<div className='sei-ai-status-indicator'>
														<div className='sei-ai-spinner' />
														<span>{isSearching ? 'Searching documentation...' : 'Thinking...'}</span>
													</div>
												</div>
											</div>
										);
									})()}
								{error && <div className='sei-ai-error'>{error.message || 'Something went wrong. Please try again.'}</div>}
								<div ref={messagesEndRef} />
							</div>

							<form onSubmit={handleFormSubmit} className='sei-ai-input-form'>
								<textarea
									ref={inputRef}
									value={input}
									onChange={(e) => setInput(e.target.value)}
									placeholder='Ask about Sei docs...'
									rows={1}
									className='sei-ai-input'
									onKeyDown={(e) => {
										if (e.key === 'Enter' && !e.shiftKey) {
											e.preventDefault();
											handleFormSubmit(e);
										}
									}}
								/>
								<button type='submit' disabled={isLoading || !input.trim()} className='sei-ai-send' aria-label='Send'>
									<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
										<path d='M22 2L11 13M22 2l-7 20-4-9-9-4z' />
									</svg>
								</button>
							</form>
						</div>
					</div>,
					document.body
				)}
		</>
	);
}

function getMessageText(msg: any): string {
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

function hasToolInvocations(msg: any): boolean {
	if (Array.isArray(msg.parts)) {
		return msg.parts.some((p: any) => p.type === 'tool-invocation');
	}
	return Array.isArray(msg.toolInvocations) && msg.toolInvocations.length > 0;
}

function MessageContent({ content }: { content: string }) {
	if (!content) return null;

	return (
		<div className='sei-ai-prose'>
			<ReactMarkdown
				remarkPlugins={[remarkGfm]}
				components={{
					pre: ({ children }) => <pre className='sei-ai-code-block'>{children}</pre>,
					code: ({ children, className }) => (className ? <code>{children}</code> : <code className='sei-ai-inline-code'>{children}</code>),
					a: ({ href, children }) => (
						<a href={href} target='_blank' rel='noopener noreferrer' className='sei-ai-link'>
							{children}
						</a>
					)
				}}>
				{content}
			</ReactMarkdown>
		</div>
	);
}
