---
title: "How does Sei's parallel transaction execution work and how does it benefit my dApps?"
description: "How does Sei's parallel transaction execution work and how does it benefit my dApps?"
---

# How does Sei's parallel transaction execution work and how does it benefit my dApps?

Sei's EVM implementation features a powerful **Optimistic Concurrency Control (OCC)** mechanism that enables parallel transaction processing, which is an advancement over Ethereum's sequential execution model.

## How Parallel Execution Works in Sei

Sei uses a sophisticated transaction analysis and execution approach:

- **Transaction Grouping**: The system automatically analyzes transactions to identify which ones can safely run in parallel based on state access patterns.

- **Optimistic Execution**: Rather than forcing all transactions to execute one after another, Sei processes compatible transactions simultaneously across multiple threads.

- **Conflict Detection**: The system tracks state read/write operations during execution to detect any conflicts between parallel transactions.

- **Conflict Resolution**: If conflicts are detected, affected transactions are re-executed in a deterministic order to ensure consistency.

- **Finalization**: Successfully executed transactions are committed to the blockchain in a deterministic order.

## Benefits for Developers and Users

This parallel execution model provides several key advantages:

- **Higher Throughput**: Sei can process many more transactions per second than traditional sequential EVMs.

- **Lower Fees**: Increased throughput leads to reduced congestion and lower gas costs during high-demand periods.

- **Faster Finality**: Transactions confirm more quickly, improving user experience.

- **No Code Changes Required**: Your existing Solidity contracts work without modification - the parallelization happens at the protocol level.

## Technical Considerations

When developing for Sei's EVM, keep these points in mind:

- **Deterministic Results**: Despite parallel execution, results are always deterministic - the same transactions will always produce the same outcome.

- **Contract Interactions**: The system automatically handles dependencies between contracts that interact with each other.

- **Gas Model**: While execution happens in parallel, gas accounting remains consistent with the Ethereum model.

- **Flash Loan Protection**: The parallel execution model has built-in protections against flash loan attacks that might exploit parallelism.

## Performance Expectations

In real-world conditions, Sei's EVM can achieve:

- Throughput of thousands of transactions per second (multiple orders of magnitude higher than Ethereum)

- Confirmation times of less than 1 second

- Consistent performance even during high network activity

## Best Practices

To maximize the benefits of parallel execution:

- Design contracts that minimize state overlap when possible

- Consider batching multiple related operations in single transactions

- Test throughput-sensitive applications under realistic load conditions
