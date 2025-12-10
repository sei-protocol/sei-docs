---
title: 'Why Does My EVM Address Show Zero Balance After Association?'
description: 'Why Does My EVM Address Show Zero Balance After Association?'
---

# Why Does My EVM Address Show Zero Balance After Association?

It's a common point of confusion, but **address association does not automatically transfer funds** between your Sei Native address and your EVM address.

Here's why:

- **Separate Balance Environments:** Although both your `0x...` EVM address and your `sei1...` Native address are derived from the *same* private key, they represent distinct accounts within Sei's different execution layers. Think of them as two separate sub-accounts managed by the same key:

The **Native (`sei1...`) address** holds $SEI tokens used for native functions like staking and governance, and interacts with native Sei assets.

- The **EVM (`0x...`) address** holds $SEI tokens specifically formatted for use within the EVM environment – paying gas for EVM transactions and interacting with Solidity smart contracts.

- **Association Links Identity, Not Funds:** The association process simply creates an on-chain link confirming that both addresses belong to you (i.e., are controlled by the same private key). It **does not** move any $SEI tokens from one address balance to the other.

**How to Fund Your EVM Address:**

To see and use $SEI in your EVM wallet (like MetaMask) after association, you need to explicitly send funds *from* your Native (`sei1...`) address *to* your EVM (`0x...`) address.

This can typically be done through:

- **Sei-Specific Wallets or Interfaces:** Wallets like Keplr, Leap, or dedicated Sei dashboards often provide functionality to send $SEI between your own native and EVM addresses.

- **Programmatic Transfer (Advanced):** While less common for typical users, developers could potentially use native Sei transactions or specific bridge/transfer mechanisms if available.

- *(Self-transfer Note: Standard EVM wallets like MetaMask cannot initiate transfers *from* your native `sei1...` address; the transfer must originate from the native side or a dedicated bridging interface.)*

Once you transfer $SEI from your native address to your EVM address, it will appear in your MetaMask balance and be available for EVM gas fees and dApp interactions.
