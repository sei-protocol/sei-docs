---
title: 'How can my EVM smart contract send tokens to other blockchains via IBC?'
description: 'How can my EVM smart contract send tokens to other blockchains via IBC?'
---

# How can my EVM smart contract send tokens to other blockchains via IBC?

Sei provides an **IBC Precompile** at address `0x0000000000000000000000000000000000001009` that enables EVM smart contracts to initiate IBC (Inter-Blockchain Communication) token transfers.

**Key Functions (Solidity Interface):**

```
interface ISeiIbcPrecompile {
 /**
 * @notice Initiates an IBC transfer with explicitly specified timeout parameters.
 * @dev Caller's EVM address must be associated. msg.value must be 0.
 * @param receiver The recipient address on the destination chain (string format).
 * @param sourcePort The source port on Sei (e.g., "transfer").
 * @param sourceChannel The source channel ID on Sei (e.g., "channel-0").
 * @param denom The denomination of the token to send (e.g., "usei", "ibc/HASH...").
 * @param amount The amount of the token to send (in its base unit).
 * @param revisionNumber The revision number part of the timeout height on the destination chain.
 * @param revisionHeight The revision height part of the timeout height on the destination chain.
 * @param timeoutTimestamp The absolute timestamp (in nanoseconds) after which the transfer times out.
 * @param memo An optional memo string for the IBC transfer.
 * @return success True if the IBC transfer message was successfully submitted.
 */
 function transfer(
 string memory receiver,
 string memory sourcePort,
 string memory sourceChannel,
 string memory denom,
 uint256 amount,
 uint64 revisionNumber,
 uint64 revisionHeight,
 uint64 timeoutTimestamp,
 string memory memo
 ) external returns (bool success);

 /**
 * @notice Initiates an IBC transfer using automatically calculated default timeout parameters.
 * @dev Caller's EVM address must be associated. msg.value must be 0.
 * @param receiver The recipient address on the destination chain (string format).
 * @param sourcePort The source port on Sei (e.g., "transfer").
 * @param sourceChannel The source channel ID on Sei (e.g., "channel-0").
 * @param denom The denomination of the token to send (e.g., "usei", "ibc/HASH...").
 * @param amount The amount of the token to send (in its base unit).
 * @param memo An optional memo string for the IBC transfer.
 * @return success True if the IBC transfer message was successfully submitted.
 */
 function transferWithDefaultTimeout(
 string memory receiver,
 string memory sourcePort,
 string memory sourceChannel,
 string memory denom,
 uint256 amount,
 string memory memo
 ) external returns (bool success);
}

```

**How to Use:**

- **Association:** The EVM address (`msg.sender`) calling the precompile **must** be associated with a Sei native address. The native address is the actual sender of the IBC transfer.

- **Interface:** Define or import the `ISeiIbcPrecompile` interface.

- **Instantiate:** Get a reference: `ISeiIbcPrecompile constant seiIbc = ISeiIbcPrecompile(0x0000000000000000000000000000000000001009);`

- **Call Functions:**

Choose `transfer` if you need precise control over the timeout height and timestamp.

- Choose `transferWithDefaultTimeout` for convenience, allowing Sei to calculate reasonable defaults based on the current block and client state.

- **Parameters:** Provide the recipient address on the destination chain, the correct `sourcePort` and `sourceChannel` for the desired route, the `denom` of the token being sent (this can be native `usei` or an IBC voucher denomination like `ibc/HASH...`), the `amount` (in the token's smallest unit), and an optional `memo`.

**Important Considerations:**

- **Non-Payable:** These functions are non-payable (`msg.value` must be 0). The tokens being transferred are deducted from the associated Sei native address's balance.

- **No Delegate Call:** This precompile cannot be called using `delegatecall`.

- **Denominations:** You can send native Sei tokens (like `usei`) or tokens that have arrived on Sei via IBC (represented by their `ibc/...` denom).

- **Timeout:** IBC transfers rely on timeouts. `transferWithDefaultTimeout` is generally recommended unless you have specific requirements for timeout calculation.

- **IBC Knowledge:** Using this precompile requires understanding IBC concepts like ports, channels, and destination chain address formats.

- **Gas:** While the precompile call itself has a base gas cost, the execution of the underlying IBC transfer involves interactions with multiple modules and relaying, which consumes Cosmos-level gas paid by the associated Sei native address.
