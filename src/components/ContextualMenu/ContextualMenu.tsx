'use client';

import { useState, useEffect, useRef, Fragment } from 'react';
import { usePathname } from 'next/navigation';
import { toast } from 'sonner';

const DOCS_BASE_URL = 'https://docs.sei.io';
const MCP_SERVER_URL = `${DOCS_BASE_URL}/api/mcp`;

interface MenuAction {
	id: string;
	icon: React.ReactNode;
	label: string;
	sublabel: string;
	onClick: () => void;
}

function buildCursorDeepLink() {
	const config = JSON.stringify({ mcpServers: { 'sei-docs': { url: MCP_SERVER_URL } } });
	const b64 = btoa(config);
	return `cursor://anysphere.cursor-deeplink/mcp/install?name=sei-docs&config=${b64}`;
}

function buildVSCodeDeepLink() {
	const config = JSON.stringify({ name: 'sei-docs', type: 'http', url: MCP_SERVER_URL });
	return `vscode:mcp/install?${encodeURIComponent(config)}`;
}

export function ContextualMenu() {
	const [isOpen, setIsOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);
	const pathname = usePathname();

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
				setIsOpen(false);
			}
		};
		if (isOpen) document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [isOpen]);

	const isRootPage = pathname === '/' || pathname === '';
	const cleanPath = isRootPage ? '/learn' : pathname;
	const markdownUrl = `${DOCS_BASE_URL}${cleanPath}.md`;
	const localMdPath = `${cleanPath}.md`;

	const copyToClipboard = async (text: string, label: string) => {
		try {
			await navigator.clipboard.writeText(text);
			toast.success(`${label} copied to clipboard`);
		} catch {
			const ta = document.createElement('textarea');
			ta.value = text;
			ta.style.position = 'fixed';
			ta.style.opacity = '0';
			document.body.appendChild(ta);
			ta.select();
			document.execCommand('copy');
			document.body.removeChild(ta);
			toast.success(`${label} copied to clipboard`);
		}
		setIsOpen(false);
	};

	const actions: MenuAction[] = [
		{
			id: 'ask-ai',
			icon: <AskAIIcon />,
			label: 'Ask AI about this page',
			sublabel: 'Get instant answers from Sei AI',
			onClick: () => {
				const pageTitle = document.querySelector('h1')?.textContent?.trim() || pathname;
				window.dispatchEvent(
					new CustomEvent('sei-ask-ai', {
						detail: { pagePath: pathname, pageTitle, markdownUrl }
					})
				);
				setIsOpen(false);
			}
		},
		{
			id: 'claude',
			icon: <ClaudeIcon />,
			label: 'Open in Claude',
			sublabel: 'Ask questions about this page',
			onClick: () => {
				const pageRef = isRootPage
					? `Read the Sei documentation overview and help me understand it: ${DOCS_BASE_URL}`
					: `Read this Sei documentation page and help me understand it:\n${markdownUrl}`;
				window.open(`https://claude.ai/new?q=${encodeURIComponent(pageRef)}`, '_blank');
				setIsOpen(false);
			}
		},
		{
			id: 'chatgpt',
			icon: <ChatGPTIcon />,
			label: 'Open in ChatGPT',
			sublabel: 'Ask questions about this page',
			onClick: () => {
				const pageRef = isRootPage
					? `Read the Sei documentation overview and help me understand it: ${DOCS_BASE_URL}`
					: `Read this Sei documentation page and help me understand it:\n${markdownUrl}`;
				window.open(`https://chatgpt.com/?q=${encodeURIComponent(pageRef)}`, '_blank');
				setIsOpen(false);
			}
		},
		{
			id: 'cursor',
			icon: <CursorIcon />,
			label: 'Connect to Cursor',
			sublabel: 'Install MCP Server on Cursor',
			onClick: () => {
				window.open(buildCursorDeepLink(), '_self');
				toast.success('Opening Cursor to install Sei Docs MCP server…');
				setIsOpen(false);
			}
		},
		{
			id: 'vscode',
			icon: <VSCodeIcon />,
			label: 'Connect to VS Code',
			sublabel: 'Install MCP Server on VS Code',
			onClick: () => {
				window.open(buildVSCodeDeepLink(), '_self');
				toast.success('Opening VS Code to install Sei Docs MCP server…');
				setIsOpen(false);
			}
		},
		{
			id: 'mcp',
			icon: <MCPIcon />,
			label: 'Copy MCP Server',
			sublabel: 'Copy MCP Server URL',
			onClick: () => copyToClipboard(MCP_SERVER_URL, 'MCP Server URL')
		},
		{
			id: 'copy-page',
			icon: <CopyIcon />,
			label: 'Copy page',
			sublabel: 'Copy page as Markdown for LLMs',
			onClick: async () => {
				try {
					const res = await fetch(localMdPath);
					if (res.ok) {
						const md = await res.text();
						await copyToClipboard(md, 'Page content');
					} else {
						await copyToClipboard(`${DOCS_BASE_URL}${pathname}`, 'Page URL');
					}
				} catch {
					await copyToClipboard(`${DOCS_BASE_URL}${pathname}`, 'Page URL');
				}
			}
		},
		{
			id: 'view-md',
			icon: <MarkdownIcon />,
			label: 'View as Markdown',
			sublabel: 'View this page as plain text',
			onClick: () => {
				window.open(localMdPath, '_blank');
				setIsOpen(false);
			}
		}
	];

	return (
		<div className='sei-ctx-menu' ref={menuRef}>
			<button className='sei-ctx-trigger' onClick={() => setIsOpen(!isOpen)} aria-label='AI tools menu'>
				<ClaudeIcon />
				<span>Open in Claude</span>
				<svg
					width='12'
					height='12'
					viewBox='0 0 24 24'
					fill='none'
					stroke='currentColor'
					strokeWidth='2.5'
					strokeLinecap='round'
					strokeLinejoin='round'
					style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }}>
					<polyline points='18 15 12 9 6 15' />
				</svg>
			</button>

			{isOpen && (
				<div className='sei-ctx-dropdown'>
					{actions.map((action) => (
						<Fragment key={action.id}>
							<button className={`sei-ctx-action${action.id === 'ask-ai' ? ' sei-ctx-action-highlight' : ''}`} onClick={action.onClick}>
								<span className='sei-ctx-action-icon'>{action.icon}</span>
								<span className='sei-ctx-action-text'>
									<span className='sei-ctx-action-label'>
										{action.label}
										{['claude', 'chatgpt', 'view-md'].includes(action.id) && <ExternalIcon />}
									</span>
									<span className='sei-ctx-action-sublabel'>{action.sublabel}</span>
								</span>
							</button>
							{action.id === 'ask-ai' && <div className='sei-ctx-separator' />}
						</Fragment>
					))}
				</div>
			)}
		</div>
	);
}

