---
title: 'How do transactions work on Sei EVM, and how quickly can I consider them final?'
description: 'How do transactions work on Sei EVM, and how quickly can I consider them final?'
---

# How do transactions work on Sei EVM, and how quickly can I consider them final?

Sei EVM's transaction processing differs from traditional Ethereum-based chains due to its parallel execution model and unique consensus mechanism. Understanding this lifecycle helps you build more performant and reliable applications.

## Transaction Lifecycle Overview

Here's the complete journey of a transaction on Sei EVM:

- **Creation**: User initiates a transaction through wallet or dApp

- **Submission**: Transaction is signed and broadcast to the Sei network

- **Mempool**: Transaction enters the validator mempool

- **Parallelization Analysis**: Sei groups transactions that can be processed simultaneously

- **Execution**: Transactions are executed in parallel where possible

- **Conflict Resolution**: Conflicts between parallel executions are detected and resolved

- **Block Inclusion**: Successful transactions are included in a block

- **Consensus**: Block reaches consensus through Sei's tendermint-based consensus

- **Finality**: Transaction becomes final (irreversible)

- **State Update**: The global state is updated to reflect transaction results

## Key Differences from Ethereum

### Parallel Execution

On Ethereum, transactions within a block are processed sequentially, one after another. On Sei:

- The blockchain analyzes which transactions can be safely processed in parallel

- Multiple transactions can execute simultaneously if they don't access the same state

- Transactions with state conflicts may be reordered or reprocessed to maintain consistency

- The final block shows a deterministic execution order despite parallel processing

### Consensus and Finality

```
┌─────────────────────────────────────────────────────────────┐
│ │
│ Ethereum │ Sei │
│ │ │
│ ┌───────────┐ ~12+ secs │ ┌───────────┐ 400ms │
│ │Transaction│ ─────────────► │ │Transaction│ ──────────► │
│ │ Submitted │ │ │ Submitted │ │
│ └───────────┘ │ └───────────┘ │
│ │ │ │ │
│ ▼ │ ▼ │
│ ┌───────────┐ │ ┌───────────┐ │
│ │ Included │ │ │ Included │ │
│ │ in Block │ │ │ in Block │ │
│ └───────────┘ │ └───────────┘ │
│ │ │ │ │
│ ▼ │ ▼ │
│ ┌───────────┐ minutes-hrs │ ┌───────────┐ 1 sec │
│ │Probabilist│ ─────────────► │ │ Instant │ ──────────► │
│ │ Finality │ │ │ Finality │ │
│ └───────────┘ │ └───────────┘ │
│ │ │
└─────────────────────────────────────────────────────────────┘

```

- **Ethereum**: Uses probabilistic finality, becoming more "final" with more confirmations

- **Sei**: Uses instant finality through Tendermint consensus

Once a block is confirmed, it cannot be reverted

- Finality occurs within seconds, not minutes

## Transaction Timing Benchmarks

Typical transaction timings on Sei EVM:

|
Phase |
Ethereum |
Sei EVM |

|
Block time |
~12-15 seconds |
~400 milliseconds |

|
First confirmation |
~12-15 seconds |
~400 milliseconds |

|
Practical finality |
~2-3 minutes |
~1 second |

|
Full finality |
~6+ minutes |
~1 second |

## Concurrency Control in Practice

Sei uses an Optimistic Concurrency Control (OCC) mechanism:

- **Read Phase**: During transaction execution, a "read set" of accessed state is recorded

- **Validation Phase**: Sei checks if any other parallel transactions modified the same state

- **Write Phase**: If no conflicts, changes are committed; if conflicts exist, transactions may be re-executed

This approach allows Sei to deliver:

- High throughput with thousands of transactions per second

- Deterministic results despite parallel execution

- Short confirmation times regardless of network load

## Transaction Failures Specific to Parallel Execution

Unique failure modes on Sei EVM:

- **Conflict Aborts**: Transactions might fail if concurrent transactions modify the same state

- **Optimistic Execution Reversions**: A transaction initially executing successfully may revert if conflicts are detected

- **Resequencing**: Transactions may execute in a different order than they were submitted

Best practices for handling these scenarios:

