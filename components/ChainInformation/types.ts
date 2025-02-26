export type NetworkEntry = {
	type: 'EVM' | 'Cosmos';
	name: string;
	chainId: string;
	hexChainId?: string;
	rpcUrl: string;
	explorerLinks: { name: string; url: string }[];
};
