---
title: 'What is the Sei EVM Environment?'
description: 'What is the Sei EVM Environment?'
---

# What is the Sei EVM Environment?

Sei Network provides a high-performance blockchain environment optimized for speed and throughput, making it particularly suitable for demanding applications like trading platforms and games. Within Sei, the **EVM (Ethereum Virtual Machine) environment** allows developers to deploy and run smart contracts written in languages like Solidity, using familiar Ethereum tools and standards.

Think of the Sei EVM environment as a highly specialized execution layer for Ethereum-compatible smart contracts.

**Key Differentiators (Compared to other EVM environments):**

- **Optimized Performance:**

**Fast Block Times:** Sei achieves significantly faster block finality compared to standard Ethereum, resulting in quicker transaction confirmations for users.

- **Parallel Execution:** This is a core innovation. Sei's EVM can process multiple non-conflicting transactions *simultaneously* within a block. If two transactions don't attempt to modify the same contract state, they can run in parallel, drastically increasing the network's overall transaction throughput (TPS) beyond typical sequential execution limits.

- **Enhanced Functionality via Precompiles:**

Sei extends the standard EVM capabilities by providing **precompiled contracts**. These are built-in contracts at special addresses that offer efficient, low-gas access to core Sei chain features directly from Solidity. Examples include interacting with native staking, governance voting, token transfers, querying on-chain price oracles, and bridging to contracts.

- **Native Token Integration:**

The native `$SEI` token is used for gas fees within the EVM environment.

- Precompiles facilitate interaction between EVM contracts and native Sei tokens (including $SEI itself and other tokens created on the Sei chain).

_The Sei EVM environment aims to provide the compatibility and tooling familiarity of Ethereum while offering substantially higher performance and deeper integration with native chain features through parallelization and specialized precompiles._
