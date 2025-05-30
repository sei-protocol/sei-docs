// Address validation utilities
const BECH32_ADDRESS_REGEX = /^sei1[a-z0-9]{38}$/;

/**
 * Validates if a string is a valid Sei Cosmos address
 * Replaces: isValidSeiCosmosAddress from @sei-js/cosmjs
 */
export const isValidSeiCosmosAddress = (address: string): boolean => {
	if (!address || typeof address !== 'string') {
		return false;
	}
	return BECH32_ADDRESS_REGEX.test(address);
};
