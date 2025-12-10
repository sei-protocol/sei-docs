---
title: 'What are Pointer Contracts in Sei? How do the Pointer precompiles work?'
description: 'What are Pointer Contracts in Sei? How do the Pointer precompiles work?'
---

# What are Pointer Contracts in Sei? How do the Pointer precompiles work?

Pointer contracts are a unique feature of Sei that bridge assets between Sei's native/CosmWasm environment and its EVM environment. They essentially create **standard ERC-compatible EVM interfaces** (like ERC20, ERC721, ERC1155) that "point" to an underlying native asset (like a bank token, CW20, CW721, or CW1155 contract).

This allows EVM smart contracts, dApps, and wallets (like MetaMask) to interact with these bridged assets using familiar Ethereum standards.

Sei provides two precompiles to manage these pointers:

- **Pointer Precompile (`0x000000000000000000000000000000000000100b`):** Used to *create or update* pointer contracts.

- **PointerView Precompile (`0x000000000000000000000000000000000000100A`):** Used to *query* information about existing pointer contracts.

### Pointer Precompile (`0x...100b`) - Creating Pointers

This precompile deploys a standard EVM wrapper contract that implements the relevant ERC interface and forwards calls to the underlying native/CW asset.

**Key Functions (Solidity Interface):**

```
interface ISeiPointerPrecompile {
 /**
 * @notice Creates/updates an ERC20 pointer for a native bank token.
 * @dev Denom must have metadata registered in the bank module.
 * @param denom The native token denomination string.
 * @return pointerAddr The EVM address of the ERC20 pointer contract.
 */
 function addNativePointer(string memory denom) external returns (address pointerAddr);

 /**
 * @notice Creates/updates an ERC20 pointer for a CW20 contract.
 * @param cwAddress The Bech32 address of the CW20 contract.
 * @return pointerAddr The EVM address of the ERC20 pointer contract.
 */
 function addCW20Pointer(string memory cwAddress) external returns (address pointerAddr);

 /**
 * @notice Creates/updates an ERC721 pointer for a CW721 contract.
 * @param cwAddress The Bech32 address of the CW721 contract.
 * @return pointerAddr The EVM address of the ERC721 pointer contract.
 */
 function addCW721Pointer(string memory cwAddress) external returns (address pointerAddr);

 /**
 * @notice Creates/updates an ERC1155 pointer for a CW1155 contract.
 * @param cwAddress The Bech32 address of the CW1155 contract.
 * @return pointerAddr The EVM address of the ERC1155 pointer contract.
 */
 function addCW1155Pointer(string memory cwAddress) external returns (address pointerAddr);
}

```

**Usage:**

- Call the relevant `addPointer` function with the native denom or CW address.

- The precompile deploys/updates the corresponding EVM wrapper contract and returns its `0x...` address.

- This returned address can then be used with standard ERC20/721/1155 interfaces in other EVM contracts or dApps.

- **Restrictions:** Cannot be delegate called, cannot be static called, non-payable (`msg.value` must be 0). For `addNativePointer`, the denom needs metadata registered.

### PointerView Precompile (`0x...100A`) - Querying Pointers

This precompile allows you to check if a pointer exists for a given asset and retrieve its details.

**Key Functions (Solidity Interface):**

```
interface ISeiPointerViewPrecompile {
 /**
 * @notice Gets the pointer details for a native bank token denom.
 * @param denom The native token denomination string.
 * @return pointerAddr The EVM address of the pointer contract (address(0) if none).
 * @return version The version ID of the deployed pointer contract code.
 * @return exists True if a pointer exists for this denom.
 */
 function getNativePointer(string memory denom) external view returns (address pointerAddr, uint16 version, bool exists);

 /**
 * @notice Gets the pointer details for a CW20 contract address.
 * @param cwAddress The Bech32 address of the CW20 contract.
 * @return pointerAddr The EVM address of the pointer contract (address(0) if none).
 * @return version The version ID of the deployed pointer contract code.
 * @return exists True if a pointer exists for this contract.
 */
 function getCW20Pointer(string memory cwAddress) external view returns (address pointerAddr, uint16 version, bool exists);

 /**
 * @notice Gets the pointer details for a CW721 contract address.
 * @param cwAddress The Bech32 address of the CW721 contract.
 * @return pointerAddr The EVM address of the pointer contract (address(0) if none).
 * @return version The version ID of the deployed pointer contract code.
 * @return exists True if a pointer exists for this contract.
 */
 function getCW721Pointer(string memory cwAddress) external view returns (address pointerAddr, uint16 version, bool exists);

 /**
 * @notice Gets the pointer details for a CW1155 contract address.
 * @param cwAddress The Bech32 address of the CW1155 contract.
 * @return pointerAddr The EVM address of the pointer contract (address(0) if none).
 * @return version The version ID of the deployed pointer contract code.
 * @return exists True if a pointer exists for this contract.
 */
 function getCW1155Pointer(string memory cwAddress) external view returns (address pointerAddr, uint16 version, bool exists);
}

```

**Usage:**

- Call the relevant `getPointer` function with the native denom or CW address.

- Check the `exists` boolean. If true, `pointerAddr` contains the EVM address of the ERC-compatible contract.

- **Restrictions:** View functions, non-payable.

**Why Use Pointers?**

- **EVM Compatibility:** Allows EVM dApps (DEXs, lending protocols, wallets) to interact with native/CW assets seamlessly using standard ERC interfaces.

- **Unified Asset Representation:** Provides a consistent way to represent diverse Sei assets within the EVM environment.

- **Bridging:** Facilitates interaction between EVM and CosmWasm contracts via these standardized interfaces.
