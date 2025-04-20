export type ChainParams = {
	/** Hex‑encoded chain ID (e.g. '0x531') */
	chainId: string;
	chainName: string;
	rpcUrls: string[];
	nativeCurrency: {
		name: string;
		symbol: string;
		decimals: number;
	};
	blockExplorerUrls: string[];
};

export type NetworkEntry = {
	type: 'EVM' | 'Cosmos';
	name: string;
	chainId: string;
	hexChainId?: string;
	rpcUrl: string;
	explorerLinks: { name: string; url: string }[];
	/** Present only for EVM networks (used by the MetaMask button) */
	chainParams?: ChainParams;
};
