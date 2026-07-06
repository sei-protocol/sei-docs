---
name: sei-payments
description: >
  Use when "accept USDC on Sei", "send USDC payment", "USDC contract address on Sei",
  "charge per API request", "HTTP 402 micropayments", "x402 on Sei", "monetize my API
  with crypto", "pay-per-call agent payments", "add a paywall to my endpoint",
  "stablecoin transfer on Sei". Covers accepting and sending payments on Sei with USDC
  (ERC-20, 6 decimals) and x402 HTTP-native micropayments — token addresses, the
  transfer flow, the 402 challenge/verify cycle, and replay protection.
license: MIT
compatibility: Node.js 18+; viem or ethers
metadata:
  author: Sei
  version: 1.1.0
  intended-host: docs.sei.io
  domain: payments
---
<!-- GENERATED FROM sei-protocol/sei-skill@0ce5ace — DO NOT EDIT BY HAND.
     Edit the source in sei-skill, then regenerate via scripts/build-mintlify-skills.mjs (see .github/workflows/sync-skills.yml). -->

# Sei payments

This skill makes an agent good at moving and accepting digital dollars on Sei: transferring USDC as a standard ERC-20 token, and gating HTTP endpoints behind per-request payments with the x402 protocol so APIs, agents, and content can charge in stablecoins. USDC is the unit of account for both flows — x402 settles in USDC on Sei.

## Critical facts

