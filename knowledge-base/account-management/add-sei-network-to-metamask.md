---
title: 'How Do I Add Sei Network to MetaMask?'
description: 'How Do I Add Sei Network to MetaMask?'
---

# How Do I Add Sei Network to MetaMask?

### Steps

- Open **MetaMask**.

- Click the **network dropdown** menu (top-left, often says "Ethereum Mainnet").

- Click **"Add network"** at the bottom.

- Click **"Add a network manually"** (if Sei isn't shown in the list).

- Enter the following details **exactly**:

Network Name: `Sei Network`

- New RPC URL: `https://evm-rpc.sei-apis.com`

- Chain ID: `1329`

- Currency Symbol: `SEI`

- Block Explorer URL (Optional): `https://seitrace.com`

- Click **"Save"**.

### Explanation & Tips

- **Chain ID is Crucial:** The most common error is mistyping the Chain ID. It **must** be `1329` for Sei mainnet.

- **"Incorrect Network" Error:** If MetaMask shows this after adding, double-check all entered details, especially the Chain ID. You might need to remove the network and add it again carefully. See Fixing "Incorrect Network" Error in MetaMask.

- **Alternative Public RPC:** If you experience connection issues later, you can try editing the network settings to use an alternative RPC URL like `https://sei.drpc.org`.

- **Testnet:** For Sei Testnet (Atlantic-2), use Chain ID `1328` and RPC `https://evm-rpc-testnet.sei-apis.com`.
