'use client';

import { useEffect, useRef } from 'react';
import { loadBytebellaiWidget } from '../../vendor/bytebellai/loader';

const APP_ID = '0117f014f27a56633c30024d41166aa2';
const WIDGET_ID = 'bytebellai';

export const AskAIAssistant = () => {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		let cancelled = false;
		// Load the bundled widget code once on the client
		if (!(window as any).__bytebellaiLoaded) {
			loadBytebellaiWidget()
				.then(() => {
					if (!cancelled) (window as any).__bytebellaiLoaded = true;
				})
				.catch(() => {
					// no-op: widget is optional UI enhancement
				});
		}
		return () => {
			cancelled = true;
		};
	}, []);

	return <div ref={containerRef} id={WIDGET_ID} data-layout='drawer' data-app-id={APP_ID} />;
};
