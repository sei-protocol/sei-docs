---
# GENERATED FROM sei-protocol/sei-skill@e2445c8 — DO NOT EDIT BY HAND.
# Edit the source in sei-skill, then regenerate via scripts/build-mintlify-skills.mjs
# (see .github/workflows/sync-skills.yml).
name: sei-payments
description: >
  Use when "accept USDC on Sei", "send USDC payment", "USDC contract address on Sei",
  "charge per API request", "HTTP 402 micropayments", "x402 on Sei", "monetize my API
  with crypto", "pay-per-call agent payments", "add a paywall to my endpoint",
  "stablecoin transfer on Sei". Covers accepting and sending payments on Sei with USDC
  (ERC-20, 6 decimals) and x402 v2 HTTP-native micropayments — token addresses, the
  transfer flow, and the upstream @x402 seller middleware and buyer clients.
license: MIT
compatibility: Node.js 18+; viem or ethers
metadata:
  author: Sei
  version: 1.2.0
  intended-host: docs.sei.io
  domain: payments
---

# Sei payments

This skill makes an agent good at moving and accepting digital dollars on Sei: transferring USDC as a standard ERC-20 token, and gating HTTP endpoints behind per-request payments with the x402 protocol so APIs, agents, and content can charge in stablecoins. USDC is the unit of account for both flows — x402 settles in USDC on Sei.

## Critical facts

