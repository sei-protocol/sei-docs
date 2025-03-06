import React from 'react';

import { getPageMap } from 'nextra/page-map';

import DocsProviders from '../src/providers/DocsProviders';

import '@radix-ui/themes/styles.css';
import 'nextra-theme-docs/style.css';
import './globals.css';

import { Toaster } from 'sonner';

export default async function RootLayout({ children }) {
	return (
		<html lang='en' dir='ltr' suppressHydrationWarning style={{ width: '100%', height: '100%' }}>
			<head>
				<meta charSet='UTF-8' />
				<meta name='viewport' content='width=device-width, initial-scale=1' />

				<link rel='icon' type='image/x-icon' href='/favicon.ico' />
				<link rel='canonical' href='https://docs.sei.io' />

				<meta name='keywords' content='Sei, Sei Network, Sei Blockchain, Sei Docs, Sei Documentation' />
				<meta name='author' content='Sei Network' />
			</head>

			<body style={{ width: '100%', height: '100%' }} data-pagefind-body>
				<Toaster position='bottom-left' />
				<DocsProviders pageMap={await getPageMap()}>{children}</DocsProviders>
				<script id='ze-snippet' src='https://static.zdassets.com/ekr/snippet.js?key=95ec0096-4a77-48ad-b645-f010d3cb8971' />
			</body>
		</html>
	);
}
