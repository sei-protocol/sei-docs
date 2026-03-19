'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport, type UIMessage } from 'ai';
import { useState, useRef, useEffect, useCallback, useMemo, type ReactNode, type PointerEvent as ReactPointerEvent } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AIAssistantIcon } from './AIAssistantIcon';

const PANEL_WIDTH_STORAGE_KEY = 'sei-ai-panel-width';
const ACTIVE_CHAT_STORAGE_KEY = 'sei-ai-active-messages';
const CHAT_HISTORY_STORAGE_KEY = 'sei-ai-chat-history';
const RECENT_QUERIES_STORAGE_KEY = 'sei-ai-recent-queries';
const MAX_ARCHIVED_CHATS = 24;
const MAX_RECENT_QUERIES = 3;
const PERSIST_DEBOUNCE_MS = 400;
const DEFAULT_PANEL_WIDTH = 420;
const MIN_PANEL_WIDTH = 280;
const MAX_PANEL_WIDTH = 920;

/** Shown in the empty state; rotated from the pool on mount and on “New chat”. */
const STARTER_QUESTIONS_DISPLAY_COUNT = 3;

const STARTER_QUESTION_POOL: readonly string[] = [
	'How do I deploy a contract on Sei?',
	'What is Sei Giga?',
	'What is Twin Turbo Consensus?',
	'How do I connect wagmi to Sei?',
	'How do I run a Sei validator node?',
	'What is parallelized EVM and how does Sei use it?',
	'How do I bridge assets to Sei?',
	'What wallets support Sei?',
	'How do I query chain state with the Sei RPC?',
	'What is the difference between Sei EVM and CosmWasm on Sei?',
	'How do I set up a local Sei devnet?',
	'What are the Sei mainnet and testnet chain IDs?',
	'How does gas pricing work on Sei?',
	'How do I submit a governance proposal on Sei?',
	'What is SeiDB and why does it matter?',
	'How do I index Sei chain data?',
	'How do I use MetaMask on Sei EVM?',
	'What is optimistic parallel execution?',
	'How do I stake SEI and choose a validator?',
	'What slashing conditions apply to Sei validators?',
	'How do I troubleshoot a stuck or failing transaction?',
	'Where can I find Sei faucet or test tokens?',
	'How do I verify a smart contract on a Sei block explorer?',
	'What are the recommended RPC endpoints for production apps?',
	'How does IBC work with Sei?',
	'How do I build a dApp frontend for Sei?',
	'What programming languages can I use for Sei smart contracts?',
	'How do I handle finality and confirmations in my app?',
	'What are Sei’s performance targets compared to other chains?',
	'How do I report a security issue for Sei infrastructure?'
];

function pickRandomSubset<T>(items: readonly T[], count: number): T[] {
	const n = Math.min(count, items.length);
	const copy = [...items];
	for (let i = copy.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[copy[i], copy[j]] = [copy[j], copy[i]];
	}
	return copy.slice(0, n);
}

