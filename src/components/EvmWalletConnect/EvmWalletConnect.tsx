'use client';

import React from 'react';
import { DynamicContextProvider, useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { Box, Button } from '@radix-ui/themes';
import { IconLogout } from '@tabler/icons-react';
import useSeiAddress from '../../hooks/useSeiAddress';
import { getCosmosChainId } from '../../utils/chains';
import { CopyText } from '../CopyText';
import { SwitchNetwork } from '../SwitchNetwork';
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
import { createConfig, http, WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DynamicWagmiConnector } from '@dynamic-labs/wagmi-connector';
import { sei, seiDevnet, seiTestnet } from 'viem/chains';

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

export default function EvmWalletConnect() {
	return (
		<DynamicContextProvider
			settings={{
				environmentId: '8974dcb9-89c7-4472-a988-e55c217a1020',
				walletConnectors: [EthereumWalletConnectors]
			}}>
			<WagmiProvider config={wagmiConfig}>
				<QueryClientProvider client={queryClient}>
					<DynamicWagmiConnector>
						<WalletComponent />
					</DynamicWagmiConnector>
				</QueryClientProvider>
			</WagmiProvider>
		</DynamicContextProvider>
	);
}

const WalletComponent = () => {
	const { handleLogOut, network, primaryWallet, setShowAuthFlow } = useDynamicContext();

	const response = useSeiAddress({ chainId: getCosmosChainId(Number(network)) });
	const { data: seiAddress, isLoading } = response;

	const renderContent = () => {
		if (network) {
			return (
				<Button className='flex flex-row gap-4 !bg-neutral-700 !p-6 !rounded-2xl cursor-pointer hover:!bg-[#9e1f19aa]' onClick={handleLogOut}>
					<IconLogout />
					<p className='font-bold'>Disconnect Wallet</p>
				</Button>
			);
		}

		return (
			<div className='flex flex-col gap-4 mt-8'>
				<p>Click the button below to automatically set up your wallet by adding the correct network and by linking your EVM and Cosmos addresses together.</p>
				<Button onClick={() => setShowAuthFlow(true)} className='flex flex-row gap-4 !bg-[#9e1f19] !p-6 !rounded-2xl cursor-pointer hover:!bg-[#9e1f19aa]'>
					<p className='font-bold'>Connect & Link Wallet</p>
				</Button>
			</div>
		);
	};

	if (!network) {
		return <Box className='w-full mt-4'>{renderContent()}</Box>;
	}

	return (
		<div className='flex flex-col gap-4 mt-4'>
			<SwitchNetwork />
			<div className='flex flex-col gap-2'>
				<CopyText column={true} label='EVM Address:' value={primaryWallet?.address ? primaryWallet?.address : '---'} copyDisabled={!primaryWallet?.address} />
				<CopyText column={true} label='Cosmos Address:' value={seiAddress && !isLoading ? seiAddress : '---'} copyDisabled={!seiAddress || isLoading} />
				<Box className='w-full mt-4'>{renderContent()}</Box>
			</div>
		</div>
	);
};
