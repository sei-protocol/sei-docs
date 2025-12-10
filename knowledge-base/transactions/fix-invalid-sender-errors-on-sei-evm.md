---
title: "How Do I Fix "Invalid Sender" Errors on Sei EVM?"
description: "How Do I Fix "Invalid Sender" Errors on Sei EVM?"
---

# How Do I Fix "Invalid Sender" Errors on Sei EVM?

### The Problem

When trying to send a transaction or interact with a contract on Sei EVM using MetaMask or a script, the transaction fails quickly with an error like "Invalid Sender", "Sender account not found", "Nonce too low", "Nonce too high", or similar validation errors.

### Solution Steps

This usually means the transaction failed basic checks *before* contract execution. Common fixes:

- **Check SEI Balance:** Ensure the sending EVM address (`0x...`) has enough liquid SEI on the Sei EVM network to cover the transaction's gas cost (Gas Limit \* Gas Price).

- **Fix Nonce Issues (MetaMask):**

Look for any other **pending transactions** in MetaMask's Activity tab. Try to **Cancel** or **Speed Up** the *oldest* pending transaction first.

- If no pending tx visible or cancelling doesn't work, try **Reset Account**: Settings > Advanced > Reset Account. (This clears local nonce tracking; safe for funds but you may need to resubmit recent txs).

- **Fix Nonce Issues (Code):** Ensure your script correctly fetches the *current* nonce before sending: `nonce = await provider.getTransactionCount(wallet.address, 'pending')`. Handle potential race conditions if sending rapidly.

- **Check Wallet/Network:** Ensure you're using an EVM wallet (MetaMask) connected to the correct Sei EVM Network (Chain ID `1329`).

### Explanation and Tips

- **Cause:** The network validates sender balance, nonce sequence, and signature *before* executing the transaction. Failure here results in these errors.

- **Nonce Explained:** Nonce is a transaction counter per address, starting at 0. Transactions must be mined in sequential nonce order (0, 1, 2...). "Nonce too low" means you tried to reuse a nonce. "Nonce too high" means a previous nonce is still pending.

- **RPC Issues:** Rarely, the RPC node might be faulty. Try switching to an alternative public RPC endpoint in MetaMask settings (e.g., `https://sei-evm.publicnode.com`).

- **Malformed Tx (Developers):** Double-check all transaction parameters (`to`, `value`, `data`, `chainId`, `gasLimit`, etc.) and the signing process in your code.