function ClaudeIcon() {
	return (
		<svg width='18' height='18' viewBox='0 0 24 24' fill='none'>
			<path d='M16.5 3.5L20 12l-3.5 8.5M7.5 3.5L4 12l3.5 8.5M14 4l-4 16' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
		</svg>
	);
}

function ChatGPTIcon() {
	return (
		<svg width='18' height='18' viewBox='0 0 24 24' fill='none'>
			<circle cx='12' cy='12' r='9' stroke='currentColor' strokeWidth='1.5' />
			<path d='M8 12.5s1.5 2 4 2 4-2 4-2' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' />
			<circle cx='9.5' cy='9.5' r='1' fill='currentColor' />
			<circle cx='14.5' cy='9.5' r='1' fill='currentColor' />
		</svg>
	);
}

function CursorIcon() {
	return (
		<svg width='18' height='18' viewBox='0 0 24 24' fill='none'>
			<path d='M5 3l14 9-6 2-3 6z' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
		</svg>
	);
}

function VSCodeIcon() {
	return (
		<svg width='18' height='18' viewBox='0 0 24 24' fill='none'>
			<path d='M17 3l4 2v14l-4 2-10-8L4 15V9l3-2 10 8V3z' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
		</svg>
	);
}

function MCPIcon() {
	return (
		<svg width='18' height='18' viewBox='0 0 24 24' fill='none'>
			<path
				d='M12 2v4m0 12v4M2 12h4m12 0h4M6.34 6.34l2.83 2.83m5.66 5.66l2.83 2.83M17.66 6.34l-2.83 2.83m-5.66 5.66l-2.83 2.83'
				stroke='currentColor'
				strokeWidth='1.5'
				strokeLinecap='round'
			/>
			<circle cx='12' cy='12' r='3' stroke='currentColor' strokeWidth='1.5' />
		</svg>
	);
}

function CopyIcon() {
	return (
		<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'>
			<rect x='9' y='9' width='13' height='13' rx='2' ry='2' />
			<path d='M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1' />
		</svg>
	);
}

function MarkdownIcon() {
	return (
		<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'>
			<rect x='2' y='4' width='20' height='16' rx='2' />
			<path d='M6 8v8l3-3 3 3V8M18 8l-2 4h4l-2 4' />
		</svg>
	);
}

function AskAIIcon() {
	return (
		<svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'>
			<path d='M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z' />
			<path d='M12 7v2M12 13h.01' />
		</svg>
	);
}

function ExternalIcon() {
	return (
		<svg
			width='11'
			height='11'
			viewBox='0 0 24 24'
			fill='none'
			stroke='currentColor'
			strokeWidth='2'
			strokeLinecap='round'
			strokeLinejoin='round'
			style={{ marginLeft: '4px', opacity: 0.5 }}>
			<path d='M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3' />
		</svg>
	);
}
