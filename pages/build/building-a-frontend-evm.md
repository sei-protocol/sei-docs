---
title: "Building a Frontend (EVM)"
description: "Set up a React-based EVM DApp on Sei, bridging EVM contracts to CosmWasm via the Wasm Precompile."
keywords: ["sei docs", "evm dapp", "wasm precompile", "react", "web3 docs"]
---

import { Callout } from "nextra/components";

# Building a Frontend (EVM)

## Introduction

In this tutorial, we'll set up a React project that connects to a Sei EVM-compatible wallet (e.g. MetaMask) and interacts with a CosmWasm contract via Sei's **Wasm Precompile**. This demonstrates how EVM clients can query and execute CosmWasm contracts seamlessly on Sei.

## Prerequisites

- Node.js & npm installed
- A Sei-compatible EVM wallet (e.g. MetaMask configured for Sei)
- Sufficient devnet tokens (arctic-1) from the [faucet](../dev-ecosystem-providers/faucets.mdx)

## Creating a React Project

Use Vite's TypeScript template for a quick setup:

```bash
npm create vite@latest my-counter-frontend -- --template react-ts
```

Open the `my-counter-frontend` folder in your IDE.

<Callout type="info">
You can remove type annotations if you're not using TypeScript.
</Callout>

## Installing Dependencies

Install [ethers.js](https://docs.ethers.org/v6/) for EVM interaction:

```bash
npm install ethers
```

Install Sei's EVM package:

```bash
npm install @sei-js/evm
```

## Defining Contract Addresses and ABI

Sei provides a **Wasm Precompile** contract to bridge EVM calls to a CosmWasm contract. The address and ABI are in `@sei-js/evm`:

```js
import { WASM_PRECOMPILE_ADDRESS, WASM_PRECOMPILE_ABI } from '@sei-js/evm';
```

## Connecting to the Wallet and Initializing the Contract

Below is an example `App.tsx`. It:

- Checks for an EVM-compatible wallet
- Verifies the chain is Sei devnet
- Connects to the Wasm Precompile
- Fetches and increments the counter on a CosmWasm contract

```tsx
import { WASM_PRECOMPILE_ADDRESS, SEI_CHAIN_INFO, getWasmPrecompileEthersV6Contract } from '@sei-js/evm';
import { useEffect, useState } from "react";
import { BrowserProvider, Contract, toUtf8Bytes, toUtf8String } from "ethers";
import "./App.css";
 
function App() {
  const [count, setCount] = useState<string>();
  const [contract, setContract] = useState<Contract>();
  const [isIncrementing, setIsIncrementing] = useState(false);

  // Replace with your actual CosmWasm contract address on arctic-1
  const COUNTER_CONTRACT_ADDRESS = "sei14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9sh9m79m";

  const fetchCount = async () => {
    if (!contract) return;
    const queryMsg = { get_count: {} };
    const queryResponse = await contract.query(
      COUNTER_CONTRACT_ADDRESS,
      toUtf8Bytes(JSON.stringify(queryMsg))
    );
    const { count } = JSON.parse(toUtf8String(queryResponse));
    setCount(count);
  };

  useEffect(() => {
    fetchCount();
  }, [contract]);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("No EVM wallet installed");
      return;
    }
    const provider = new BrowserProvider(window.ethereum);
    const { chainId } = await provider.getNetwork();
    const devnetChainId = SEI_CHAIN_INFO.devnet.chainId;

    if (chainId !== BigInt(devnetChainId)) {
      alert("Wallet is not connected to Sei EVM devnet");
      return;
    }

    const signer = await provider.getSigner();
    const contract = getWasmPrecompileEthersV6Contract(signer);
    setContract(contract);
  };

  const incrementCount = async () => {
    if (!contract) return;
    setIsIncrementing(true);

    const executeMsg = { increment: {} };
    const executeResponse = await contract.execute(
      COUNTER_CONTRACT_ADDRESS,
      toUtf8Bytes(JSON.stringify(executeMsg)),
      toUtf8Bytes(JSON.stringify([])) // Funds array if needed
    );
    await executeResponse.wait();
    setIsIncrementing(false);
    await fetchCount();
  };

  return (
    <div className="card">
      {contract ? (
        <div>
          <h1>Count is {count}</h1>
          <button disabled={isIncrementing} onClick={incrementCount}>
            {isIncrementing ? "incrementing..." : "increment"}
          </button>
        </div>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
    </div>
  );
}
 
export default App;
```

Run `npm run dev` and open http://localhost:5173.

## Conclusion

You've built an **EVM-based** React DApp that can call a **CosmWasm** contract through Sei’s Wasm Precompile. This cross-VM model is one of Sei’s unique benefits. For a purely **CosmWasm** approach, see [Building a Frontend (CosmWasm)](./building-a-frontend-cosmwasm.md).
