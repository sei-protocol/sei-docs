---
title: 'How can my EVM smart contract call or query a CosmWasm smart contract on Sei?'
description: 'How can my EVM smart contract call or query a CosmWasm smart contract on Sei?'
---

# How can my EVM smart contract call or query a CosmWasm smart contract on Sei?

Sei provides a powerful **CosmWasm Interaction Precompile** at address `0x0000000000000000000000000000000000001002`. This allows EVM contracts to directly instantiate, execute messages on, and query CosmWasm contracts.

**Key Functions (Solidity Interface):**

```
interface ISeiWasmdPrecompile {
 // --- State Changing Functions ---

 /**
 * @notice Instantiates a new CosmWasm contract from a code ID.
 * @dev Caller's EVM address must be associated. msg.value must match usei amount in coins.
 * @param codeID The code ID of the CosmWasm contract bytecode.
 * @param admin Optional admin address (Sei bech32 format) for the new contract.
 * @param msg The instantiation message (JSON as bytes).
 * @param label A human-readable label for the contract instance.
 * @param coins Funds to send to the contract upon instantiation (JSON sdk.Coins as bytes, e.g., '[{"denom":"usei","amount":"1000000"}]').
 * @return contractAddr The Bech32 address of the newly instantiated CosmWasm contract.
 * @return data Any data returned by the CosmWasm instantiate response.
 */
 function instantiate(
 uint64 codeID,
 string memory admin,
 bytes memory msg,
 string memory label,
 bytes memory coins
 ) external payable returns (string memory contractAddr, bytes memory data);

 /**
 * @notice Executes a message on a CosmWasm contract.
 * @dev Caller's EVM address must be associated. msg.value must match usei amount in coins. Can only be delegate called by the contract's registered Pointer contract.
 * @param contractAddress The Bech32 address of the target CosmWasm contract.
 * @param msg The execution message (JSON as bytes).
 * @param coins Funds to send with the execution (JSON sdk.Coins as bytes).
 * @return data Any data returned by the CosmWasm execution response.
 */
 function execute(
 string memory contractAddress,
 bytes memory msg,
 bytes memory coins
 ) external payable returns (bytes memory data);

 /**
 * @notice Executes a batch of messages on one or more CosmWasm contracts atomically.
 * @dev Caller's EVM address must be associated. msg.value must match the sum of usei amounts in all coins fields.
 * @param executeMsgs An array of execute messages.
 * @return responses An array of data bytes returned by each CosmWasm execution response.
 */
 function execute_batch(ExecuteMsg[] memory executeMsgs)
 external payable returns (bytes[] memory responses);

 // --- View Function ---

 /**
 * @notice Performs a smart query on a CosmWasm contract.
 * @param contractAddress The Bech32 address of the target CosmWasm contract.
 * @param req The query message (JSON as bytes).
 * @return response The query response (JSON as bytes).
 */
 function query(string memory contractAddress, bytes memory req)
 external view returns (bytes memory response);

 // --- Helper Struct for execute_batch ---
 struct ExecuteMsg {
 string contractAddress; // Target CW contract bech32 address
 bytes msg; // Execution message JSON bytes
 bytes coins; // Funds JSON bytes (e.g., '[{"denom":"usei","amount":"0"}]')
 }
}

```

**How to Use:**

- **Association:** The EVM address calling `instantiate`, `execute`, or `execute_batch` **must** be associated with a Sei native address.

- **Interface & Instance:** Define/import `ISeiWasmdPrecompile` and get a reference: `ISeiWasmdPrecompile constant seiWasmd = ISeiWasmdPrecompile(0x0000000000000000000000000000000000001002);`

- **Data Formatting:** Messages (`msg`, `req`) and funds (`coins`) must be provided as **bytes representing valid JSON**. For `coins`, use the `sdk.Coins` JSON format (e.g., `bytes('[{"denom":"usei","amount":"1000000"}]')` for 1 SEI).

- **Value Matching:** For `instantiate`, `execute`, and `execute_batch`, the `msg.value` sent with the EVM call (in wei) **must exactly match** the total `usei` amount specified in the `coins` argument(s), converted to wei (1 usei = 10^12 wei).

- **Responses:** Execution and query responses are returned as raw `bytes`, typically containing JSON data that needs to be decoded/parsed off-chain or potentially using the JSON precompile on-chain.

**Important Considerations:**

- **Delegate Call:** `instantiate` cannot be delegate called. `execute` can only be delegate called by the CW contract's registered Pointer contract, enabling seamless interaction via the pointer's EVM interface.

- **Call Pattern:** Direct `CW -> EVM -> CW` write calls (instantiate/execute) are generally disallowed to prevent complex reentrancy scenarios.

- **Gas:** Calls incur the base precompile gas cost plus the significant gas cost of the underlying CosmWasm execution (instantiation, message execution, or query processing).
