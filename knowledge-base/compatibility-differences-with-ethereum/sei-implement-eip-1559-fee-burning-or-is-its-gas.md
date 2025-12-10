---
title: 'Does Sei implement EIP-1559 fee burning, or is its gas model different?'
description: 'Does Sei implement EIP-1559 fee burning, or is its gas model different?'
---

# Does Sei implement EIP-1559 fee burning, or is its gas model different?

Sei does not implement Ethereum's EIP-1559 fee burning mechanism. Instead, it uses a modified fee model that combines aspects of Ethereum's gas system with Cosmos SDK fee structures:

### Sei's Gas Model:

- **Base Fee Structure**:

Uses a standard gas price model similar to pre-EIP-1559 Ethereum

- No automatic base fee adjustment or fee burning mechanism

- Gas prices tend to be more stable than on Ethereum

- **Fee Distribution**:

Transaction fees go to validators rather than being burned

- This aligns with Cosmos SDK's approach where validators receive fees for processing transactions

- **Gas Pricing**:

Gas prices are typically much lower than Ethereum

- Gas units measure computational resources similar to Ethereum

- Fees are paid in SEI tokens

- **Example Transaction**:

```
// Standard EVM transaction on Sei
const tx = await signer.sendTransaction({
 to: recipient,
 value: ethers.utils.parseEther("1.0"),
 gasPrice: ethers.utils.parseUnits("0.5", "gwei"), // Much lower than ETH
 gasLimit: 21000
});

```

### Comparison with EIP-1559:

|
Feature |
Ethereum (EIP-1559) |
Sei Network |

|
Base Fee |
Dynamic, adjusted each block |
Static or gradually adjusted |

|
Fee Burning |
Burns base fee portion |
No fee burning |

|
Priority Fee |
Tip to validators |
Entire fee to validators |

|
Fee Volatility |
Can change rapidly |
More stable |

|
Block Space Auction |
Less competitive |
Standard gas price auction |

### Implications:

- **Tokenomics**: Without fee burning, SEI doesn't have the deflationary mechanism that ETH has

- **User Experience**: Generally more predictable fees on Sei

- **Fee Market**: Less competition for block space due to Sei's higher throughput

- **Value Accrual**: Fees accrue to validators rather than reducing token supply

For developers, this means:

- Gas price estimation is simpler than on Ethereum

- Fee spikes during network congestion are less severe

- Gas strategies can be less complex than on Ethereum
