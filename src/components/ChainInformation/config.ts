import { NetworkEntry } from './types';

// For Adding Sei to MetaMask
export const SEI_MAINNET_CHAIN_PARAMS = {
	chainId: '0x531', // 1329 in decimal
	chainName: 'Sei Network',
	rpcUrls: ['https://evm-rpc.sei-apis.com'],
	nativeCurrency: {
		name: 'Sei',
		symbol: 'SEI',
		decimals: 18
	},
	blockExplorerUrls: ['https://seitrace.com']
};

// Testnet (atlantic-2)
export const SEI_TESTNET_CHAIN_PARAMS = {
	chainId: '0x530', // 1328 in decimal
	chainName: 'Sei Testnet',
	rpcUrls: ['https://evm-rpc-testnet.sei-apis.com'],
	nativeCurrency: {
		name: 'Sei',
		symbol: 'SEI',
		decimals: 18
	},
	blockExplorerUrls: ['https://seitrace.com/?chain=atlantic-2']
};

// Devnet (arctic-1)
export const SEI_DEVNET_CHAIN_PARAMS = {
	chainId: '0xAE3F3', // 713715 in decimal
	chainName: 'Sei Devnet',
	rpcUrls: ['https://evm-rpc-arctic-1.sei-apis.com'],
	nativeCurrency: {
		name: 'Sei',
		symbol: 'SEI',
		decimals: 18
	},
	blockExplorerUrls: ['https://seitrace.com/?chain=arctic-1']
};

export const networks: NetworkEntry[] = [
	{
		type: 'EVM',
		name: 'Mainnet',
		chainId: '1329',
		hexChainId: '0x531',
		rpcUrl: 'https://evm-rpc.sei-apis.com',
		explorerLinks: [
			{ name: 'SeiTrace', url: 'https://seitrace.com/?chain=pacific-1' },
			{ name: 'SeiScan', url: 'https://www.seiscan.app/?chain=pacific-1' }
		],
		chainParams: SEI_DEVNET_CHAIN_PARAMS
	},
	{
		type: 'EVM',
		name: 'Testnet',
		chainId: '1328',
		hexChainId: '0x530',
		rpcUrl: 'https://evm-rpc-testnet.sei-apis.com',
		explorerLinks: [
			{ name: 'SeiTrace', url: 'https://seitrace.com/?chain=atlantic-2' },
			{ name: 'SeiScan', url: 'https://www.seiscan.app/?chain=atlantic-2' }
		],
		chainParams: SEI_DEVNET_CHAIN_PARAMS
	},
	{
		type: 'EVM',
		name: 'Devnet',
		chainId: '713715',
		hexChainId: '0xAE3F3',
		rpcUrl: 'https://evm-rpc-arctic-1.sei-apis.com',
		explorerLinks: [{ name: 'SeiTrace', url: 'https://seitrace.com/?chain=arctic-1' }],
		chainParams: SEI_DEVNET_CHAIN_PARAMS
	},
	{
		type: 'Cosmos',
		name: 'Mainnet',
		chainId: 'pacific-1',
		rpcUrl: 'https://rpc.sei-apis.com',
		explorerLinks: [
			{ name: 'SeiTrace', url: 'https://seitrace.com/?chain=pacific-1' },
			{ name: 'SeiScan', url: 'https://www.seiscan.app/?chain=pacific-1' }
		]
	},
	{
		type: 'Cosmos',
		name: 'Testnet',
		chainId: 'atlantic-2',
		rpcUrl: 'https://rpc-testnet.sei-apis.com',
		explorerLinks: [
			{ name: 'SeiTrace', url: 'https://seitrace.com/?chain=atlantic-2' },
			{ name: 'SeiScan', url: 'https://www.seiscan.app/?chain=atlantic-2' }
		]
	},
	{
		type: 'Cosmos',
		name: 'Devnet',
		chainId: 'arctic-1',
		rpcUrl: 'https://rpc-arctic-1.sei-apis.com',
		explorerLinks: [{ name: 'SeiTrace', url: 'https://seitrace.com/?chain=arctic-1' }]
	}
];

export async function addOrSwitchSeiNetwork(chain_params: any) {
	if (!window.ethereum) {
		throw new Error('MetaMask is not installed');
	}
	try {
		// Try switching to Sei
		await window.ethereum.request({
			method: 'wallet_switchEthereumChain',
			params: [{ chainId: chain_params.chainId }]
		});
	} catch (switchError: any) {
		// This error code indicates the chain has not been added to MetaMask
		if (switchError.code === 4902) {
			await window.ethereum.request({
				method: 'wallet_addEthereumChain',
				params: [chain_params]
			});
		} else {
			// Some other error
			throw switchError;
		}
	}
}