- **USDC is a standard ERC-20 on Sei EVM.** Transfer it with `transfer(to, amount)`, read balances with `balanceOf(account)`. No special precompile or bridge call is needed for plain transfers.
- **USDC has 6 decimals** (not 18). `1 USDC = 1_000_000` base units. Always convert with `parseUnits(value, 6)` / `formatUnits(value, 6)` — using 18 overpays by 10^12x.
- **USDC token addresses** (verify on [Seiscan](https://seiscan.io) before sending real value):
  - Sei Mainnet (chain ID 1329): `0xe15fC38F6D8c56aF07bbCBe3BAf5708A2Bf42392`
  - Sei Testnet (chain ID 1328): `0x4fCF1784B31630811181f670Aea7A7bEF803eaED`
- **Get Sei Testnet USDC** from the [Circle Faucet](https://faucet.circle.com), or bridge real USDC cross-chain with [Circle CCTP v2](https://developers.circle.com/cctp). You still need a little native SEI to pay transaction fees.
- **~400ms blocks with fast finality make micropayments practical.** A payment confirms in roughly a block — wait for one confirmation (`tx.wait(1)` or one block of polling), never `tx.wait(12)`. On Sei `safe`/`finalized`/`latest` all resolve to the same instantly-final block; query `latest`.
- **Use legacy `gasPrice`** for payment transactions. Sei has no EIP-1559 base-fee burn — all fees go to validators. The minimum gas price is governance-adjustable, so query `eth_gasPrice` for the live floor. See https://docs.sei.io/evm/differences-with-ethereum.
- **x402 v2 uses HTTP 402 ("Payment Required").** The server answers an unpaid request with `402` and a `PAYMENT-REQUIRED` header; the client signs a payment authorization and retries with it in `PAYMENT-SIGNATURE`; the server verifies and settles, then returns the resource with a `PAYMENT-RESPONSE` header. Header values are Base64-encoded JSON that the SDK encodes and decodes.
- **x402 identifies Sei by CAIP-2 network ID**: `eip155:1329` (Sei Mainnet) and `eip155:1328` (Sei Testnet). Native USDC is in x402's default asset registry for both, so a route price like `"$0.001"` resolves to USDC on the selected network.
- **With the `exact` EVM scheme the buyer sends no transaction.** USDC on Sei supports EIP-3009: the buyer signs a transfer authorization, and a facilitator verifies it, submits the transfer, and pays the gas. The facilitator must support the Sei network you target.

## Default stack

- **Language/runtime:** Node.js 18+ with `"type": "module"` (ES module imports), TypeScript optional.
- **Chain library:** `viem` ships definitions for Sei Mainnet and Sei Testnet (`sei`, `seiTestnet` in `viem/chains`), so no hand-rolled RPC config is needed.
- **x402 packages (upstream v2, `@x402` scope):** `@x402/core` and `@x402/evm`, plus one adapter per role rather than hand-rolling verification —
  - Client (paying): `@x402/fetch` (fetch wrapper) or `@x402/axios` (axios interceptors), with `viem` for the signer.
  - Server (charging): `@x402/express`, `@x402/hono`, or `@x402/next`.
  - The `@sei-js/x402*` packages are deprecated v1 implementations; do not use them.
- **Settlement asset:** USDC (6 decimals). Quote prices in whole USDC, convert to base units at the edge.
- **Secrets:** pass `PRIVATE_KEY` via the environment; never commit it.

## Send / accept USDC (viem)

Minimal ERC-20 flow — check balance, then transfer. Network is selected by env (`SEI_NETWORK=testnet|mainnet`), defaulting to Sei Testnet (1328); switch to Sei Mainnet (1329) only on explicit confirmation. Plain ESM JavaScript (`index.js`) — run it directly with `node index.js`.

```js
import { createPublicClient, createWalletClient, http, formatUnits, parseUnits } from 'viem';
import { sei, seiTestnet } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

const NETWORK = (process.env.SEI_NETWORK || 'testnet').toLowerCase();
const chain = NETWORK === 'mainnet' ? sei : seiTestnet;

// USDC: 6 decimals. Verify addresses on Seiscan before mainnet use.
const USDC_ADDRESS = NETWORK === 'mainnet'
  ? '0xe15fC38F6D8c56aF07bbCBe3BAf5708A2Bf42392'
  : '0x4fCF1784B31630811181f670Aea7A7bEF803eaED';
const USDC_DECIMALS = 6;
const USDC_ABI = [
  { name: 'balanceOf', type: 'function', stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { name: 'transfer', type: 'function', stateMutability: 'nonpayable',
    inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }],
    outputs: [{ type: 'bool' }] },
];

if (!process.env.PRIVATE_KEY || !process.env.RECIPIENT_ADDRESS) {
  throw new Error('Set PRIVATE_KEY and RECIPIENT_ADDRESS in the environment');
}

const account = privateKeyToAccount(process.env.PRIVATE_KEY);
const publicClient = createPublicClient({ chain, transport: http() });
const walletClient = createWalletClient({ account, chain, transport: http() });

const balance = await publicClient.readContract({
  address: USDC_ADDRESS, abi: USDC_ABI, functionName: 'balanceOf', args: [account.address],
});
console.log('USDC balance:', formatUnits(balance, USDC_DECIMALS));

const amount = parseUnits('10', USDC_DECIMALS); // 10 USDC
if (balance < amount) throw new Error('Insufficient USDC balance');

const hash = await walletClient.writeContract({
  address: USDC_ADDRESS, abi: USDC_ABI, functionName: 'transfer', args: [process.env.RECIPIENT_ADDRESS, amount],
});
const receipt = await publicClient.waitForTransactionReceipt({ hash }); // one confirmation is enough on Sei
// viem doesn't throw on a revert — it returns status 'reverted'
if (receipt.status !== 'success') throw new Error(`Transfer reverted: ${hash}`);
console.log('Sent:', hash);
```

```shell
npm init -y && npm install viem
# package.json: add "type": "module" for ESM import syntax
PRIVATE_KEY=0x... RECIPIENT_ADDRESS=0x... node index.js                     # testnet (default)
SEI_NETWORK=mainnet PRIVATE_KEY=0x... RECIPIENT_ADDRESS=0x... node index.js # mainnet
```

## Charge per request with x402

x402 v2 has three roles: the **client** signs a payment authorization, the **resource server** sets the price and serves the resource, and a **facilitator** verifies the authorization, submits the transfer on-chain, and reports the settlement. The flow: (1) the client requests the resource; (2) the server returns `402` with `PAYMENT-REQUIRED`; (3) the client signs an accepted payment option; (4) it retries with `PAYMENT-SIGNATURE`; (5) the server verifies and settles, then returns the resource with `PAYMENT-RESPONSE`. Use the `exact` scheme for a fixed price per request.

```bash
# Server: core + EVM scheme + your framework's adapter (@x402/express, @x402/hono, or @x402/next)
npm install express @x402/core @x402/evm @x402/express
# Client: core + EVM scheme + @x402/fetch (or @x402/axios), with viem for the signer
npm install @x402/core @x402/evm @x402/fetch viem
```

Server side — charge `0.001` USDC for `GET /weather` on Sei Testnet. Set `X402_FACILITATOR_URL` to a facilitator that supports `eip155:1328`:

```typescript
import express from "express";
import { HTTPFacilitatorClient } from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";

const facilitatorUrl = process.env.X402_FACILITATOR_URL;
const payTo = process.env.PAY_TO_ADDRESS as `0x${string}` | undefined;

if (!facilitatorUrl || !payTo) {
  throw new Error("Set X402_FACILITATOR_URL and PAY_TO_ADDRESS");
}

const app = express();
const network = "eip155:1328";
const facilitator = new HTTPFacilitatorClient({ url: facilitatorUrl });
const resourceServer = new x402ResourceServer(facilitator).register(
  network,
  new ExactEvmScheme(),
);

app.use(
  paymentMiddleware(
    {
      "GET /weather": {
        accepts: [
          {
            scheme: "exact",
            price: "$0.001",
            network,
            payTo,
          },
        ],
        description: "Current weather data",
        mimeType: "application/json",
      },
    },
    resourceServer,
  ),
);

app.get("/weather", (_request, response) => {
  response.json({
    location: "Sei",
    conditions: "sunny",
  });
});

app.listen(4021);
```

The middleware sends the `402` response, verifies the payment, and settles it. The route handler runs only after verification, and the middleware releases its response only if settlement succeeds.

Client side — the Fetch adapter makes the request, reads the `402`, signs an accepted payment option, and retries with `PAYMENT-SIGNATURE`:

```typescript
import { x402Client } from "@x402/core/client";
import { ExactEvmScheme } from "@x402/evm/exact/client";
import { wrapFetchWithPayment } from "@x402/fetch";
import { privateKeyToAccount } from "viem/accounts";

const privateKey = process.env.EVM_PRIVATE_KEY as `0x${string}` | undefined;

if (!privateKey) {
  throw new Error("Set EVM_PRIVATE_KEY");
}

const signer = privateKeyToAccount(privateKey);
const client = new x402Client();
client.register("eip155:*", new ExactEvmScheme(signer));

const fetchWithPayment = wrapFetchWithPayment(fetch, client);
const response = await fetchWithPayment("https://api.example.com/weather");

if (!response.ok) {
  throw new Error(`Request failed with status ${response.status}`);
}

console.log(await response.json());
```

Before production:

- Serve over HTTPS so intermediaries can't read or replace payment headers.
- Keep buyer keys in a server-side secret store; never ship a private key in browser code.
- Confirm the facilitator supports `eip155:1329` (Sei Mainnet) or `eip155:1328` (Sei Testnet), or run your own.
- Test rejected signatures, expired authorizations, failed settlement, and insufficient balances.
- Fulfill a request only after x402 reports a valid payment.

For the current API, follow the upstream seller quickstart (https://docs.x402.org/getting-started/quickstart-for-sellers) and buyer quickstart (https://docs.x402.org/getting-started/quickstart-for-buyers).

## Common pitfalls

- **Treating USDC as 18 decimals.** It is 6 decimals — `parseUnits('10', 6)`, not `parseEther('10')`. A single wrong constant multiplies the amount by 10^12.
- **Waiting for 12 confirmations.** Sei finalizes in ~400ms — use a single confirmation (`waitForTransactionReceipt` / `tx.wait(1)`); waiting 12 blocks adds pointless latency that defeats the point of micropayments.
- **Expecting `safe`/`finalized` to differ from `latest`.** On Sei they all resolve to the same instantly-final block. Read state at `latest`.
- **Sending EIP-1559 fee fields.** Use legacy `gasPrice`; there is no base-fee burn on Sei (all fees go to validators). The floor is governance-adjustable — query `eth_gasPrice` rather than hardcoding a number.
- **Mixing TypeScript syntax into a `.js` file.** Plain `node index.js` cannot parse `as const`, the `!` non-null assertion, or `as` casts. Keep the script valid ESM JavaScript (as above) or rename it `index.ts` and run it with a TS runner like `npx tsx index.ts`.
- **Forgetting native SEI for fees.** A plain USDC transfer still costs transaction fees paid in native SEI, so a wallet with USDC but zero SEI cannot send one. (With x402's `exact` scheme the facilitator submits the transfer and pays the gas.)
- **Using the deprecated `@sei-js/x402*` packages.** They implement x402 v1 and are no longer maintained. Use `@x402/core`, `@x402/evm`, and the `@x402` adapter for your client or framework.
- **Porting x402 v1 code by renaming packages.** v2 also changes the headers (`X-PAYMENT` becomes `PAYMENT-SIGNATURE`, `X-PAYMENT-RESPONSE` becomes `PAYMENT-RESPONSE`), uses CAIP-2 IDs such as `eip155:1328` instead of names like `sei-testnet`, and sets `x402Version: 2`. Follow https://docs.x402.org/guides/migration-v1-to-v2.
- **Treating a transaction receipt as proof of payment.** Verification must bind the signed payload to the network, asset, amount, recipient, resource, and validity window. Use the x402 middleware with a compatible facilitator, or implement the full verification and settlement rules if you self-facilitate.
- **Assuming every facilitator supports Sei.** x402 can sign payments for any EVM network, but the facilitator must support `eip155:1329` or `eip155:1328`. Confirm before deploying, or run your own.
- **Using Sei Testnet addresses on Sei Mainnet (or the reverse).** The USDC address differs per network; the wrong one points at a different or nonexistent token. Re-verify on Seiscan before moving real value.
- **Assuming address association is needed.** Plain ERC-20 USDC transfers between `0x...` addresses need no association. Only if a flow crosses into Cosmos-side modules do the user's `sei1...` and `0x...` addresses need linking — see https://docs.sei.io/learn/accounts.
- **Inventing a bridge for USDC.** To get USDC onto Sei from another chain, use [Circle CCTP v2](https://developers.circle.com/cctp) (or the Circle Faucet on Sei Testnet); do not invent a bridge contract.

## Key docs

| Topic | Link |
| --- | --- |
| USDC on Sei (addresses, transfer guide) | https://docs.sei.io/evm/usdc-on-sei |
| x402 protocol on Sei | https://docs.sei.io/ai/x402 |
| EVM differences (gas pricing, finality) | https://docs.sei.io/evm/differences-with-ethereum |
| Accounts & dual-address association | https://docs.sei.io/learn/accounts |
| x402 v2 SDK and protocol (upstream) | https://docs.x402.org |
| x402 v1 to v2 migration | https://docs.x402.org/guides/migration-v1-to-v2 |
| Circle CCTP v2 (bridge USDC in) | https://developers.circle.com/cctp |
| Circle testnet faucet | https://faucet.circle.com |
