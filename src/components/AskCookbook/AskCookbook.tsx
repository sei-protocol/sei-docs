'use client';

import { useEffect, useRef, useState } from 'react';

const COOKBOOK_APP_ID = '0117f014f27a56633c30024d41166aa2';
const WIDGET_CSS = 'https://bb-chat-widget.s3.us-east-1.amazonaws.com/assets/style.css';
const WIDGET_JS = 'https://bb-chat-widget.s3.us-east-1.amazonaws.com/assets/index.js';
const WIDGET_ID = 'bytebellai';

export const AskCookbook = () => {
	const hostRef = useRef<HTMLDivElement>(null);
	const isMountedRef = useRef<boolean>(false);
	const originalGetByIdRef = useRef<typeof document.getElementById | null>(null);
	const preconnectedRef = useRef<boolean>(false);
	const [activated, setActivated] = useState<boolean>(false);

	const addPreconnect = () => {
		if (preconnectedRef.current) return;
		const head = document.head || document.getElementsByTagName('head')[0];
		const preconnect = document.createElement('link');
		preconnect.rel = 'preconnect';
		preconnect.href = 'https://bb-chat-widget.s3.us-east-1.amazonaws.com';
		preconnect.crossOrigin = 'anonymous';
		head.appendChild(preconnect);
		const dnsPrefetch = document.createElement('link');
		dnsPrefetch.rel = 'dns-prefetch';
		dnsPrefetch.href = 'https://bb-chat-widget.s3.us-east-1.amazonaws.com';
		head.appendChild(dnsPrefetch);
		preconnectedRef.current = true;
	};

	const mountWidget = () => {
		if (isMountedRef.current || !hostRef.current) return;
		const shadow = hostRef.current.shadowRoot ?? hostRef.current.attachShadow({ mode: 'open' });
		const link = document.createElement('link');
		link.rel = 'stylesheet';
		link.href = WIDGET_CSS;
		shadow.appendChild(link);
		const container = document.createElement('div');
		container.id = WIDGET_ID;
		container.dataset.appId = COOKBOOK_APP_ID;
		shadow.appendChild(container);
		originalGetByIdRef.current = document.getElementById.bind(document);
		document.getElementById = (id: string) => (id === WIDGET_ID ? container : (originalGetByIdRef.current as typeof document.getElementById)(id));
		const script = document.createElement('script');
		script.src = WIDGET_JS;
		script.async = true;
		shadow.appendChild(script);
		isMountedRef.current = true;
	};

	useEffect(() => {
		if (!activated) return;
		addPreconnect();
		mountWidget();
		return () => {
			if (isMountedRef.current && hostRef.current?.shadowRoot) {
				hostRef.current.shadowRoot.innerHTML = '';
			}
			if (originalGetByIdRef.current) {
				document.getElementById = originalGetByIdRef.current;
				originalGetByIdRef.current = null;
			}
			isMountedRef.current = false;
		};
	}, [activated]);

	return (
		<>
			<button aria-controls='ask-ai' aria-expanded={activated} onClick={() => setActivated(true)}>
				Ask AI
			</button>
			{activated && <div ref={hostRef} id='ask-ai' />}
		</>
	);
};
