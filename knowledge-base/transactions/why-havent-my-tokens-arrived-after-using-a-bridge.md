---
title: "Why Haven't My Tokens Arrived After Using a Bridge?"
description: "Why Haven't My Tokens Arrived After Using a Bridge?"
---

# Why Haven't My Tokens Arrived After Using a Bridge?

### The Problem

I used the Sei Bridge (or another bridge) to send tokens. The transaction seemed successful on the sending chain, but the tokens haven't appeared in my destination wallet after waiting a reasonable time (e.g., 15-30 minutes, or longer for some bridges).

### Solution Steps

- **Confirm Source Tx Success:** Get the transaction hash (TxID) from your source wallet. Verify on the **source chain's explorer** ([SeiScan](https://www.seiscan.app/), [SeiTrace](https://seitrace.com/), Etherscan, etc.) that the transaction was definitely successful.

- **Check Destination Explorer:** Find your **destination address** on the **destination chain's explorer**. Look for an incoming transaction from the bridge contract around the time you expected arrival.

- **Allow More Time:** Cross-chain bridging takes time (locking, relaying, minting). Sei NativeEVM is usually fast (1-5 min), but external chains or network congestion can cause significant delays (30+ min is possible).

- **Add Token Contract (EVM Wallets):** If bridging a non-native token *to* an EVM wallet (MetaMask), you MUST manually add the token's contract address on the **destination chain** (Sei EVM) to MetaMask for the balance to display. Find the correct address via bridge docs or the destination explorer.

- **Check for Claim Step:** Does the specific bridge require a manual "Claim" transaction on the destination chain? Check the bridge UI or documentation.

### Explanation & Tips

- **Common Causes:** Network congestion (source or destination), relayer delays (off-chain parts of the bridge), failure to add token contract to wallet, bridge requiring a manual claim.

- **Check Bridge Status:** Look for official announcements from the specific bridge provider (Twitter, Discord) about delays or maintenance.

- **Correct Destination Address?** Double-check the destination address used in the bridge transaction details on the source explorer.

- **Still Missing?** If hours pass and steps above don't reveal the tokens, contact support for the **specific bridge** you used, providing source TxID, addresses, asset, amount, and time. **See My Bridge Transfer Has Been Stuck for Hours, What Now?**