```
// Example client-side code handling resubmission
async function sendTransactionWithRetry(tx, maxAttempts = 3) {
 let attempts = 0;
 while (attempts try {
 const response = await wallet.sendTransaction(tx);
 const receipt = await response.wait();

 if (receipt.status === 1) {
 return receipt; // Success
 }

 // Failed but not due to conflict - no retry needed
 if (!receipt.logs.some(log => log.topics.includes(CONFLICT_TOPIC_ID))) {
 throw new Error("Transaction failed - not a conflict issue");
 }

 // Brief delay before retry
 await new Promise(resolve => setTimeout(resolve, 200 * attempts));
 attempts++;
 } catch (error) {
 if (error.message.includes("conflict") || error.message.includes("resequenced")) {
 await new Promise(resolve => setTimeout(resolve, 200 * attempts));
 attempts++;
 } else {
 throw error; // Different error - propagate
 }
 }
 }
 throw new Error(`Transaction failed after ${maxAttempts} attempts`);
}

```

## Practical Implications for Developers

### Waiting for Confirmations

With Sei's fast finality, application developers can:

- **Show Immediate Feedback**: Once a transaction receipt is received, it's safe to update the UI

- **Chain Transactions**: Subsequent transactions can be submitted immediately after confirmation

- **Reduce Pending States**: Shorter "pending" transaction states improve user experience

```
// Example React hook for Sei transaction tracking
function useSeiTransactionStatus(txHash: string | null) {
 const [status, setStatus] = useState(txHash ? 'pending' : 'idle');

 useEffect(() => {
 if (!txHash) {
 setStatus('idle');
 return;
 }

 setStatus('pending');

 const checkReceipt = async () => {
 try {
 const receipt = await provider.getTransactionReceipt(txHash);
 if (receipt) {
 setStatus(receipt.status === 1 ? 'success' : 'failed');
 return true;
 }
 return false;
 } catch (error) {
 console.error("Error checking receipt:", error);
 return false;
 }
 };

 // Check immediately
 checkReceipt();

 // Poll briefly - with Sei's quick finality, should resolve in ~1 second
 const interval = setInterval(async () => {
 const received = await checkReceipt();
 if (received) clearInterval(interval);
 }, 200); // 200ms polling is reasonable for Sei

 return () => clearInterval(interval);
 }, [txHash]);

 return status;
}

```

### Off-Chain Systems Integration

When integrating with off-chain systems such as databases or APIs:

```
// Example: Safely update backend after Sei transaction confirmation
async function processPayment(paymentTx, userId) {
 // Wait for transaction confirmation
 const receipt = await provider.waitForTransaction(paymentTx.hash);

 // Only proceed if transaction succeeded
 if (receipt.status === 1) {
 // Safe to update database - transaction is final
 await database.recordPayment({
 userId,
 amount: paymentTx.value,
 txHash: paymentTx.hash,
 confirmed: true,
 timestamp: Date.now()
 });

 // Safe to trigger external API calls
 await notificationService.sendPaymentConfirmation(userId);
 } else {
 // Handle failed transaction
 await database.recordPayment({
 userId,
 amount: paymentTx.value,
 txHash: paymentTx.hash,
 confirmed: false,
 timestamp: Date.now()
 });
 }
}

```

## When to Consider a Transaction Final?

Given Sei's architecture, here are practical guidelines:

- **UI Updates**: Update UI immediately after receiving transaction receipt

- **Dependent Transactions**: Wait for receipt before submitting dependent transactions

- **External System Integration**: Wait for 1 block confirmation (~400ms)

- **High-Value Transactions**: Wait for 2-3 block confirmations (~1-1.2 seconds)

- **Critical Financial Operations**: Wait for 3-5 block confirmations (~1.2-2 seconds)

## Reorgs and Chain Reorganizations

Unlike Ethereum, where chain reorganizations can occur when miners find competing chains:

- **Sei uses Tendermint consensus**, which has instant finality

- **Reorgs do not occur** after block finalization

- Transactions cannot be "dropped" after confirmation

- No need to wait for 6+ confirmations as with Ethereum

## Common Troubleshooting Scenarios

### Transaction Stuck Pending

If a transaction appears stuck in pending status:

- Check if the transaction has a receipt using the block explorer

- If no receipt after 10+ seconds (unusual for Sei):

The transaction may have been dropped from the mempool

- Network conditions may be preventing propagation

- There could be a client-side issue with your connection

Resolution: Consider resubmitting with higher gas price or checking network status.

### Transaction Confirmed but State Unchanged

If a transaction is confirmed but expected state changes aren't visible:

- Verify the transaction was successful (status = 1) in the explorer

- Check if the contract emitted expected events

- Verify you're querying the correct contract and network

- Consider if another parallel transaction caused unexpected state changes

### Multiple Parallel Transactions

When submitting multiple transactions in rapid succession:

- Submit transactions with appropriate nonce values

- Be aware that transactions may be reordered during parallel execution

- Design your application logic to be resilient to reordering

- Consider using the `nonce` parameter to enforce strict ordering when necessary
