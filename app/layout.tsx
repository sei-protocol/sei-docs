'use client';

import React, { useEffect } from 'react';

import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
import { pipe } from '@dynamic-labs/utils';
import { DynamicContextProvider, RemoveWallets, SortWallets } from '@dynamic-labs/sdk-react-core';
import { createConfig, http, WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DynamicWagmiConnector } from '@dynamic-labs/wagmi-connector';
import { sei, seiTestnet, seiDevnet } from 'viem/chains';
import { getPageMap } from 'nextra/page-map';

import DocsProviders from '../providers/DocsProviders';

import '@radix-ui/themes/styles.css';
import 'nextra-theme-docs/style.css';
import './globals.css';
import { DefaultSeo } from 'next-seo';

const wagmiConfig = createConfig({
	chains: [sei, seiTestnet, seiDevnet],
	multiInjectedProviderDiscovery: false,
	transports: {
		[sei.id]: http(),
		[seiTestnet.id]: http(),
		[seiDevnet.id]: http()
	}
});

const queryClient = new QueryClient();

export default function RootLayout({ children }) {
	const [pageMap, setPageMap] = React.useState<any>();

	useEffect(() => {
		const fetchPageMap = async () => {
			const pageMap = await getPageMap();
			setPageMap(pageMap);
		};
		fetchPageMap();
	}, []);

	return (
		<html lang='en' dir='ltr' suppressHydrationWarning style={{ width: '100%', height: '100%' }}>
			<head>
				<meta charSet='UTF-8' />
				<meta name='viewport' content='width=device-width, initial-scale=1' />

				<title>Homepage - Sei Docs</title>
				<link rel='icon' type='image/x-icon' href='/favicon.ico' />
				<link rel='canonical' href='https://docs.sei.io' />

				<meta name='keywords' content='Sei, Sei Network, Sei Blockchain, Sei Docs, Sei Documentation' />
				<meta name='author' content='Sei Network' />
			</head>

			<body style={{ width: '100%', height: '100%' }}>
				<DefaultSeo
					titleTemplate='%s - Sei Docs'
					description='Documentation for Sei Network'
					openGraph={{
						type: 'website',
						locale: 'en_US',
						siteName: 'Sei Docs',
						description: 'Documentation for Sei Network',
						images: [
							{
								url: 'https://www.docs.sei.io/assets/sei-v2-banner.jpg',
								width: 1600,
								height: 900,
								alt: 'Sei V2 Overview',
								type: 'image/jpg'
							}
						]
					}}
					twitter={{ site: '@SeiNetwork', cardType: 'summary_large_image' }}
					additionalLinkTags={[
						{ rel: 'icon', href: '/favicon.ico' },
						{
							rel: 'icon',
							type: 'image/png',
							sizes: '16x16',
							href: '/favicon-16x16.png'
						},
						{
							rel: 'icon',
							type: 'image/png',
							sizes: '32x32',
							href: '/favicon-32x32.png'
						},
						{ rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' }
					]}
				/>
				<DynamicContextProvider
					settings={{
						environmentId: '8974dcb9-89c7-4472-a988-e55c217a1020',
						walletConnectors: [EthereumWalletConnectors],
						walletsFilter: pipe(SortWallets(['metamask', 'okxwallet', 'rabby', 'compasswallet', 'coinbase'])).pipe(RemoveWallets(['phantomevm']))
					}}>
					<WagmiProvider config={wagmiConfig}>
						<QueryClientProvider client={queryClient}>
							<DynamicWagmiConnector>
								<DocsProviders pageMap={pageMap}>{children}</DocsProviders>
							</DynamicWagmiConnector>
						</QueryClientProvider>
					</WagmiProvider>
				</DynamicContextProvider>
				{/*<script id='ze-snippet' src='https://static.zdassets.com/ekr/snippet.js?key=95ec0096-4a77-48ad-b645-f010d3cb8971' />*/}
			</body>
		</html>
	);
}
