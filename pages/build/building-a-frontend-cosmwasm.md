---
title: "Building a Frontend (CosmWasm)"
description: "Learn how to create a React-based DApp that interacts with CosmWasm contracts on Sei using @sei-js libraries."
keywords: ["sei docs", "cosmwasm", "frontend", "smart contracts", "web3 docs"]
---

import { Callout } from "nextra/components";

# Building a Frontend (CosmWasm)

## Introduction

In this tutorial, we’ll create a React application that connects to Sei-compatible wallets (Compass, Fin, Leap, etc.) and interacts with a CosmWasm contract natively. We'll use [@sei-js](https://github.com/sei-protocol/sei-js) libraries to handle wallet connection, queries, and executes.

## Requirements

- Node.js & npm installed
- One of these Sei wallets:
  - [Compass](https://compasswallet.io/)
  - [Fin](https://finwallet.com/)
  - [Leap](https://www.leapwallet.io/)
- A deployed CosmWasm contract on Sei devnet (e.g., a "counter" contract)
- Enough devnet tokens (arctic-1) for transaction fees

## Creating a React Project

Create a new React + TS project with Vite:

```bash
npm create vite@latest my-counter-frontend -- --template react-ts
```

<Callout type="info">
We're using TypeScript for clarity. Remove type definitions if you prefer JavaScript.
</Callout>

## Installing Dependencies

```bash
npm install @sei-js/core @sei-js/react
```

## Wrapping App in `SeiWalletProvider`

```tsx
import { SeiWalletProvider } from "@sei-js/react";
import "./App.css";
import Home from "./Home.tsx";

function App() {
  return (
    <SeiWalletProvider
      chainConfiguration={{
        chainId: "arctic-1",
        restUrl: "https://rest.arctic-1.seinetwork.io",
        rpcUrl: "https://rpc.arctic-1.seinetwork.io"
      }}
      wallets={["compass", "fin", "leap"]}
    >
      <Home />
    </SeiWalletProvider>
  );
}

export default App;
```

This sets up the wallet context so you can easily connect a wallet and perform queries or executes.

## The Home Component

```tsx
import { useCallback, useEffect, useState } from "react";
import {
  useCosmWasmClient,
  useSigningCosmWasmClient,
  useWallet,
  WalletConnectButton,
} from "@sei-js/react";

const CONTRACT_ADDRESS =
  "sei14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9sh9m79m";

function Home() {
  const [count, setCount] = useState<number>();
  const [error, setError] = useState<string>("");
  const [isIncrementing, setIsIncrementing] = useState<boolean>(false);

  // Provide a handle to connected wallet info
  const { connectedWallet, accounts } = useWallet();

  // Query-only CosmWasm client
  const { cosmWasmClient: queryClient } = useCosmWasmClient();

  // Sign/execute client for writing to contracts
  const { signingCosmWasmClient: signingClient } = useSigningCosmWasmClient();

  const fetchCount = useCallback(async () => {
    if (!queryClient) return;
    const response = await queryClient.queryContractSmart(CONTRACT_ADDRESS, {
      get_count: {},
    });
    return response?.count;
  }, [queryClient]);

  useEffect(() => {
    fetchCount().then((val) => setCount(val));
  }, [connectedWallet, fetchCount]);

  const incrementCounter = async () => {
    if (!signingClient || !accounts?.length) return;
    setIsIncrementing(true);

    try {
      const senderAddress = accounts[0].address;
      const msg = { increment: {} };
      const fee = {
        amount: [{ amount: "20000", denom: "usei" }],
        gas: "200000",
      };

      await signingClient.execute(senderAddress, CONTRACT_ADDRESS, msg, fee);

      // Refresh the count after the transaction
      const updatedCount = await fetchCount();
      setCount(updatedCount);
      setError("");
    } catch (err: any) {
      setError(err.message ?? "Unknown error");
    }
    setIsIncrementing(false);
  };

  // If no wallet is connected, show a connect button
  if (!connectedWallet) {
    return <WalletConnectButton />;
  }

  return (
    <div>
      <h1>Count is: {count ?? "---"}</h1>
      <button disabled={isIncrementing} onClick={incrementCounter}>
        {isIncrementing ? "incrementing..." : "increment"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default Home;
```

### Explanation

- **`useWallet()`** provides info on the currently connected wallet/account.
- **`useCosmWasmClient()`** for read (query) operations.
- **`useSigningCosmWasmClient()`** for write (execute) operations.
- Fetch the contract's counter and update it by sending `increment` messages.

## Running the App

```bash
npm run dev
```

Open the provided localhost URL (commonly http://localhost:5173).

<Callout type="info">
If your wallet is not recognized, ensure you installed the correct extension and have
sufficient testnet tokens for the devnet (arctic-1).
</Callout>

## Conclusion

You now have a **CosmWasm-based** React DApp that queries and executes a contract on Sei. If you want to use EVM wallets but still talk to CosmWasm contracts, check out [Building a Frontend (EVM)](./building-a-frontend-evm.md). 
