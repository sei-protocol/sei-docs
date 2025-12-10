---
title: 'How can I optimize my smart contracts to use less gas on Sei Network?'
description: 'How can I optimize my smart contracts to use less gas on Sei Network?'
---

# How can I optimize my smart contracts to use less gas on Sei Network?

While Sei's parallel execution model already provides lower gas costs compared to many other EVM chains, optimizing your contracts can further reduce costs and improve performance. This guide covers Sei-specific and general EVM gas optimization techniques.

## Sei-Specific Optimizations

### Leverage Parallel Execution

Sei's parallel execution model works best when:

- **Minimize State Overlap**: Design contracts to reduce shared state access between unrelated transactions.

- **Batch Related Operations**: Group related operations in single transactions where possible.

- **Use Events Strategically**: Emit events for off-chain tracking instead of storing unnecessary data on-chain.

### Use Sei Precompiles

Sei's precompiled contracts are optimized implementations that cost less gas than equivalent Solidity code:

- **Oracle Price Feeds** (`0x...1008`): Use the Oracle precompile instead of implementing your own oracle solution.

- **Bank Operations** (`0x...1001`): Leverage native token transfers for better performance.

- **Address Management** (`0x...1004`): Use for efficient address conversions and validation.

- **IBC Transfers** (`0x...1009`): Enable cross-chain communication with minimal gas.

## General EVM Optimizations

### Storage Optimization

Storage operations are among the most expensive EVM operations:

```
// ❌ Expensive: Uses multiple storage slots
uint8 public value1;
uint8 public value2;
uint8 public value3;

// ✅ Efficient: Packs variables into a single storage slot
uint8 public value1;
uint8 public value2;
uint8 public value3;

```

- **Variable Packing**: Group smaller variables together to fit in a single 32-byte storage slot.

- **Use `bytes32` Instead of String**: When possible, use fixed-size bytes32 instead of dynamic strings.

- **Consider Memory vs Storage**: Use memory for temporary data manipulation.

### Computation Optimization

- **Avoid Loops with Unknown Bounds**: They can consume unpredictable amounts of gas.

- **Cache Array Length in Loops**:

```
// ❌ Expensive: Reads length on each iteration
for (uint i = 0; i length; i++) { ... }

// ✅ Efficient: Reads length once
uint length = array.length;
for (uint i = 0; i length; i++) { ... }

```

- **Short-circuit Evaluation**: Order conditions to evaluate cheaper checks first.

```
// ❌ Expensive if msg.sender check is usually false
function example(uint x) external {
 if (complexCalculation(x) && msg.sender == owner) { ... }
}

// ✅ Efficient: Checks cheaper condition first
function example(uint x) external {
 if (msg.sender == owner && complexCalculation(x)) { ... }
}

```

### Function Optimization

- **Function Visibility**: Use the most restrictive visibility modifier appropriate:

`external` is cheaper than `public` for functions called from outside

- `internal` is cheaper than `private` for functions called within the contract

- **View and Pure Functions**: Mark functions as `view` or `pure` when appropriate.

- **Function Modifiers vs. Functions**:

```
// ❌ Less efficient for complex logic
modifier checkStuff() {
 // Complex validation logic here
 _;
}

// ✅ More efficient for complex logic
function _checkStuff() internal view {
 // Complex validation logic here
}

function doSomething() external {
 _checkStuff();
 // Function logic
}

```

### Gas-Efficient Patterns

- **Replace Expensive Operations**:

Use bitwise operations instead of multiplication/division where possible

- Use `unchecked` blocks for arithmetic when overflow is impossible

```
// ❌ Standard with overflow checks
function increment(uint x) external returns (uint) {
 return x + 1;
}

// ✅ Gas efficient for trusted inputs
function increment(uint x) external returns (uint) {
 unchecked { return x + 1; }
}

```

- **Gas-Efficient Libraries**: Use battle-tested libraries like OpenZeppelin's.

## Testing Gas Efficiency

To measure the impact of your optimizations:

- **Use Hardhat's Gas Reporter**:

```
npm install --save-dev hardhat-gas-reporter

```

In `hardhat.config.ts`:

```
import "hardhat-gas-reporter";

export default {
 // ... other config
 gasReporter: {
 enabled: true,
 currency: 'USD',
 gasPrice: 10, // Adjust to Sei's typical gas price
 }
};

```

- **Analyze Contract Size**: Use `npx hardhat size-contracts` to ensure you're not approaching the 24KB contract size limit.

## Real-World Example

Here's a before and after example of gas optimization:

```
// ❌ Before optimization
contract Expensive {
 string[] private data;

 function addData(string calldata newData) external {
 data.push(newData);
 }

 function processData() external {
 for (uint i = 0; i // Process each item
 processItem(data[i]);
 }
 }

 function processItem(string memory item) internal {
 // Process logic...
 }
}

// ✅ After optimization
contract Optimized {
 bytes32[] private data;

 function addData(bytes32 newData) external {
 data.push(newData);
 }

 function processData() external {
 uint length = data.length;
 for (uint i = 0; i // Process each item
 processItem(data[i]);
 }
 }

 function processItem(bytes32 item) internal pure {
 // Process logic...
 }
}

```

## Benefits of Gas Optimization on Sei

Gas optimization on Sei provides several advantages:

- **Lower Transaction Costs**: Obvious benefit of reduced fees.

- **Higher Transaction Throughput**: More efficient contracts enable more operations per transaction.

- **Better User Experience**: Faster transactions with lower fees improve UX.

- **Reduced Network Congestion**: Efficient contracts help the entire network perform better.
