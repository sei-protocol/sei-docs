---
title: 'Are Sei Network gas fees consistently lower than Ethereum?'
description: 'Are Sei Network gas fees consistently lower than Ethereum?'
---

# Are Sei Network gas fees consistently lower than Ethereum?

Yes, Sei Network gas fees are consistently lower than Ethereum's, typically by at least an order of magnitude. This difference stems from several key factors:

### Why Sei Fees Are Lower:

- **Higher Throughput**:

Sei processes significantly more transactions per second than Ethereum

- More block space means less competition for inclusion

- **Parallel Execution**:

Sei's Optimistic Concurrency Control enables parallel transaction processing

- More efficient execution means resources are used more effectively

- **Different Tokenomics**:

SEI token has a different valuation model than ETH

- Fee market designs prioritize usability over scarcity

- **Network Design Choices**:

Sei was built from the ground up for high performance

- Transaction processing optimized for efficiency

### Quantitative Comparison:

|
Transaction Type |
Ethereum Cost (USD) |
Sei Cost (USD) |
Savings |

|
Simple Transfer |
$1-5 |
$0.01-0.05 |
99%+ |

|
Token Swap |
$5-30 |
$0.05-0.30 |
99%+ |

|
NFT Mint |
$10-100 |
$0.10-1.00 |
99%+ |

|
Complex DeFi |
$20-200 |
$0.20-2.00 |
99%+ |

_Note: Actual costs vary based on network conditions and token prices_

### Example Gas Usage:

```
// Ethereum typical gas prices (variable)
const ethGasPrice = ethers.utils.parseUnits("30", "gwei"); // 30 gwei is often considered "average"

// Sei typical gas prices
const seiGasPrice = ethers.utils.parseUnits("0.5", "gwei"); // Much lower than Ethereum

// Cost comparison for a simple transfer (21,000 gas)
const ethCost = ethGasPrice.mul(21000); // ~0.00063 ETH
const seiCost = seiGasPrice.mul(21000); // ~0.0000105 SEI

console.log("ETH cost:", ethers.utils.formatEther(ethCost), "ETH");
console.log("SEI cost:", ethers.utils.formatEther(seiCost), "SEI");

```

### Consistency Factors:

- **Network Congestion**:

Ethereum fees spike dramatically during high demand

- Sei's higher capacity means congestion is less frequent

- Even during peak usage, Sei maintains relatively low fees

- **Gas Price Stability**:

Sei gas prices remain more stable over time

- Less dramatic fee fluctuations than Ethereum

- **Long-Term Trend**:

Ethereum's fee dynamics change with scaling solutions (L2s, etc.)

- Sei's fundamental architecture ensures sustained fee advantages

For developers and users, Sei's consistently lower fees enable applications that would be economically unfeasible on Ethereum, such as high-frequency trading, micro-transactions, and gas-intensive operations.
