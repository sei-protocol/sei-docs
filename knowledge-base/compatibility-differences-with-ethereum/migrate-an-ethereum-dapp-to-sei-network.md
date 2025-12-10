---
title: 'How to Migrate an Ethereum dApp to Sei Network'
description: 'How to Migrate an Ethereum dApp to Sei Network'
---

# How to Migrate an Ethereum dApp to Sei Network

Sei's EVM environment provides strong compatibility with Ethereum, making migration relatively straightforward. This guide covers the key steps to port your dApp with minimal code changes.

#### **Step 1: Update Network Configuration**

First, add Sei Network to your development environment:

**Hardhat Example:**

```
// hardhat.config.js
module.exports = {
 networks: {
 // ... existing networks
 sei_testnet: {
 url: "https://evm-rpc-atlantic-2.sei-apis.com",
 chainId: 713715,
 accounts: [process.env.PRIVATE_KEY]
 },
 sei_mainnet: {
 url: "https://evm-rpc.sei-apis.com",
 chainId: 1329,
 accounts: [process.env.PRIVATE_KEY]
 }
 },
 // ... rest of your config
};

```

**Truffle Example:**

```
// truffle-config.js
module.exports = {
 networks: {
 // ... existing networks
 sei_testnet: {
 provider: () => new HDWalletProvider(process.env.MNEMONIC, "https://evm-rpc-atlantic-2.sei-apis.com"),
 network_id: 713715,
 confirmations: 2,
 timeoutBlocks: 200,
 skipDryRun: true
 },
 sei_mainnet: {
 provider: () => new HDWalletProvider(process.env.MNEMONIC, "https://evm-rpc.sei-apis.com"),
 network_id: 1329,
 confirmations: 2,
 timeoutBlocks: 200,
 skipDryRun: true
 }
 }
};

```

**Foundry Example:**

```
# foundry.toml
[profile.default]
src = "src"
out = "out"

[rpc_endpoints]
sei_testnet = "https://evm-rpc-atlantic-2.sei-apis.com"
sei_mainnet = "https://evm-rpc.sei-apis.com"

```

#### **Step 2: Deploy Contracts to Sei**

Deploy your contracts to Sei Testnet first to verify everything works:

**Hardhat:**

```
npx hardhat run --network sei_testnet scripts/deploy.js

```

**Truffle:**

```
truffle migrate --network sei_testnet

```

**Foundry:**

```
forge create --rpc-url sei_testnet --private-key $PRIVATE_KEY src/MyContract.sol:MyContract

```

#### **Step 3: Update Frontend Configuration**

Update your frontend to connect to Sei Network:

**ethers.js Example:**

```
// Add Sei network configuration
const networks = {
 sei: {
 chainId: "0x531", // 1329 in hex
 chainName: "Sei Network",
 nativeCurrency: {
 name: "SEI",
 symbol: "SEI",
 decimals: 18
 },
 rpcUrls: ["https://evm-rpc.sei-apis.com"],
 blockExplorerUrls: ["https://seitrace.com"]
 }
};

// Add network switch function
async function switchToSei() {
 try {
 // Try to switch to Sei
 await window.ethereum.request({
 method: 'wallet_switchEthereumChain',
 params: [{ chainId: networks.sei.chainId }],
 });
 } catch (switchError) {
 // If the network isn't added yet, add it
 if (switchError.code === 4902) {
 try {
 await window.ethereum.request({
 method: 'wallet_addEthereumChain',
 params: [networks.sei],
 });
 } catch (addError) {
 console.error('Failed to add Sei network:', addError);
 }
 } else {
 console.error('Failed to switch to Sei network:', switchError);
 }
 }
}

```

**web3.js Example:**

```
// Initialize provider
const web3 = new Web3("https://evm-rpc.sei-apis.com");

// Check if connected to Sei
async function checkNetwork() {
 const chainId = await web3.eth.getChainId();
 if (chainId !== 1329) {
 alert("Please switch to Sei Network in your wallet");
 }
}

```

#### **Step 4: Adjust for Sei-Specific Features**

While most Ethereum code works as-is, consider these adjustments:

- **Block Time**: Sei has ~600ms blocks vs Ethereum's ~12s

Reduce polling intervals (500ms recommended)

- Adjust block-based timing mechanisms

- **Gas Parameters**:

Gas estimation may differ slightly

- Include slightly higher gas limits initially

- **Parallel Execution**:

No code changes needed, but see [optimization guide](https://markdowntohtml.com/03-evm-development-best-practices.md)

#### **Step 5: Test Thoroughly on Testnet**

- Test all features on Sei Testnet (Atlantic-2)

- Pay special attention to:

Time-sensitive operations

- Gas-intensive functions

- External contract interactions

#### Advanced Considerations

- **Block Explorer Verification**:

Use [SeiTrace](https://seitrace.com/) to verify contracts

- Ensure compiler version and settings match deployment exactly

- **Oracle Integration**:

If your dApp uses Chainlink or other oracles, verify they have Sei Network support

- **Interoperability**:

Consider leveraging Sei's native chain for additional functionality

### Common Migration Issues

#### "Out of Gas" Errors

- Some operations may have different gas costs on Sei

- Solution: Increase gas limits, especially for contract deployment

- See: [Fixing "Out of Gas" Errors](https://markdowntohtml.com/Transactions/05-out-of-gas-errors.md)

#### Timing Differences

- Time-dependent logic might behave differently with 600ms blocks

- Solution: Use timestamps instead of block numbers for timing

- Example: `require(block.timestamp > deadline)` instead of `require(block.number > deadlineBlock)`

#### RPC Connection Issues

- Some public RPC endpoints might have rate limits

- Solution: Use alternative RPC endpoints or run your own node

- See: [Public RPC Endpoints](https://markdowntohtml.com/04-public-rpc-endpoints.md)
