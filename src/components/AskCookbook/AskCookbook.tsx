'use client';

import { useEffect, useRef } from 'react';

const COOKBOOK_APP_ID = '0117f014f27a56633c30024d41166aa2';
const WIDGET_CSS = 'https://bb-chat-widget.s3.us-east-1.amazonaws.com/assets/style.css';
const WIDGET_JS = 'https://bb-chat-widget.s3.us-east-1.amazonaws.com/assets/index.js';
const WIDGET_ID = 'bytebellai';

export const AskCookbook = () => {
	const hostRef = useRef<HTMLDivElement>(null);
	const isMountedRef = useRef<boolean>(false);
	const originalGetByIdRef = useRef<typeof document.getElementById | null>(null);

	useEffect(() => {
		if (!hostRef.current) return;

		const mountWidget = () => {
			if (isMountedRef.current || !hostRef.current) return;

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
			shadow.appendChild(container);

			/* --- 4. Patch document.getElementById just once
			  so that “bytebellai” resolves to the shadow-root element.  */
			originalGetByIdRef.current = document.getElementById.bind(document);
			document.getElementById = (id: string) => (id === WIDGET_ID ? container : (originalGetByIdRef.current as typeof document.getElementById)(id));

			// --- 5. Load the widget script after everything’s ready
			const script = document.createElement('script');
			script.src = WIDGET_JS;
			script.async = true;
			shadow.appendChild(script);

			isMountedRef.current = true;
		};

		// Lazy-load when visible
		let intersectionObserver: IntersectionObserver | null = null;
		const node = hostRef.current;
		if ('IntersectionObserver' in window && node) {
			intersectionObserver = new IntersectionObserver(
				(entries) => {
					for (const entry of entries) {
						if (entry.isIntersecting) {
							mountWidget();
							intersectionObserver && intersectionObserver.disconnect();
							break;
						}
					}
				},
				{ rootMargin: '200px' }
			);
			intersectionObserver.observe(node);
		}

		// Fallback: idle time or timeout
		const winAny = window as unknown as { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
		const idleId = winAny.requestIdleCallback ? winAny.requestIdleCallback(mountWidget, { timeout: 4000 }) : window.setTimeout(mountWidget, 3000);

		// --- Cleanup on unmount
		return () => {
			intersectionObserver && intersectionObserver.disconnect();
			if (winAny.cancelIdleCallback && idleId) {
				winAny.cancelIdleCallback(idleId);
			} else {
				clearTimeout(idleId as number);
			}

			if (isMountedRef.current && hostRef.current?.shadowRoot) {
				hostRef.current.shadowRoot.innerHTML = '';
			}
			if (originalGetByIdRef.current) {
				document.getElementById = originalGetByIdRef.current;
				originalGetByIdRef.current = null;
			}
			isMountedRef.current = false;
		};
	}, []);

	/* The host div is empty; all real content lives in its shadow root. */
	return <div ref={hostRef} />;
};
