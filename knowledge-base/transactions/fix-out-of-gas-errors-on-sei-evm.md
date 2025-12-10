---
title: "How Do I Fix "Out of Gas" Errors on Sei EVM?"
description: "How Do I Fix "Out of Gas" Errors on Sei EVM?"
---

# How Do I Fix "Out of Gas" Errors on Sei EVM?

### The Problem

When sending a transaction or interacting with a smart contract on Sei EVM, it failed immediately with an "Out of Gas" error message.

### Solution Steps

This error means the transaction needed more computation than allowed by its **Gas Limit**.

- **Retry the transaction**.

- Before confirming in your wallet (e.g., MetaMask), find the **Gas Limit** setting (often under "Edit", "Advanced", or "Site Suggested" gas fees).

- **Increase the Gas Limit** value. Try doubling the suggested limit or enter a significantly larger number (e.g., `1000000` or more for complex contract interactions).

- Confirm and send the transaction again.

### Explanation & Tips

- **Gas Limit vs. Gas Price:** Do **not** confuse Gas Limit with Gas Price (or Max Fee/Priority Fee). "Out of Gas" relates *only* to the Gas **Limit**. Increasing the price won't fix it.

- **Cause:** Every operation costs gas. The Gas Limit is your budget for computation. If the execution cost exceeds the budget, it fails.

- **Why Increase?** Wallets sometimes underestimate the required limit, especially for contract interactions more complex than simple transfers. Sei's gas schedule might also differ slightly from other EVM chains.

- **Developers:**

If deploying/testing contracts, ensure your scripts (ethers.js, Hardhat) specify a sufficient `gasLimit` in transaction overrides: `contract.deploy({ gasLimit: 3000000 });`

- Check your contract code for very gas-heavy operations (e.g., loops over large arrays, complex math, heavy storage writes).

- Consider optimizing contract logic or splitting complex operations into multiple transactions.

- **Balance Check:** While not directly causing the error, ensure you still have enough SEI to cover the *potential* cost (Gas Limit \* Gas Price).
