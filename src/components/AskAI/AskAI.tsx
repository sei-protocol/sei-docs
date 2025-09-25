'use client';

import { useCallback, useEffect, useRef } from 'react';

const COOKBOOK_APP_ID = '0117f014f27a56633c30024d41166aa2';
const WIDGET_CSS = 'https://bb-chat-widget.s3.us-east-1.amazonaws.com/assets/style.css';
const WIDGET_JS = 'https://bb-chat-widget.s3.us-east-1.amazonaws.com/assets/index.js';
const WIDGET_ID = 'bytebellai';

type AskAIProps = {
	className?: string;
};

export const AskAI = ({ className }: AskAIProps) => {
	const hostRef = useRef<HTMLDivElement>(null);
	const launcherRef = useRef<HTMLElement | null>(null);

	useEffect(() => {
		if (!hostRef.current) return;

		// --- 1. Create (or reuse) the shadow root
		const shadow = hostRef.current.shadowRoot ?? hostRef.current.attachShadow({ mode: 'open' });

		// --- 2. <link> to the widget’s CSS (stays scoped to this shadow root)
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = WIDGET_CSS;
		shadow.appendChild(link);

		// --- 3. The container the script looks for
		const container = document.createElement('div');
		container.id = WIDGET_ID;
		container.dataset.appId = COOKBOOK_APP_ID;
		// Prefer top-right so it sits with the navbar instead of bottom-right default
		container.dataset.position = 'top-right';
		// Fine-tune placement near the navbar area
		container.dataset.top = '12px';
		container.dataset.right = '16px';
		shadow.appendChild(container);

		/* --- 4. Patch document.getElementById just once
         so that “bytebellai” resolves to the shadow-root element.  */
		const originalGetById = document.getElementById.bind(document);
		document.getElementById = (id: string) => (id === WIDGET_ID ? container : originalGetById(id));

		// --- 5. Load the widget script after everything’s ready
		const script = document.createElement('script');
		script.src = WIDGET_JS;
		script.async = true;
		shadow.appendChild(script);

		// Observe the shadow DOM to capture the widget launcher button when it mounts
		const observer = new MutationObserver(() => {
			if (launcherRef.current) return;
			const candidate = shadow.querySelector('button, [role="button"]') as HTMLElement | null;
			if (candidate) {
				launcherRef.current = candidate;
				candidate.style.opacity = '0';
				candidate.style.pointerEvents = 'none';
			}
		});
		observer.observe(shadow as unknown as Node, { childList: true, subtree: true });

		// --- 6. Cleanup on unmount
		return () => {
			shadow.innerHTML = '';
			document.getElementById = originalGetById; // restore original API
			observer.disconnect();
		};
	}, []);

	const handleOpen = useCallback(() => {
		if (launcherRef.current) {
			launcherRef.current.click();
			return;
		}
		const fallback = hostRef.current?.shadowRoot?.querySelector('button, [role="button"]') as HTMLElement | null;
		if (fallback) {
			fallback.click();
			return;
		}

		// Last-resort: broadcast a generic open event used by some widgets
		try {
			window.dispatchEvent(new CustomEvent('bb:open'));
		} catch {}
	}, []);

	return (
		<div className={`flex items-center gap-2${className ? ` ${className}` : ''}`}>
			<button
				type='button'
				onClick={handleOpen}
				className='px-3 py-1 rounded-md bg-black text-white dark:bg-white dark:text-black text-sm font-medium hover:opacity-90 transition'>
				Sei Copilot
			</button>
			{/* Keep the widget host out of normal layout */}
			<div ref={hostRef} style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} />
		</div>
	);
};
