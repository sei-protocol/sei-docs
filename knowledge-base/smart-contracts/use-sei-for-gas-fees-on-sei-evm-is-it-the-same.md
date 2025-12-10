---
title: 'Can I use $SEI for gas fees on Sei EVM? Is it the same token used for native Sei functions?'
description: 'Can I use $SEI for gas fees on Sei EVM? Is it the same token used for native Sei functions?'
---

# Can I use $SEI for gas fees on Sei EVM? Is it the same token used for native Sei functions?

Yes, the native token of the Sei Network, **$SEI**, is the **sole token used for paying gas fees** for all transactions within the Sei EVM environment.

**Unified Gas Token:**

Unlike some chains that might use different tokens for different virtual machines or layers, Sei uses $SEI consistently across its entire platform:

- **EVM Transactions:** When you send a transaction to interact with a Solidity smart contract, deploy a contract, or even just transfer $SEI between EVM addresses (`0x...`), the gas cost is calculated and deducted from your EVM address's $SEI balance.

- **Native Transactions:** Similarly, if you perform native actions like staking $SEI or voting on governance proposals using your native `sei1...` address, the gas fees for those transactions are also paid in $SEI, deducted from your native address's balance.

**Important Distinction: Balances are Separate**

While the *same* $SEI token is used, the balance held by your EVM (`0x...`) address is distinct from the balance held by your Native (`sei1...`) address.

- To pay for EVM transaction gas, you need $SEI specifically in your **EVM address balance** (visible in MetaMask).

- To pay for native transaction gas, you need $SEI in your **Native address balance**.

If your EVM address balance is zero, you cannot send EVM transactions, even if you have $SEI in your associated native address. You must first transfer $SEI from your native address to your EVM address.

**Fee Mechanism (EIP-1559):**

Sei EVM implements a fee mechanism similar to Ethereum's EIP-1559, featuring:

- A dynamic **Base Fee** (paid in $SEI per unit of gas) that adjusts based on network congestion.

- A **Priority Fee** (or tip, paid in $SEI per unit of gas) that you can add to incentivize validators to include your transaction faster.

The total EVM transaction fee is calculated as: `(Base Fee + Priority Fee) * Gas Used` (paid in $SEI).
