---
title: "How does Sei's gas model and fee structure differ from Ethereum?"
description: "How does Sei's gas model and fee structure differ from Ethereum?"
---

# How does Sei's gas model and fee structure differ from Ethereum?

## Understanding Gas Models

Gas is the unit of computational work in EVM blockchains. Both Sei and Ethereum use a gas-based pricing model, but with significant differences in implementation and economics.

## Ethereum's Gas Model (Post-EIP-1559)

Ethereum uses a complex dynamic fee market with a two-part fee structure:

- **Base Fee**: Algorithmically determined, burned upon transaction execution

- **Priority Fee** (Tip): Optional fee paid to validators for transaction prioritization

- **Gas Limit**: Maximum computational work a transaction can perform

- **Gas Units**: Measured in "gas" with different costs for various operations

- **Gas Price**: Denominated in gwei (10^-9 ETH)

The total transaction fee is calculated as:

```
Transaction Fee = Gas Used × (Base Fee + Priority Fee)

```

Ethereum's base fee fluctuates based on network congestion, automatically adjusting up or down by up to 12.5% per block to target 50% full blocks.

## Sei's Gas Model

Sei employs a simpler and more predictable fee structure:

- **Simplified Fee Model**: More stable gas prices without the complex EIP-1559 mechanics

- **Gas Units**: Same concept as Ethereum, with potentially different costs per operation

- **Gas Price**: Denominated in usei (10^-6 SEI)

- **Gas Limit**: Maximum computational work a transaction can perform

- **Parallel Execution**: Gas efficiency benefits from multi-threaded processing

The fee calculation in Sei follows:

```
Transaction Fee = Gas Used × Gas Price

```

Sei's gas prices typically remain more stable due to higher throughput capacity and less congestion.

## Key Differences in Gas Units and Costs

|
Operation |
Ethereum (gas) |
Sei (gas) |
Notes |

|
Standard Transfer |
21,000 |
21,000 |
Same base cost |

|
Contract Creation |
32,000+ |
32,000+ |
Similar base cost |

|
SSTORE (cold) |
20,000 |
20,000 |
Similar storage costs |

|
SLOAD (cold) |
2,100 |
2,100 |
Similar read costs |

|
Precompile Calls |
Varies |
Varies |
Sei has additional precompiles |

|
CALL |
2,600+ |
2,600+ |
Similar core operations |

While the gas units are often similar, the actual ETH/SEI cost is typically lower on Sei due to:

- Higher throughput reducing competition for block space

- More stable gas prices

- Gas efficiency from parallel execution

## Fee Market Dynamics

### Ethereum:

- **High Volatility**: Gas prices can spike dramatically during peak usage

- **Fee Burning**: ~70% of gas fees (base fee) are burned, reducing ETH supply

- **MEV Competition**: Validators compete for profitable transaction ordering

- **Congestion-Based Pricing**: Fees directly tied to network congestion

### Sei:

- **Lower Volatility**: More stable gas prices due to higher throughput

- **No Fee Burning**: Fees go to validators as rewards

- **Reduced MEV Impact**: Less profitable MEV due to faster blocks

- **Capacity-Oriented**: Higher throughput means less competition for block space

## Transaction Cost Comparison (Approximate)

|
Transaction Type |
Ethereum Cost (USD)_ |
Sei Cost (USD)_ |
Ratio |

|
Simple Transfer |
$0.50 - $5.00 |
$0.001 - $0.01 |
50-500x cheaper |

|
Token Transfer |
$1.00 - $10.00 |
$0.002 - $0.02 |
50-500x cheaper |

|
Basic Swap |
$5.00 - $50.00 |
$0.01 - $0.10 |
50-500x cheaper |

|
NFT Mint |
$5.00 - $100.00 |
$0.01 - $0.20 |
50-500x cheaper |

|
Complex Contract |
$10.00 - $200.00 |
$0.02 - $0.40 |
50-500x cheaper |

\*Costs vary based on network conditions and token prices. Table shows typical ranges during moderate congestion.

## Gas Estimation Considerations

Ethereum and Sei both offer gas estimation, but with different characteristics:

### Ethereum:

```
// Ethereum gas estimation with buffer
async function sendEthereumTransaction(contract, method, args) {
 // Estimate gas
 const estimatedGas = await contract.estimateGas[method](...args);

 // Add 20% buffer for safety
 const gasLimit = Math.floor(estimatedGas.toNumber() * 1.2);

 // Send transaction
 return contract[method](...args, {
 gasLimit,
 maxFeePerGas: ethers.utils.parseUnits('20', 'gwei'),
 maxPriorityFeePerGas: ethers.utils.parseUnits('2', 'gwei')
 });
}

```

### Sei:

```
// Sei gas estimation with larger buffer due to parallel execution
async function sendSeiTransaction(contract, method, args) {
 // Estimate gas
 const estimatedGas = await contract.estimateGas[method](...args);

 // Add 30% buffer for safety (accounting for parallel execution variability)
 const gasLimit = Math.floor(estimatedGas.toNumber() * 1.3);

 // Send transaction with simple gas price
 return contract[method](...args, {
 gasLimit,
 gasPrice: ethers.utils.parseUnits('0.1', 'gwei') // Much lower than Ethereum
 });
}

```

Sei's gas estimation may sometimes be less precise due to the parallel execution model, so a slightly larger buffer is recommended.

## Practical Impact for Developers

The gas model differences have several implications for developers:

### 1. Contract Optimization Priorities

**Ethereum:**

- Extreme focus on gas optimization

- Complex techniques to reduce storage operations

- Batching operations to amortize costs

- Gas golf for minor optimizations

**Sei:**

- Less pressure for extreme gas optimization

- Focus on reducing state contention for parallel execution

- Simpler, more readable contracts can be economical

- Gas optimization still beneficial but with different priorities

### 2. Frontend Transaction Management

**Ethereum:**

```
// Ethereum frontend transaction handling with fee estimates
async function createEthereumTransaction(provider, to, value) {
 // Get fee data from network
 const feeData = await provider.getFeeData();

 // Prepare transaction with dynamic fees
 return {
 to,
 value,
 maxFeePerGas: feeData.maxFeePerGas,
 maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
 gasLimit: 21000
 };
}

```

**Sei:**

```
// Sei frontend transaction handling
async function createSeiTransaction(provider, to, value) {
 // Simpler fee handling
 return {
 to,
 value,
 gasPrice: ethers.utils.parseUnits('0.1', 'gwei'),
 gasLimit: 21000
 };
}

```

### 3. User Experience Considerations

The fee differences affect how you design your application's UX:

**For Ethereum dApps:**

- Include prominent fee warnings and estimates

- Build complex fee selection interfaces

- Implement transaction timing mechanisms (speed up, cancel)

- Educate users about gas price dynamics

**For Sei dApps:**

- Simplify fee UX with less focus on fee settings

- Emphasize speed and reliability over fee optimization

- Reduce or eliminate fee education requirements

- Enable more frequent microtransactions

_For developers, this means applications can use more frequent transactions, complex operations, and richer on-chain data without prohibitive costs. Users benefit from lower fees and more responsive applications._

_While the fundamental gas concept remains similar, Sei's implementation creates a more accessible and economical environment for EVM applications, removing one of the major barriers to blockchain adoption._
