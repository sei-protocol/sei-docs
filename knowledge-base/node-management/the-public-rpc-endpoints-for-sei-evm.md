---
title: 'What are the public RPC endpoints for Sei EVM?'
description: 'What are the public RPC endpoints for Sei EVM?'
---

# What are the public RPC endpoints for Sei EVM?

Sei Network provides several public RPC endpoints for both mainnet and testnet:

**Mainnet RPC Endpoints:**

```
Primary: https://evm-rpc.sei.io
Alternative: https://sei-mainnet-rpc.publicnode.com

```

**Testnet RPC Endpoints:**

```
Primary: https://evm-rpc.testnet.sei.io
Alternative: https://sei-testnet-rpc.publicnode.com

```

For production applications, consider:

- Using a dedicated RPC provider for better reliability

- Implementing failover between multiple endpoints

- Running your own Sei node for critical applications

Example of RPC failover implementation:

```
// RPC failover implementation
async function getReliableProvider() {
 const rpcUrls = [
 "https://evm-rpc.sei.io",
 "https://sei-mainnet-rpc.publicnode.com"
 ];

 for (const url of rpcUrls) {
 try {
 const provider = new ethers.providers.JsonRpcProvider(url);
 await provider.getBlockNumber(); // Test connection
 console.log(`Connected to ${url}`);
 return provider;
 } catch (error) {
 console.warn(`Failed to connect to ${url}: ${error.message}`);
 }
 }

 throw new Error("All RPC endpoints failed");
}
```
