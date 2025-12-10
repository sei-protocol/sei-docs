---
title: "How Do I Fix the "Incorrect Network" Error in MetaMask for Sei?"
description: "How Do I Fix the "Incorrect Network" Error in MetaMask for Sei?"
---

# How Do I Fix the "Incorrect Network" Error in MetaMask for Sei?

### The Problem

After adding Sei Network to MetaMask, it displays an "Incorrect Network" message, or transactions fail immediately, suggesting MetaMask isn't properly connected to the Sei EVM chain.

### Solution Steps

This almost always means the network configuration details in MetaMask are wrong, especially the Chain ID.

- Open **MetaMask**.

- Click the **network dropdown** menu (top-left).

- Find **Sei Network** in your list and click the settings/edit icon next to it (might need to go to Settings > Networks).

- **Verify ALL details** meticulously against the official mainnet settings:

Network Name: `Sei Network` (This is just a label, but good to be consistent)

- New RPC URL: `https://evm-rpc.sei-apis.com`

- **Chain ID:** `1329` (**This MUST be exact**)

- Currency Symbol: `SEI`

- Block Explorer URL: `https://seitrace.com` (Optional, but helpful)

- Correct any discrepancies, especially the **Chain ID**.

- Click **"Save"**.

- Switch away from Sei Network and then back to it to ensure the connection refreshes.

### Explanation & Tips

- **Cause:** MetaMask uses the Chain ID to identify the network. If the ID doesn't match what the connected RPC endpoint reports (`eth_chainId`), MetaMask considers it the wrong network.

- **Remove and Re-add:** If verifying/editing doesn't work, try removing the Sei Network configuration entirely from MetaMask (Settings > Networks > Select Sei > Delete/Remove Network) and then add it again carefully using the steps in How Do I Add Sei Network to MetaMask?

- **RPC URL:** Ensure the RPC URL is also exactly correct. Typos matter.

- **MetaMask Update:** Ensure your MetaMask extension/app is updated to the latest version.

- **Browser Cache:** Try clearing your browser cache as a rare potential fix.
