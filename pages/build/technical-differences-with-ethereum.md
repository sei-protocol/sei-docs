---
title: "Divergence from Ethereum"
description: "Explore how Sei’s EVM compatibility differs from Ethereum. Learn about opcode changes, gas fees, block finality, and more."
keywords: ["sei docs", "ethereum differences", "evm compatibility", "gas fees", "web3 docs"]
---

import { CHAIN_IDS } from '@sei-js/registry';

# Divergence from Ethereum

While Sei features full EVM compatibility, there are some distinctions between Sei's EVM and Ethereum itself.

## EVM Differences

Unlike Ethereum mainnet which is on Cancun for its execution layer, Sei uses the Shanghai version of EVM. This means that features like blob transactions are not supported on Sei.

## Opcode Differences

### PREVRANDAO

Since Sei doesn’t rely on the same pseudo-randomness way of determining the next validator like Proof of Stake (PoS) Ethereum does, it doesn’t really have the `RANDOM` artifact that can be set as `PREVRANDAO`'s return value.

In Sei, `PREVRANDAO` is set to return the hash of the current block time. For strong randomness guarantee needs in contract logic, it’s advised to use external verifiable oracles (as is advised on Ethereum itself).

### COINBASE

Coinbase address on Sei is always set to (the EVM address of) the global fee collector.

## State Root

Since Sei uses an AVL tree instead of a Merkle Patricia Trie (MPT) for data storage, Sei doesn’t have per-account state roots. The global state root is the AVL tree root, which is also **not** equivalent to Ethereum’s overall state root (which is an MPT root).

## Block Hash

The block hash on Sei is computed based on the block header in Tendermint data format, and is therefore different from Ethereum’s block hash.

## Base Fee & Tips

Sei supports all transaction types. However, Sei’s base fee **does not** fluctuate due to block congestion. The base fee will always be `0` on Sei—all fees go to the validators (i.e. tips) and none are burnt.

## Block Limit

Sei has a gas limit of 10M on `{CHAIN_IDS.mainnet}`, compared to Ethereum’s 30M.

In addition, Sei also has a byte-size limit of 21MB, whereas Ethereum doesn’t have any byte-denominated limits.

## Non-EVM Transactions

On Sei, there exist non-EVM transactions which may update state accessible by EVM transactions. A simple example would be bank balances, which may be updated by both native Cosmos bank send transactions and EVM send transactions.

As a result, if certain off-chain applications only parse EVM transactions, they may find certain state changes unattributable to any EVM transaction.

## Finality

Sei has instant finality, meaning that commitment levels of “safe,” “latest,” “justified,” and “finalized” on Ethereum are effectively the same thing on Sei.

## Pending State

On Ethereum, the block proposer executes its proposed block first (updating its local state) before broadcasting the proposal to others. This updated state is marked “pending” until the block is accepted by other nodes.

However, on Sei, the block proposer broadcasts first and only executes the proposal if it’s accepted (i.e. every node executes the block at roughly the same time). So, there is no window when a “pending state” exists.
