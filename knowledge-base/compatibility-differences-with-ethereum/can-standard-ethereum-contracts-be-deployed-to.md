---
title: 'Can Standard Ethereum Contracts Be Deployed to Sei EVM?'
description: 'Can Standard Ethereum Contracts Be Deployed to Sei EVM?'
---

# Can Standard Ethereum Contracts Be Deployed to Sei EVM?

Yes, in most cases, **standard Solidity smart contracts written for Ethereum can be deployed directly to Sei's EVM environment without requiring code modifications.**

**High Compatibility:**

Sei's EVM is designed for high compatibility with the Ethereum Virtual Machine, specifically supporting Ethereum Improvement Proposals (EIPs) up to and including the **Cancun** hard fork level. This ensures that contracts utilizing standard EVM opcodes, interfaces (like ERC20, ERC721, ERC1155), and common development patterns will function as expected on Sei.

**Easy Migration for dApps:**

This high compatibility makes migrating existing Ethereum dApps significantly easier:

- **Smart Contracts:** Your core Solidity contracts likely do not need changes.

- **Deployment Tooling:** You can use standard Ethereum development tools like Hardhat or Foundry. Simply configure them with Sei's network details (RPC URL, Chain ID) to deploy your contracts to Sei Mainnet or Testnet.

- **Frontend Integration:** Update your dApp's frontend (e.g., JavaScript using libraries like ethers.js or viem) to point to Sei's RPC endpoint and use the correct Chain ID (`1329` for Mainnet, `1328` for Testnet).

**Example Hardhat Configuration (`hardhat.config.js`):**

```
require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config(); // To load private key from .env file

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
 solidity: "0.8.20", // Use your contract's Solidity version
 networks: {
 sei_mainnet: {
 url: process.env.SEI_MAINNET_RPC_URL || "https://evm-rpc.sei-apis.com",
 chainId: 1329,
 accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
 },
 sei_testnet: {
 url: process.env.SEI_TESTNET_RPC_URL || "https://evm-rpc-atlantic-2.sei-apis.com",
 chainId: 1328,
 accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
 },
 },
};

```

**Key Considerations During Migration:**

- **Block Time:** Sei's much faster block time (~600ms vs. Ethereum's ~12s) requires adjusting frontend logic that relies on block progression (e.g., reducing polling intervals, updating UI feedback for faster confirmations).

- **Gas Costs:** While generally lower, specific opcode costs might differ slightly. Test gas usage on Sei Testnet. *(See: [Troubleshooting "Out of Gas" Errors on Sei](https://markdowntohtml.com/link-to-out-of-gas-article))*

- **Leveraging Sei Features:** While direct migration is possible, consider leveraging Sei's unique features (faster finality, parallelization, custom precompiles) for enhanced performance or functionality post-migration.

_Overall, Sei offers a familiar EVM environment that streamlines the process of deploying existing Ethereum contracts and migrating dApps to allow developers to benefit from Sei's performance improvements with minimal friction._