- **USDC is a standard ERC-20 on Sei EVM.** Transfer it with `transfer(to, amount)`, read balances with `balanceOf(account)`. No special precompile or bridge call is needed for plain transfers.
- **USDC has 6 decimals** (not 18). `1 USDC = 1_000_000` base units. Always convert with `parseUnits(value, 6)` / `formatUnits(value, 6)` — using 18 overpays by 10^12x.
- **USDC token addresses** (verify on [Seiscan](https://seiscan.io) before sending real value):
  - Mainnet (pacific-1, chain id 1329): `0xe15fC38F6D8c56aF07bbCBe3BAf5708A2Bf42392`
  - Testnet (atlantic-2, chain id 1328): `0x4fCF1784B31630811181f670Aea7A7bEF803eaED`
- **Get testnet USDC** from the [Circle Faucet](https://faucet.circle.com), or bridge real USDC cross-chain with [Circle CCTP v2](https://developers.circle.com/cctp). You still need a little native SEI to pay transaction fees.
- **~400ms blocks with fast finality make micropayments practical.** A payment confirms in roughly a block — wait for one confirmation (`tx.wait(1)` or one block of polling), never `tx.wait(12)`. On Sei `safe`/`finalized`/`latest` all resolve to the same instantly-final block; query `latest`.
- **Use legacy `gasPrice`** for payment transactions. Sei has no EIP-1559 base-fee burn — all fees go to validators. The minimum gas price is governance-adjustable (currently ~50 gwei on mainnet — query `eth_gasPrice` for the live floor). See https://docs.sei.io/evm/differences-with-ethereum.
- **x402 uses HTTP 402 ("Payment Required").** The server answers an unpaid request with `402` plus a JSON payment challenge; the client pays on-chain, then retries with proof in a base64-encoded `X-Payment` header. The challenge `x402Version` is `1` and the scheme is `exact`.

## Default stack

- **Language/runtime:** Node.js 18+ with `"type": "module"` (ES module imports), TypeScript optional.
- **Chain library:** `viem` — it ships Sei chain definitions (`sei`, `seiTestnet` in `viem/chains`), so no hand-rolled RPC config is needed.
- **x402 packages (`@sei-js`):** pick by role rather than hand-rolling challenge/verify —
  - Client (paying): [`@sei-js/x402-fetch`](https://www.npmjs.com/package/@sei-js/x402-fetch) (fetch wrapper) or [`@sei-js/x402-axios`](https://www.npmjs.com/package/@sei-js/x402-axios) (axios interceptors).
  - Server (charging): [`@sei-js/x402-express`](https://www.npmjs.com/package/@sei-js/x402-express), [`@sei-js/x402-hono`](https://www.npmjs.com/package/@sei-js/x402-hono), or [`@sei-js/x402-next`](https://www.npmjs.com/package/@sei-js/x402-next).
  - Core protocol: [`@sei-js/x402`](https://www.npmjs.com/package/@sei-js/x402).
- **Settlement asset:** USDC (6 decimals). Quote prices in whole USDC, convert to base units at the edge.
- **Secrets:** pass `PRIVATE_KEY` via the environment; never commit it.

## Send / accept USDC (viem)

Minimal ERC-20 flow — check balance, then transfer. Network is selected by env (`SEI_NETWORK=testnet|mainnet`), defaulting to testnet (atlantic-2, 1328); switch to mainnet (pacific-1, 1329) only on explicit confirmation. Plain ESM JavaScript (`index.js`) — run it directly with `node index.js`.

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
await publicClient.waitForTransactionReceipt({ hash }); // one confirmation is enough on Sei
console.log('Sent:', hash);
```

```shell
npm init -y && npm install viem
# package.json: add "type": "module" for ESM import syntax
PRIVATE_KEY=0x... RECIPIENT_ADDRESS=0x... node index.js                     # testnet (default)
SEI_NETWORK=mainnet PRIVATE_KEY=0x... RECIPIENT_ADDRESS=0x... node index.js # mainnet
```

## Charge per request with x402

The x402 flow has five steps: (1) client requests a protected resource; (2) server returns `402` with a payment challenge; (3) client pays on-chain (a USDC transfer to `payTo`); (4) client retries with a base64 `X-Payment` proof; (5) server verifies the payment on-chain and serves the resource.

The challenge advertised on a `402` response (one entry per accepted payment option):

```json
{
  "x402Version": 1,
  "accepts": [{
    "scheme": "exact",
    "network": "sei-testnet",
    "maxAmountRequired": "1000",
    "resource": "/api/weather",
    "payTo": "0x9dC2aA0038830c052253161B1EE49B9dD449bD66",
    "asset": "0x4fCF1784B31630811181f670Aea7A7bEF803eaED",
    "extra": { "name": "USDC", "version": "2", "reference": "sei-1234567890-abc123" }
  }]
}
```

`maxAmountRequired` is in USDC base units — `"1000"` is `0.001` USDC (`parseUnits('0.001', 6)`). The `reference` is a unique per-challenge nonce used to prevent replay. Note that `extra.version` (`"2"`) is the USDC contract's **EIP-712 domain version** (used for permit/signed transfers of the token), *not* the x402 protocol version — that is the top-level `x402Version` (`1`). Do not conflate the two.

Server side — return `402` until a valid proof arrives (Next.js route handler shown; Express/Hono are analogous):

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const paymentHeader = req.headers.get('x-payment');
  if (!paymentHeader) {
    return NextResponse.json(generatePaymentChallenge(), { status: 402 });
  }
  const verification = await verifyPayment(paymentHeader);
  if (!verification.isValid) {
    return NextResponse.json({ ...generatePaymentChallenge(), error: verification.reason }, { status: 402 });
  }
  return NextResponse.json({ location: 'Sei Network', temperature: '99°F' }); // paid: serve the resource
}
```

Verification must check the receipt status, the recipient, the exact amount, **and** that the reference nonce has not been seen before:

```typescript
async function verifyPayment(paymentHeader: string) {
  const data = JSON.parse(Buffer.from(paymentHeader, 'base64').toString());
  const { x402Version, scheme, network, payload } = data;
  if (x402Version !== 1 || scheme !== 'exact' || network !== 'sei-testnet') {
    return { isValid: false, reason: 'Invalid payment format or network' };
  }

  const receipt = await publicClient.getTransactionReceipt({ hash: payload.txHash });
  if (receipt?.status !== 'success') {
    return { isValid: false, reason: 'Transaction not found or reverted' };
  }

  // REQUIRED for a non-replayable paywall — do NOT ship without these.
  // transferMatches decodes the USDC Transfer event from receipt.logs and confirms
  // to === payTo and value >= maxAmountRequired; the reference helpers persist seen
  // nonces so one valid payment can't be replayed. (The @sei-js/x402-* middleware does this.)
  if (!transferMatches(receipt, payTo, maxAmountRequired) || !isReferenceUnused(payload.reference)) {
    return { isValid: false, reason: 'Payment does not match challenge or was already used' };
  }
  markReferenceUsed(payload.reference);
  return { isValid: true, txHash: payload.txHash };
}
```

Client side, after paying on-chain, the proof echoes the challenge's `reference` and goes back base64-encoded in `X-Payment`:

```typescript
const proof = {
  x402Version: 1,
  scheme: 'exact',
  network: 'sei-testnet',
  payload: { txHash, reference: challenge.accepts[0].extra.reference },
};
const res = await fetch(`${baseUrl}/api/weather`, {
  headers: { 'X-Payment': Buffer.from(JSON.stringify(proof)).toString('base64') },
});
```

For production, prefer the `@sei-js/x402-*` middleware (Express/Hono/Next) and client wrappers over hand-rolling challenge/verify logic. See the [sei-x402 repo](https://github.com/sei-protocol/sei-x402) and its quickstarts for sellers and buyers.

## Common pitfalls

- **Treating USDC as 18 decimals.** It is 6 decimals — `parseUnits('10', 6)`, not `parseEther('10')`. A single wrong constant multiplies the amount by 10^12.
- **Waiting for 12 confirmations.** Sei finalizes in ~400ms — use a single confirmation (`waitForTransactionReceipt` / `tx.wait(1)`); waiting 12 blocks adds pointless latency that defeats the point of micropayments.
- **Expecting `safe`/`finalized` to differ from `latest`.** On Sei they all resolve to the same instantly-final block. Read state at `latest`.
- **Sending EIP-1559 fee fields.** Use legacy `gasPrice`; there is no base-fee burn on Sei (all fees go to validators). The floor is governance-adjustable — query `eth_gasPrice` rather than hardcoding a number.
- **Mixing TypeScript syntax into a `.js` file.** Plain `node index.js` cannot parse `as const`, the `!` non-null assertion, or `as` casts. Keep the script valid ESM JavaScript (as above) or rename it `index.ts` and run it with a TS runner like `npx tsx index.ts`.
- **Forgetting native SEI for fees.** A USDC transfer still costs transaction fees paid in native SEI. A wallet with USDC but zero SEI cannot pay.
- **Trusting `txHash` alone in x402.** Verify the receipt status, the recipient (`payTo`), the exact amount, AND that the `reference` nonce has not been seen before — otherwise the same valid payment can be replayed against your endpoint.
- **Confusing the two version fields in x402.** `x402Version` is the protocol version (`1`); `extra.version` is the USDC contract's EIP-712 domain version (`"2"`). They are unrelated.
- **Using testnet addresses on mainnet (or vice versa).** The USDC address differs per network; the wrong one points at a different or nonexistent token. Re-verify on Seiscan before moving real value.
- **Assuming address association is needed.** Plain ERC-20 USDC transfers between `0x...` addresses need no association. Only if a flow crosses into Cosmos-side modules do the user's `sei1...` and `0x...` addresses need linking — see https://docs.sei.io/learn/accounts.
- **Inventing a bridge for USDC.** To get USDC onto Sei from another chain, use [Circle CCTP v2](https://developers.circle.com/cctp) (or the Circle Faucet on testnet); do not invent a bridge contract.

## Key docs

| Topic | Link |
| --- | --- |
| USDC on Sei (addresses, transfer guide) | https://docs.sei.io/evm/usdc-on-sei |
| x402 protocol on Sei | https://docs.sei.io/ai/x402 |
| EVM differences (gas pricing, finality) | https://docs.sei.io/evm/differences-with-ethereum |
| Accounts & dual-address association | https://docs.sei.io/learn/accounts |
| sei-x402 repo (packages, quickstarts) | https://github.com/sei-protocol/sei-x402 |
| Circle CCTP v2 (bridge USDC in) | https://developers.circle.com/cctp |
| Circle testnet faucet | https://faucet.circle.com |
