import { NetworkEntry } from './types';

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
		]
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
		]
	},
	{
		type: 'EVM',
		name: 'Devnet',
		chainId: '713715',
		hexChainId: '0xAE3F3',
		rpcUrl: 'https://evm-rpc-arctic-1.sei-apis.com',
		explorerLinks: [{ name: 'SeiTrace', url: 'https://seitrace.com/?chain=arctic-1' }]
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
