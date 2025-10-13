'use client';

import { useEffect, useRef } from 'react';

const COOKBOOK_APP_ID = '0117f014f27a56633c30024d41166aa2';
const WIDGET_ID = 'bytebellai';
const WIDGET_CSS = '/vendor/bytebellai/style.css';
const WIDGET_JS = '/vendor/bytebellai/index.js';

export const AskCookbook = () => {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		// Ensure stylesheet is only added once
		const head = document.head || document.getElementsByTagName('head')[0];
		if (!document.getElementById('bytebellai-style')) {
			const link = document.createElement('link');
			link.id = 'bytebellai-style';
			link.rel = 'stylesheet';
			link.href = WIDGET_CSS;
			head.appendChild(link);
		}

		// Ensure script is only added once
		const existingScript = document.querySelector("script[data-bytebellai='true']");
		if (!existingScript) {
			const script = document.createElement('script');
			script.src = WIDGET_JS;
			script.async = true;
			script.type = 'module';
			script.setAttribute('data-bytebellai', 'true');
			document.body.appendChild(script);
		}
	}, []);

	return <div ref={containerRef} id={WIDGET_ID} data-layout='drawer' data-app-id={COOKBOOK_APP_ID} />;
};
