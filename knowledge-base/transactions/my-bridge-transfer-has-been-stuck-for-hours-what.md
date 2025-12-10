---
title: 'My Bridge Transfer Has Been Stuck for Hours, What Now?'
description: 'My Bridge Transfer Has Been Stuck for Hours, What Now?'
---

# My Bridge Transfer Has Been Stuck for Hours, What Now?

### The Problem

I started a bridge transfer several hours ago. I've checked the explorers, and while the source transaction was successful, nothing has happened on the destination chain, or the process seems completely stalled. Typical troubleshooting steps haven't worked.

### Solution Steps

When a bridge transfer is stuck for an extended period (hours, not minutes) despite basic checks, it often requires intervention or investigation by the bridge provider.

- **Check Bridge Provider Status:** Visit the official website, Discord, or Twitter for the **specific bridge** you used. Check *intensively* for any announcements about ongoing incidents, specific asset/chain delays, or required maintenance.

- **Use Bridge-Specific Explorer (If available):** Some bridges (like Wormhole, LayerZero) have dedicated explorers where you can paste your *source* TxID to see the detailed status of the cross-chain messaging and execution steps. Check the bridge's documentation for this.

- **Gather Information:** Collect the following details:

Source Chain Transaction Hash (TxID).

- Source Chain Name (e.g., Sei Native, Ethereum).

- Destination Chain Name (e.g., Sei EVM, Arbitrum).

- Your Source Address.

- Your Destination Address.

- Asset Name and Amount transferred.

- Approximate Date and Time of the transfer.

- **Contact Bridge Support:** Find the official support channel for the **bridge provider** (usually Discord, Telegram, or a support portal - **NOT** general Sei support unless using the native Sei Bridge for NativeEVM). Submit a support request with all the information gathered in step 3.

### Explanation & Tips

- **Patience is Key:** Investigating stuck cross-chain transactions can take time, even for support teams. Provide clear information and wait for their response.

- **Potential Causes for Long Stalls:** Severe relayer issues (off-chain components are down/stuck), bridge contract bugs, issues requiring manual intervention by the bridge team, destination chain instability.

- **Do NOT Send Duplicate Transactions:** Do not try to initiate the exact same bridge transfer again while the first one is potentially stuck mid-process, as this can complicate things.

- **Security:** Be wary of scammers in support channels. Official support will *never* ask for your seed phrase or private keys.
