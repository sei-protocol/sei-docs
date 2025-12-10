---
title: 'Why are my JSON-RPC calls timing out?'
description: 'Why are my JSON-RPC calls timing out?'
---

# Why are my JSON-RPC calls timing out?

If your JSON-RPC calls to Sei Network are timing out, consider these common causes and solutions:

- **RPC Node Overload**:

Public RPCs may be experiencing high load

- Solution: Use alternative RPCs or run your own node

```
// Try with longer timeout
const provider = new ethers.providers.JsonRpcProvider(
"https://evm-rpc.sei.io",
{ timeout: 60000 } // 60 seconds instead of default
);

```

- **Network Congestion**:

During periods of high activity, requests may timeout

- Solution: Implement exponential backoff retry

```
async function callWithRetry(method, params, maxRetries = 5) {
let retries = 0;
while (retries try {
 return await provider.send(method, params);
 } catch (error) {
 if (!error.message.includes("timeout") || retries === maxRetries - 1) {
 throw error;
 }
 retries++;
 const delay = Math.min(Math.pow(2, retries) * 1000, 10000);
 console.log(`Retry ${retries} after ${delay}ms`);
 await new Promise(r => setTimeout(r, delay));
 }
}
}

```

- **Heavy Requests**:

Complex queries (like fetching large state data) may timeout

- Solution: Break into smaller requests ```javascript // Instead of fetching all events at once const events = await contract.queryFilter(filter, startBlock, endBlock);

// Break into smaller chunks async function getEventsInChunks(filter, startBlock, endBlock, chunkSize = 1000) { let allEvents = []; for (let i = startBlock; i const end = Math.min(i + chunkSize - 1, endBlock);
const events = await contract.queryFilter(filter, i, end);
allEvents = [...allEvents, ...events];

````

} return allEvents; } ```

-
**Client-Side Network Issues**:

Check your own network connectivity

- Solution: Test from different networks or use VPN

-
**RPC Method Support**:

Some methods may not be supported or implemented efficiently

- Solution: Check if method is supported or use alternatives
````

// Instead of eth_getLogs which can be heavy
// Use events from contract instance for more efficient queries
const contract = new ethers.Contract(address, abi, provider);
const filter = contract.filters.MyEvent();
const events = await contract.queryFilter(filter, startBlock, endBlock);

```

If timeouts persist, consider running a dedicated Sei node for reliable access.
```
