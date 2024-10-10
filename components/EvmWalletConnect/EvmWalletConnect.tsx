// components/EvmWalletConnect/EvmWalletConnect.tsx
import { connectorsForWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { injectedWallet, metaMaskWallet } from '@rainbow-me/rainbowkit/wallets';
import { Chain, configureChains, createConfig, WagmiConfig } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import '@rainbow-me/rainbowkit/styles.css';
import { ChainRpcUrls } from 'viem/_types/types/chain';
import CustomConnectButton from './CustomConnectButton';

export default function EvmWalletConnect() {
	const rpcUrl: ChainRpcUrls = {
		http: ['https://evm-rpc.sei-apis.com'],
		webSocket: ['wss://evm-ws.sei-apis.com']
	};
	const sei: Chain = {
		id: 1329,
		name: 'Sei Network',
		network: 'Sei',
		nativeCurrency: {
			decimals: 18,
			name: 'Sei',
			symbol: 'SEI'
		},
		rpcUrls: {
			public: rpcUrl,
			default: rpcUrl
		},
		testnet: true,
		blockExplorers: {
			default: { name: 'Seitrace', url: 'https://seitrace.com' }
		}
	};

	const { chains, publicClient } = configureChains([sei], [publicProvider()]);

	const projectId = '385413c214cb74213e0679bc30dd4e4c';
	const connectors = connectorsForWallets([
		{
			groupName: 'Recommended',
			wallets: [injectedWallet({ chains }), metaMaskWallet({ projectId, chains })]
		}
	]);

	const wagmiConfig = createConfig({
		autoConnect: false,
		connectors,
		publicClient
	});

	return (
		<div className='my-4 flex justify-center'>
			<WagmiConfig config={wagmiConfig}>
				<RainbowKitProvider chains={chains}>
					<CustomConnectButton />
				</RainbowKitProvider>
			</WagmiConfig>
		</div>
	);
}
