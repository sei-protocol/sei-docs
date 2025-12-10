---
title: 'How can my EVM smart contract interact with native Sei tokens (like $SEI or others)?'
description: 'How can my EVM smart contract interact with native Sei tokens (like $SEI or others)?'
---

# How can my EVM smart contract interact with native Sei tokens (like $SEI or others)?

Sei provides a **Bank Precompile** contract at the special address `0x0000000000000000000000000000000000001001`. This precompile allows EVM contracts to directly interact with the native Sei token system (the `x/bank` module), enabling actions like sending native tokens and querying balances.

**Key Functions (Solidity Interface):**

```
interface ISeiBankPrecompile {
 // --- State Changing Functions ---

 /**
 * @notice Sends native $SEI (usei/wei) attached as msg.value from the caller to a Sei address.
 * @param recipientSeiAddr The recipient's Sei address (e.g., "sei1...").
 * @return success True if the transfer succeeded.
 */
 function sendNative(string memory recipientSeiAddr) external payable returns (bool success);

 /**
 * @notice Sends a specific native token (denom) from a sender to a recipient.
 * @dev RESTRICTION: Can only be called by the registered ERC20 pointer contract for the specified denom.
 * @param sender The sender's EVM address (must be associated).
 * @param recipient The recipient's EVM address (or associated Sei address).
 * @param denom The native token denomination string (e.g., "uatom").
 * @param amount The amount of the token to send (in its base unit).
 * @return success True if the transfer succeeded.
 */
 function send(address sender, address recipient, string memory denom, uint256 amount) external returns (bool success);

 // --- View Functions ---

 /**
 * @notice Gets the balance of a specific native token for an account.
 * @param account The EVM address of the account.
 * @param denom The native token denomination string.
 * @return balance The account's balance of the specified token.
 */
 function balance(address account, string memory denom) external view returns (uint256 balance);

 /**
 * @notice Gets all native token balances for an account.
 * @param account The EVM address of the account.
 * @return balances An array of all native balances held by the account.
 */
 function all_balances(address account) external view returns (CoinBalance[] memory balances);

 /**
 * @notice Gets the registered name for a native token denom.
 * @param denom The native token denomination string.
 * @return name The registered name.
 */
 function name(string memory denom) external view returns (string memory name);

 /**
 * @notice Gets the registered symbol for a native token denom.
 * @param denom The native token denomination string.
 * @return symbol The registered symbol.
 */
 function symbol(string memory denom) external view returns (string memory symbol);

 /**
 * @notice Gets the decimals for a native token denom.
 * @dev IMPORTANT: Always returns 0 for native Sei tokens, as they are integer-based at the bank module level.
 * @param denom The native token denomination string.
 * @return decimals Always 0.
 */
 function decimals(string memory denom) external view returns (uint8 decimals);

 /**
 * @notice Gets the total supply of a specific native token denom.
 * @param denom The native token denomination string.
 * @return supply The total supply.
 */
 function supply(string memory denom) external view returns (uint256 supply);

 // Helper struct for all_balances
 struct CoinBalance {
 uint256 Amount;
 string Denom;
 }
}

```

**How to Use:**

- **Import/Define Interface:** Include the `ISeiBankPrecompile` interface in your Solidity contract.

- **Instantiate:** Create an instance pointing to the precompile address: `ISeiBankPrecompile constant seiBank = ISeiBankPrecompile(0x0000000000000000000000000000000000001001);`

- **Call Functions:** Invoke the desired methods.

**Important Considerations:**

- **Sending $SEI:** Use `sendNative` and attach the amount of $SEI you want to send as `msg.value` in your call. The recipient address must be the *Sei native address* (`sei1...`) format.

- **Sending Other Native Tokens:** Use the `send` function. This has a **major restriction**: it can generally only be called by the official **ERC20 Pointer Contract** associated with that specific `denom`. This prevents arbitrary EVM contracts from moving native assets they don't control via a pointer.

- **Address Association:** For `send`, the `sender` address must be associated. For `sendNative`, the `msg.sender` (caller of the precompile) must be associated.

- **Decimals:** Be aware that `decimals()` **always returns 0** for native tokens via this precompile. Native tokens on Sei are handled with integer amounts at the base layer. If you are creating an ERC20 pointer for a native token that *conceptually* has decimals (e.g., like USDC with 6 decimals), the pointer contract itself (not this bank precompile) implements the ERC20 `decimals()` function and handles the conversion logic.

- **Gas:** View functions are cheap. `send` and `sendNative` incur gas costs related to the state changes in the bank module.
