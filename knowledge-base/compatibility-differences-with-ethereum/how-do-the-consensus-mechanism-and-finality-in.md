---
title: 'How do the consensus mechanism and finality in Sei differ from Ethereum?'
description: 'How do the consensus mechanism and finality in Sei differ from Ethereum?'
---

# How do the consensus mechanism and finality in Sei differ from Ethereum?

## Consensus Mechanisms: Different Approaches

The consensus mechanism is the protocol that determines how agreement is reached on the state of a blockchain. Sei and Ethereum take fundamentally different approaches to consensus, resulting in significant differences in performance and user experience.

## Ethereum's Consensus Model

After "The Merge" in September 2022, Ethereum moved to a Proof of Stake (PoS) system:

- **Proof of Stake (PoS)**: Validators are selected to propose blocks based on their staked ETH

- **Leader Election**: Slot leaders are chosen pseudo-randomly based on stake

- **Block Time**: ~12-15 seconds between blocks

- **Beacon Chain**: Coordinates validator activity and block finalization

- **Fork Choice Rule**: LMD GHOST (Latest Message Driven Greedy Heaviest Observed SubTree)

- **Probabilistic Finality**: Transactions become "more final" with each confirmation block

Ethereum's finality is probabilistic, meaning transactions gain a higher probability of being final as more blocks are added on top of them. Practical finality typically requires 2-3 minutes (multiple block confirmations).

## Sei's Consensus Model

Sei uses a Tendermint-based Proof of Stake consensus:

- **Tendermint BFT**: Byzantine Fault Tolerant consensus algorithm

- **Instant Finality**: Blocks are final immediately after confirmation

- **Block Time**: ~400 milliseconds

- **Two-Phase Commit**: Pre-vote and pre-commit phases before finalization

- **No Forking**: Blocks are never reorganized once committed

- **Deterministic Validator Set**: Known validators for each block height

Tendermint consensus provides instant finality, meaning once a block is confirmed, it can never be reversed or reorganized. This eliminates the need to wait for multiple confirmations.

## Finality Time Comparison

|
Network |
Block Time |
Time to First Confirmation |
Practical Finality |

|
Ethereum |
12-15 seconds |
12-15 seconds |
2-3 minutes (12+ blocks) |

|
Sei |
~400 milliseconds |
~400 milliseconds |
~400 milliseconds (instant) |

## Technical Implementation Differences

### Ethereum:

- Uses slot-based block production

- Requires attestations from validators

- Relies on a "fork choice rule" to resolve competing chains

- Can experience temporary chain reorganizations ("reorgs")

- Requires economic assumptions about validator behavior

### Sei:

- Uses round-based block production

- Requires >2/3 validator signatures for finality

- Never creates competing chains at the same height

- Cannot experience reorgs after block confirmation

- Provides stronger consistency guarantees

## Developer Implications

The differences in consensus and finality have significant implications for dApp developers:

### 1. Transaction Confirmation UX

For Ethereum dApps:

```
// Ethereum dApp - wait for multiple confirmations for safety
async function waitForTransaction(txHash) {
 // Wait for transaction to be mined
 const receipt = await provider.waitForTransaction(txHash);

 // Wait for additional confirmations (typically 2-3 minutes)
 await provider.waitForTransaction(txHash, 12); // 12 confirmations

 return receipt;
}

```

For Sei dApps:

```
// Sei dApp - single confirmation is sufficient
async function waitForTransaction(txHash) {
 // Wait for transaction to be mined (typically ~400ms)
 const receipt = await provider.waitForTransaction(txHash);

 // No need to wait for additional confirmations
 return receipt;
}

```

### 2. User Interface Design

The consensus differences affect how you should design your application's user experience:

**Ethereum UIs typically:**

- Show "pending" status for transactions

- Display "confirming" status for 1-12 blocks

- Recommend waiting for multiple confirmations for high-value transactions

- Include reorg protection logic

**Sei UIs can:**

- Move directly from "pending" to "confirmed"

- Consider transactions final after a single confirmation

- Skip intermediate confirmation states

- Provide more responsive feedback to users

### 3. Transaction Safety

In practical terms:

**On Ethereum:**

- High-value transactions should wait for multiple confirmations

- Financial applications typically wait for 12+ confirmations

- Applications must handle potential chain reorganizations

- Frontends should implement optimistic UI with fallbacks

**On Sei:**

- Single confirmation provides complete finality

- No need to wait for additional confirmations

- No possibility of reorganization after confirmation

- Frontends can treat confirmed transactions as permanently settled

## Example: Transaction Monitoring Service

How the consensus differences affect a transaction monitoring service:

```
// Ethereum implementation
class EthereumTransactionMonitor {
 constructor(provider) {
 this.provider = provider;
 this.confirmedTxs = new Map(); // txHash -> confirmations
 }

 async monitorTransaction(txHash) {
 // Initial receipt
 const receipt = await this.provider.waitForTransaction(txHash);

 // Consider "soft confirmed" but keep monitoring
 this.confirmedTxs.set(txHash, 1);
 this.emit('soft_confirmed', txHash);

 // Monitor for 12+ blocks to ensure finality
 const blockNumber = receipt.blockNumber;
 const subscription = this.provider.on('block', async (newBlockNumber) => {
 const confirmations = newBlockNumber - blockNumber;
 this.confirmedTxs.set(txHash, confirmations);

 if (confirmations >= 12) {
 // Now consider fully confirmed
 this.emit('confirmed', txHash);
 this.provider.removeListener('block', subscription);
 }

 // Check for chain reorganizations
 const currentReceipt = await this.provider.getTransactionReceipt(txHash);
 if (!currentReceipt || currentReceipt.blockHash !== receipt.blockHash) {
 // Handle reorg!
 this.emit('reorg', txHash);
 // Restart monitoring
 this.monitorTransaction(txHash);
 }
 });
 }
}

// Sei implementation - much simpler!
class SeiTransactionMonitor {
 constructor(provider) {
 this.provider = provider;
 }

 async monitorTransaction(txHash) {
 // Wait for receipt
 const receipt = await this.provider.waitForTransaction(txHash);

 // Transaction is final, no further monitoring needed
 this.emit('confirmed', txHash);

 // No need to check for reorgs - impossible after confirmation
 return receipt;
 }
}

```

These consensus differences allow Sei dApps to provide more responsive user experiences and simpler backend implementations, while maintaining the compatibility and familiarity of the EVM environment. For developers, this means applications with both the programmability of Ethereum and the rapid finality of high-performance blockchains.
