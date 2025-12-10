---
title: "How does Sei's execution model differ from Ethereum?"
description: "How does Sei's execution model differ from Ethereum?"
---

# How does Sei's execution model differ from Ethereum?

## Understanding Execution Models

The execution model defines how a blockchain processes transactions. This is one of the most fundamental differences between Sei and Ethereum.

## Ethereum's Sequential Execution

Ethereum employs a strictly sequential transaction execution model:

- **Single-Threaded Processing**: Only one transaction executes at a time

- **Sequential Block Processing**: Transactions within a block run in strict order

- **Global State Access**: Each transaction has access to the entire blockchain state

- **Single CPU Utilization**: Regardless of the hardware's capabilities, only one CPU core handles execution

- **Deterministic Ordering**: Transaction order is determined by gas price and nonce

This approach ensures simplicity and determinism but creates a throughput bottleneck that limits Ethereum to approximately 15-30 transactions per second.

## Sei's Parallel Execution with OCC

Sei implements Optimistic Concurrency Control (OCC) to enable parallel transaction execution:

- **Multi-Threaded Processing**: Multiple transactions execute simultaneously

- **State Access Analysis**: The system automatically identifies which transactions can run in parallel

- **Conflict Detection**: Transactions touching the same state are identified

- **Optimistic Execution**: Transactions execute in parallel assuming no conflicts

- **Conflict Resolution**: If conflicts occur, affected transactions are re-executed sequentially

This approach significantly increases throughput while maintaining deterministic outcomes identical to sequential processing.

## How Sei's OCC

Sei's parallel execution follows several structured phases:

### 1. Transaction Analysis

Before execution, Sei:

- Maps each transaction to its potential state accesses

- Identifies read/write operations on contract storage

- Detects account balance modifications

- Groups non-conflicting transactions for parallel execution

### 2. Optimistic Parallel Execution

During execution:

- Multiple CPU cores process transaction groups simultaneously

- Each transaction maintains its own "read set" and "write set"

- Temporary state changes are created but not immediately committed

- Resource usage is distributed across hardware cores

### 3. Conflict Detection

After initial execution:

- The system detects any state access conflicts between transactions

- Three types of conflicts are possible:

**Read-After-Write (RAW)**: Transaction B reads data modified by Transaction A

- **Write-After-Read (WAR)**: Transaction B modifies data read by Transaction A

- **Write-After-Write (WAW)**: Multiple transactions modify the same data

### 4. Conflict Resolution

If conflicts are detected:

- Conflicting transactions are grouped together

- Their temporary state changes are discarded

- They are re-executed in sequential order

- The final state is equivalent to what would have occurred under sequential execution

## Performance Comparison

The execution model difference creates substantial performance gaps:

|
Metric |
Ethereum |
Sei |

|
Transaction throughput |
15-30 TPS |
Thousands of TPS |

|
CPU utilization |
Single core |
Multiple cores |

|
Processing efficiency |
Limited by single thread |
Scales with hardware |

|
Re-org possibility |
Yes (probabilistic finality) |
No (instant finality) |

## Developer Implications

For developers, Sei's parallel execution offers substantial benefits:

- **Higher Performance**: Applications can handle much larger user bases

- **Lower Gas Costs**: Less competition for block space means lower fees

- **Faster User Experience**: Transactions confirm in milliseconds instead of seconds/minutes

- **No Code Changes Required**: Standard Solidity contracts work without modification

However, for optimal performance, developers should consider:

```
// Optimized contract pattern for Sei's parallel execution
contract ParallelOptimized {
 // Avoid global counters that create contention points
 // Instead use sharded data structures
 mapping(address => uint256) public userValues;

 function increment() external {
 // Each user updates their own shard, allowing parallel execution
 userValues[msg.sender]++;
 }

 // Only aggregate when needed
 function getTotal(address[] calldata users) external view returns (uint256) {
 uint256 total = 0;
 for (uint i = 0; i return total;
 }
}

```

## SeiDB: The Storage Layer for Parallel Access

Sei's custom storage layer (SeiDB) provides critical features that enable its parallel execution:

- **Multi-Version Concurrency Control (MVCC)**: Maintains multiple versions of state

- **Snapshot Isolation**: Ensures each transaction sees a consistent state view

- **Lock-Free Operations**: Prevents thread blocking during concurrent access

- **Efficient Rollback**: Allows rapid discarding of conflicting states

For developers, Sei's execution model means better performance without requiring code changes, though optimized contract design can further enhance performance by reducing state contention.
