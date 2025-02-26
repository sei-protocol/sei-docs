export type NetworkType = 'mainnet' | 'testnet' | 'devnet';

export const getCosmosChainId = (evmChainId: number) => {
	switch (evmChainId) {
		case 1329:
			return 'pacific-1';
		case 1328:
			return 'atlantic-2';
		case 713715:
			return 'arctic-1';
		default:
			return 'pacific-1';
	}
};

export const getChainIdForNetwork = (networkType: NetworkType) => {
	switch (networkType) {
		case 'mainnet':
			return 1329;
		case 'testnet':
			return 1328;
		case 'devnet':
			return 713715;
		default:
			return 1329;
	}
};

export const getChainIdHexForNetwork = (networkType: NetworkType) => {
	switch (networkType) {
		case 'mainnet':
			return 0x531;
		case 'testnet':
			return 0x530;
		case 'devnet':
			return 0xae3f3;
		default:
			return 0x531;
	}
};

const getNetworkTypeForChainId = (evmChainId: number) => {
	switch (evmChainId) {
		case 1329:
			return 'mainnet';
		case 1328:
			return 'testnet';
		case 713715:
			return 'devnet';
		default:
			return 'mainnet';
	}
};