function newChatInstanceId(): string {
	return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `chat-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

type SeiArchivedChat = {
	id: string;
	updatedAt: number;
	title: string;
	messages: UIMessage[];
};

function clampPanelWidth(width: number, viewportWidth: number): number {
	const max = Math.min(viewportWidth - 16, MAX_PANEL_WIDTH);
	return Math.min(max, Math.max(MIN_PANEL_WIDTH, width));
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

function firstUserTitle(msgs: any[]): string {
	for (const m of msgs) {
		if (m.role === 'user') {
			const t = getMessageText(m).trim();
			if (t) return t.length > 72 ? `${t.slice(0, 69)}…` : t;
		}
	}
	return 'Chat';
}

function formatRelativeTime(ts: number): string {
	const diff = Date.now() - ts;
	const sec = Math.floor(diff / 1000);
	if (sec < 45) return 'Just now';
	const min = Math.floor(sec / 60);
	if (min < 60) return `${min}m ago`;
	const hr = Math.floor(min / 60);
	if (hr < 24) return `${hr}h ago`;
	const day = Math.floor(hr / 24);
	if (day < 7) return `${day}d ago`;
	return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function parseArchivedChats(raw: string | null): SeiArchivedChat[] {
	if (!raw) return [];
	try {
		const p = JSON.parse(raw);
		if (!Array.isArray(p)) return [];
		return p
			.filter(
				(x: unknown): x is SeiArchivedChat =>
					typeof x === 'object' && x !== null && 'id' in x && 'updatedAt' in x && 'title' in x && 'messages' in x && Array.isArray((x as SeiArchivedChat).messages)
			)
			.slice(0, MAX_ARCHIVED_CHATS);
	} catch {
		return [];
	}
}

function cloneMessages(msgs: UIMessage[]): UIMessage[] {
	try {
		return JSON.parse(JSON.stringify(msgs)) as UIMessage[];
	} catch {
		return [...msgs];
	}
}

export function AIAssistant() {
	const [isOpen, setIsOpen] = useState(false);
	const [input, setInput] = useState('');
	const [panelWidth, setPanelWidth] = useState(DEFAULT_PANEL_WIDTH);
	const [storageReady, setStorageReady] = useState(false);
	const [chatHistory, setChatHistory] = useState<SeiArchivedChat[]>([]);
	const [recentQueries, setRecentQueries] = useState<string[]>([]);
	const [historyOpen, setHistoryOpen] = useState(false);
	const [starterPickKey, setStarterPickKey] = useState(0);
	const [chatInstanceId, setChatInstanceId] = useState(newChatInstanceId);
	const pathname = usePathname();
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLTextAreaElement>(null);
	const historyWrapRef = useRef<HTMLDivElement>(null);
	const messagesToRestoreAfterSwitchRef = useRef<UIMessage[] | null>(null);
	const lastRecordedUserRef = useRef<string | null>(null);
	const panelWidthDuringDrag = useRef(DEFAULT_PANEL_WIDTH);
	const panelWidthRef = useRef(DEFAULT_PANEL_WIDTH);
	panelWidthRef.current = panelWidth;

	const { messages, sendMessage, status, setMessages, error } = useChat({
		id: chatInstanceId,
		transport: new DefaultChatTransport({
			api: '/api/chat',
			body: { currentPageUrl: pathname }
		})
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
		try {
			const active = localStorage.getItem(ACTIVE_CHAT_STORAGE_KEY);
			if (active) {
				const parsed = JSON.parse(active);
				if (Array.isArray(parsed) && parsed.length > 0) {
					setMessages(parsed as UIMessage[]);
				}
			}
			setChatHistory(parseArchivedChats(localStorage.getItem(CHAT_HISTORY_STORAGE_KEY)));
			const rqRaw = localStorage.getItem(RECENT_QUERIES_STORAGE_KEY);
			if (rqRaw) {
				const rq = JSON.parse(rqRaw);
				if (Array.isArray(rq)) {
					const filtered = rq.filter((q: unknown): q is string => typeof q === 'string' && q.trim().length > 0);
					const trimmed = filtered.slice(0, MAX_RECENT_QUERIES);
					setRecentQueries(trimmed);
					if (filtered.length > trimmed.length) {
						try {
							localStorage.setItem(RECENT_QUERIES_STORAGE_KEY, JSON.stringify(trimmed));
						} catch {
							/* ignore */
						}
					}
				}
			}
		} catch {
			/* ignore */
		}
		setStorageReady(true);
	}, [setMessages]);

	/** After `chatInstanceId` changes, `useChat` builds a new Chat; apply restored messages on that instance (sync `setMessages` in the same tick would target the old instance). */
	useEffect(() => {
		const pending = messagesToRestoreAfterSwitchRef.current;
		if (pending === null) return;
		messagesToRestoreAfterSwitchRef.current = null;
		setMessages(pending);
	}, [chatInstanceId, setMessages]);

	useEffect(() => {
		if (!isOpen) setHistoryOpen(false);
	}, [isOpen]);

	useEffect(() => {
		if (!storageReady) return;
		const t = window.setTimeout(() => {
			try {
				if (messages.length === 0) {
					localStorage.removeItem(ACTIVE_CHAT_STORAGE_KEY);
				} else {
					localStorage.setItem(ACTIVE_CHAT_STORAGE_KEY, JSON.stringify(messages));
				}
			} catch {
				/* quota or private mode */
			}
		}, PERSIST_DEBOUNCE_MS);
		return () => window.clearTimeout(t);
	}, [messages, storageReady]);

	useEffect(() => {
		if (!storageReady) return;
		const last = messages[messages.length - 1];
		if (last?.role !== 'user') return;
		const text = getMessageText(last).trim();
		if (!text || text === lastRecordedUserRef.current) return;
		lastRecordedUserRef.current = text;
		setRecentQueries((prev) => {
			const next = [text, ...prev.filter((q) => q !== text)].slice(0, MAX_RECENT_QUERIES);
			try {
				localStorage.setItem(RECENT_QUERIES_STORAGE_KEY, JSON.stringify(next));
			} catch {
				/* ignore */
			}
			return next;
		});
	}, [messages, storageReady]);

	useEffect(() => {
		if (!historyOpen) return;
		const onDown = (e: MouseEvent) => {
			const el = historyWrapRef.current;
			if (el && !el.contains(e.target as Node)) setHistoryOpen(false);
		};
		document.addEventListener('mousedown', onDown);
		return () => document.removeEventListener('mousedown', onDown);
	}, [historyOpen]);

	useEffect(() => {
		if (isOpen && inputRef.current) {
			inputRef.current.focus();
		}
	}, [isOpen]);

	useEffect(() => {
		try {
			const raw = localStorage.getItem(PANEL_WIDTH_STORAGE_KEY);
			if (raw) {
				const n = parseInt(raw, 10);
				if (!Number.isNaN(n)) {
					setPanelWidth(clampPanelWidth(n, window.innerWidth));
				}
			}
		} catch {
			/* ignore */
		}
	}, []);

	useEffect(() => {
		const onResize = () => {
			setPanelWidth((w) => clampPanelWidth(w, window.innerWidth));
		};
		window.addEventListener('resize', onResize);
		return () => window.removeEventListener('resize', onResize);
	}, []);

	const handleResizePointerDown = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		const startX = e.clientX;
		const startW = panelWidthRef.current;
		panelWidthDuringDrag.current = startW;

		const onMove = (ev: PointerEvent) => {
			const next = clampPanelWidth(startW + (startX - ev.clientX), window.innerWidth);
			panelWidthDuringDrag.current = next;
			setPanelWidth(next);
		};
		const onUp = () => {
			window.removeEventListener('pointermove', onMove);
			window.removeEventListener('pointerup', onUp);
			window.removeEventListener('pointercancel', onUp);
			try {
				localStorage.setItem(PANEL_WIDTH_STORAGE_KEY, String(panelWidthDuringDrag.current));
			} catch {
				/* ignore */
			}
		};
		window.addEventListener('pointermove', onMove);
		window.addEventListener('pointerup', onUp);
		window.addEventListener('pointercancel', onUp);
	}, []);

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

	const pushArchivedSession = useCallback((msgs: UIMessage[]) => {
		if (msgs.length === 0) return;
		const session: SeiArchivedChat = {
			id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
			updatedAt: Date.now(),
			title: firstUserTitle(msgs),
			messages: cloneMessages(msgs)
		};
		setChatHistory((prev) => {
			const next = [session, ...prev].slice(0, MAX_ARCHIVED_CHATS);
			try {
				localStorage.setItem(CHAT_HISTORY_STORAGE_KEY, JSON.stringify(next));
			} catch {
				/* ignore */
			}
			return next;
		});
	}, []);

	const handleNewChat = () => {
		messagesToRestoreAfterSwitchRef.current = null;
		pushArchivedSession(messages as UIMessage[]);
		setInput('');
		setStarterPickKey((k) => k + 1);
		lastRecordedUserRef.current = null;
		setChatInstanceId(newChatInstanceId());
		try {
			localStorage.removeItem(ACTIVE_CHAT_STORAGE_KEY);
		} catch {
			/* ignore */
		}
	};

	const handleLoadArchivedChat = (session: SeiArchivedChat) => {
		if ((messages as UIMessage[]).length > 0) {
			pushArchivedSession(messages as UIMessage[]);
		}
		messagesToRestoreAfterSwitchRef.current = cloneMessages(session.messages);
		setHistoryOpen(false);
		lastRecordedUserRef.current = null;
		setChatInstanceId(newChatInstanceId());
	};

	const starterQuestions = useMemo(() => pickRandomSubset(STARTER_QUESTION_POOL, STARTER_QUESTIONS_DISPLAY_COUNT), [starterPickKey]);

	return (
		<>
			<button onClick={() => setIsOpen(true)} className='sei-ai-trigger' aria-label='Ask AI' title='Ask AI (⌘I)'>
				<AIAssistantIcon />
				<span>Ask AI</span>
			</button>

			{isOpen &&
				createPortal(
					<div className='sei-ai-overlay' onClick={() => setIsOpen(false)}>
						<div
							className='sei-ai-panel'
							style={{ width: clampPanelWidth(panelWidth, typeof window !== 'undefined' ? window.innerWidth : MAX_PANEL_WIDTH) }}
							onClick={(e) => e.stopPropagation()}>
							<div
								className='sei-ai-resize-handle'
								onPointerDown={handleResizePointerDown}
								role='separator'
								aria-orientation='vertical'
								aria-label='Resize assistant panel'
								title='Drag to resize'
							/>
							<div className='sei-ai-header'>
								<div className='sei-ai-header-left'>
									<AIAssistantIcon />
									<span>Sei AI Assistant</span>
								</div>
								<div className='sei-ai-header-right'>
									<div className='sei-ai-history-wrap' ref={historyWrapRef}>
										<button
											type='button'
											onClick={() => setHistoryOpen((o) => !o)}
											className='sei-ai-header-btn'
											title='Past chats'
											aria-expanded={historyOpen}
											aria-haspopup='listbox'>
											<svg
												width='16'
												height='16'
												viewBox='0 0 24 24'
												fill='none'
												stroke='currentColor'
												strokeWidth='2'
												strokeLinecap='round'
												strokeLinejoin='round'
												aria-hidden>
												<circle cx='12' cy='12' r='10' />
												<polyline points='12 6 12 12 16 14' />
											</svg>
										</button>
										{historyOpen && (
											<div className='sei-ai-history-popover' role='listbox' aria-label='Past chats'>
												{chatHistory.length === 0 ? (
													<p className='sei-ai-history-empty'>No saved chats yet. Start a conversation, then use New chat to archive it here.</p>
												) : (
													<ul className='sei-ai-history-list'>
														{chatHistory.map((s) => (
															<li key={s.id}>
																<button type='button' className='sei-ai-history-item' onClick={() => handleLoadArchivedChat(s)}>
																	<span className='sei-ai-history-item-title'>{s.title}</span>
																	<span className='sei-ai-history-item-time'>{formatRelativeTime(s.updatedAt)}</span>
																</button>
															</li>
														))}
													</ul>
												)}
											</div>
										)}
									</div>
									<button type='button' onClick={handleNewChat} className='sei-ai-header-btn' title='New chat'>
										<svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
											<path d='M12 5v14M5 12h14' />
										</svg>
									</button>
									<button type='button' onClick={() => setIsOpen(false)} className='sei-ai-header-btn' title='Close (Esc)'>
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
										{recentQueries.length > 0 && (
											<div className='sei-ai-recent-wrap'>
												<p className='sei-ai-recent-label'>Your recent questions</p>
												<div className='sei-ai-recent-queries'>
													{recentQueries.map((q) => (
														<button
															key={q}
															type='button'
															disabled={isLoading}
															onClick={() => {
																if (isLoading) return;
																sendMessage({ text: q });
																setInput('');
															}}
															className='sei-ai-recent-chip'>
															{q.length > 56 ? `${q.slice(0, 53)}…` : q}
														</button>
													))}
												</div>
											</div>
										)}
										<p className='sei-ai-starters-label'>Suggestions</p>
										<div className='sei-ai-starters'>
											{starterQuestions.map((q) => (
												<button
													key={q}
													type='button'
													disabled={isLoading}
													onClick={() => {
														if (isLoading) return;
														sendMessage({ text: q });
														setInput('');
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
												<div className='sei-ai-msg-content sei-ai-msg-content-assistant'>
													<CopyReplyButton text={text} />
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

function CopyReplyButton({ text }: { text: string }) {
	const [copied, setCopied] = useState(false);

	const copy = async () => {
		try {
			await navigator.clipboard.writeText(text);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 2000);
		} catch {
			/* ignore */
		}
	};

	return (
		<button type='button' className='sei-ai-copy-reply' onClick={copy} title='Copy full reply' aria-label='Copy full reply'>
			{copied ? (
				<span className='sei-ai-copy-reply-label'>Copied</span>
			) : (
				<svg width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' aria-hidden>
					<rect x='9' y='9' width='13' height='13' rx='2' ry='2' />
					<path d='M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1' />
				</svg>
			)}
		</button>
	);
}

function CodeBlockWithCopy({ children }: { children: ReactNode }) {
	const preRef = useRef<HTMLPreElement>(null);
	const [copied, setCopied] = useState(false);

	const copy = async () => {
		const raw = preRef.current?.innerText ?? '';
		if (!raw) return;
		try {
			await navigator.clipboard.writeText(raw.replace(/\n$/, ''));
			setCopied(true);
			window.setTimeout(() => setCopied(false), 2000);
		} catch {
			/* ignore */
		}
	};

	return (
		<div className='sei-ai-code-block-wrap'>
			<button type='button' className='sei-ai-code-copy' onClick={copy} title='Copy code' aria-label='Copy code'>
				{copied ? (
					<span className='sei-ai-copy-reply-label'>Copied</span>
				) : (
					<svg
						width='14'
						height='14'
						viewBox='0 0 24 24'
						fill='none'
						stroke='currentColor'
						strokeWidth='2'
						strokeLinecap='round'
						strokeLinejoin='round'
						aria-hidden>
						<rect x='9' y='9' width='13' height='13' rx='2' ry='2' />
						<path d='M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1' />
					</svg>
				)}
			</button>
			<pre ref={preRef} className='sei-ai-code-block'>
				{children}
			</pre>
		</div>
	);
}

function MessageContent({ content }: { content: string }) {
	if (!content) return null;

	return (
		<div className='sei-ai-prose'>
			<ReactMarkdown
				remarkPlugins={[remarkGfm]}
				components={{
					pre: ({ children }) => <CodeBlockWithCopy>{children}</CodeBlockWithCopy>,
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
