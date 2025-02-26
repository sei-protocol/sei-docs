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

				<meta name='description' content='Documentation for Sei Network' />
				<meta name='keywords' content='Sei, Sei Network, Sei Blockchain, Sei Docs, Sei Documentation' />
				<meta name='author' content='Sei Network' />

				<meta property='og:url' content='https://docs.sei.io' />
				<meta property='og:type' content='website' />
				<meta property='og:title' content='Homepage - Sei Docs' />
				<meta property='og:description' content='Documentation for Sei Network' />
				<meta property='og:image' content='/assets/docs-banner.png' />
				<meta property='og:site_name' content='Sei Docs' />

				<meta name='twitter:card' content='summary_large_image' />
				<meta name='twitter:site' content='@sei_network' />

				<meta name='twitter:creator' content='@sei_network' />
				<meta property='twitter:domain' content='docs.sei.io' />
				<meta property='twitter:url' content='https://docs.sei.io' />
				<meta name='twitter:title' content='Homepage - Sei Docs' />
				<meta name='twitter:description' content='Documentation for Sei Network' />
				<meta name='twitter:image' content='/assets/docs-banner.png' />
			</head>

			<body style={{ width: '100%', height: '100%' }}>
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
			</body>
		</html>
	);
}
