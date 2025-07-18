import type { Chain } from 'viem';
import { sei, seiTestnet } from 'viem/chains';

export type ChainConfigs = {
	[chainId: string]: ChainConfig;
};

export type ChainConfig = {
	restUrl: string;
	rpcUrl: string;
	explorerUrl?: string;
};

export type EvmChainConfigs = {
	[chainId: string]: Chain;
};

// Cosmos configs
export const CHAIN_CONFIGS: ChainConfigs = {
	'pacific-1': {
		restUrl: 'https://rest.pacific-1.sei.io',
		rpcUrl: 'https://rpc.pacific-1.sei.io/',
		explorerUrl: 'https://seitrace.com'
	},
	'atlantic-2': {
		restUrl: 'https://rest-testnet.sei-apis.com',
		rpcUrl: 'https://rpc-testnet.sei-apis.com/',
		explorerUrl: 'https://seitrace.com'
	}
};

export const EVM_CHAIN_CONFIGS: EvmChainConfigs = {
	'pacific-1': sei,
	'atlantic-2': seiTestnet
};
