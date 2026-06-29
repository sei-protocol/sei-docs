---
name: sei-payments
description: >
  Use when "accept USDC on Sei", "send USDC payment", "USDC contract address on Sei", "charge per API request", "HTTP 402 micropayments", "x402 on Sei", "monetize my API with crypto", "pay-per-call agent payments", "add a paywall to my endpoint", "stablecoin transfer on Sei". Covers accepting and sending payments on Sei with USDC (ERC-20) and x402 HTTP-native micropayments.
license: MIT
compatibility: Node.js 18+; viem or ethers
metadata:
  author: Sei
  version: 1.0.0
  intended-host: docs.sei.io
  domain: payments
---

# Sei payments

This skill makes an agent good at moving and accepting digital dollars on Sei: transferring USDC as a standard ERC-20 token, and gating HTTP endpoints behind per-request payments with the x402 protocol so APIs, agents, and content can charge in stablecoins. USDC is the unit of account for both flows — x402 settles in USDC on Sei.

## Critical facts

- **USDC is a standard ERC-20 on Sei EVM.** Transfer it with `transfer(to, amount)`, read balances with `balanceOf(account)`. No special precompile or bridge call is needed for plain transfers.
- **USDC has 6 decimals** (not 18). `1 USDC = 1_000_000` base units. Always convert with `parseUnits(value, 6)` / `formatUnits(value, 6)` — using 18 will overpay by 10^12x.
- **USDC token addresses** (verify on Seiscan before sending real value):
  - Mainnet (pacific-1, chain id 1329): `0xe15fC38F6D8c56aF07bbCBe3BAf5708A2Bf42392`
  - Testnet (atlantic-2, chain id 1328): `0x4fCF1784B31630811181f670Aea7A7bEF803eaED`
- **Get testnet USDC** from the [Circle Faucet](https://faucet.circle.com), or bridge real USDC cross-chain with [Circle CCTP v2](https://github.com/circlefin/circle-cctp-crosschain-transfer). You still need a little native SEI to pay transaction fees.
- **Sei runs ~400ms blocks with fast finality, which makes micropayments practical.** A payment confirms in roughly a block — confirm with one confirmation (`tx.wait(1)` or one block of polling), never `tx.wait(12)`. There are no `safe`/`finalized` block tags on Sei; query `latest`.
- **Use legacy `gasPrice`** for payment transactions. Sei has no EIP-1559 base-fee burn — set a single `gasPrice` rather than `maxFeePerGas`/`maxPriorityFeePerGas` (all fees go to validators). The minimum gas price is governance-adjustable; check the live value at https://docs.sei.io/evm/differences-with-ethereum.
- **x402 uses HTTP 402 ("Payment Required").** The server answers an unpaid request with `402` plus a JSON payment challenge; the client pays on-chain, then retries with proof in an `X-Payment` header (base64-encoded JSON). The challenge `x402Version` is `1` and the scheme is `exact`.
- **EVM tooling works as-is.** Use viem or ethers with the Sei EVM RPCs — mainnet `https://evm-rpc.sei-apis.com`, testnet `https://evm-rpc-testnet.sei-apis.com`.

## Default stack

- **Language/runtime:** Node.js 18+ with `"type": "module"` (ES module imports), TypeScript optional.
- **Chain library:** `viem` (used throughout the Sei docs examples) or `ethers`.
- **x402 packages (`@sei-js`):** pick by role —
  - Client (paying): [`@sei-js/x402-fetch`](https://www.npmjs.com/package/@sei-js/x402-fetch) (fetch wrapper) or [`@sei-js/x402-axios`](https://www.npmjs.com/package/@sei-js/x402-axios) (axios interceptors).
  - Server (charging): [`@sei-js/x402-express`](https://www.npmjs.com/package/@sei-js/x402-express), [`@sei-js/x402-hono`](https://www.npmjs.com/package/@sei-js/x402-hono), or [`@sei-js/x402-next`](https://www.npmjs.com/package/@sei-js/x402-next).
  - Core protocol: [`@sei-js/x402`](https://www.npmjs.com/package/@sei-js/x402).
- **Settlement asset:** USDC (6 decimals). Quote prices in whole USDC, convert to base units at the edge.
- **Secrets:** keep `PRIVATE_KEY` in `.env`; never commit it.

## Send / accept USDC (viem)

Minimal ERC-20 flow — check balance, then transfer. Network is selected by env (`SEI_NETWORK=testnet|mainnet`, defaulting to testnet). This is plain ESM JavaScript (`index.js`), so it avoids TypeScript-only syntax — run it directly with `node index.js`.

```js
import 'dotenv/config';
import { createPublicClient, createWalletClient, http, formatUnits, parseUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

const seiTestnet = {
  id: 1328,
  name: 'Sei Atlantic-2 Testnet',
  network: 'sei-atlantic-2',
  nativeCurrency: { name: 'Sei', symbol: 'SEI', decimals: 18 },
  rpcUrls: { default: { http: ['https://evm-rpc-testnet.sei-apis.com'] } },
  blockExplorers: { default: { url: 'https://testnet.seiscan.io' } },
  testnet: true,
};
const seiMainnet = {
  id: 1329,
  name: 'Sei Mainnet (pacific-1)',
  network: 'sei-pacific-1',
  nativeCurrency: { name: 'Sei', symbol: 'SEI', decimals: 18 },
  rpcUrls: { default: { http: ['https://evm-rpc.sei-apis.com'] } },
  blockExplorers: { default: { url: 'https://seiscan.io' } },
  testnet: false,
};

const NETWORK = (process.env.SEI_NETWORK || 'testnet').toLowerCase();
const chain = NETWORK === 'mainnet' ? seiMainnet : seiTestnet;

// USDC: 6 decimals. Verify addresses on Seiscan before mainnet use.
const USDC_ADDRESS =
  NETWORK === 'mainnet'
    ? '0xe15fC38F6D8c56aF07bbCBe3BAf5708A2Bf42392'
    : '0x4fCF1784B31630811181f670Aea7A7bEF803eaED';
const USDC_DECIMALS = 6;
const USDC_ABI = [
  { name: 'balanceOf', type: 'function', stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }], outputs: [{ name: '', type: 'uint256' }] },
  { name: 'transfer', type: 'function', stateMutability: 'nonpayable',
    inputs: [{ name: 'to', type: 'address' }, { name: 'amount', type: 'uint256' }],
    outputs: [{ name: '', type: 'bool' }] },
];

// Validate inputs (matches the style of evm/usdc-on-sei.mdx).
const PRIVATE_KEY_RAW = process.env.PRIVATE_KEY;
const RECIPIENT = process.env.RECIPIENT_ADDRESS;
if (!PRIVATE_KEY_RAW) {
  console.error('Error: set PRIVATE_KEY in your .env file');
  process.exit(1);
}
if (!RECIPIENT || !/^0x[a-fA-F0-9]{40}$/.test(RECIPIENT)) {
  console.error('Error: set a valid RECIPIENT_ADDRESS in your .env file');
  process.exit(1);
}
const PRIVATE_KEY = PRIVATE_KEY_RAW.startsWith('0x') ? PRIVATE_KEY_RAW : `0x${PRIVATE_KEY_RAW}`;

const account = privateKeyToAccount(PRIVATE_KEY);
const publicClient = createPublicClient({ chain, transport: http() });
const walletClient = createWalletClient({ account, chain, transport: http() });

const balance = await publicClient.readContract({
  address: USDC_ADDRESS, abi: USDC_ABI, functionName: 'balanceOf', args: [account.address],
});
console.log('USDC balance:', formatUnits(balance, USDC_DECIMALS));

const amount = parseUnits('10', USDC_DECIMALS); // 10 USDC
if (balance < amount) throw new Error('Insufficient USDC balance');

const hash = await walletClient.writeContract({
  address: USDC_ADDRESS, abi: USDC_ABI, functionName: 'transfer', args: [RECIPIENT, amount],
});
await publicClient.waitForTransactionReceipt({ hash }); // one confirmation is enough on Sei
console.log('Sent. Explorer:', `${chain.blockExplorers.default.url}/tx/${hash}`);
```

```shell
npm init -y
npm install viem dotenv
# package.json: add "type": "module" for ESM import syntax
# .env: PRIVATE_KEY=0x...  RECIPIENT_ADDRESS=0x...  SEI_NETWORK=testnet
node index.js                     # testnet (default)
SEI_NETWORK=mainnet node index.js # mainnet
```

## Charge per request with x402

The x402 flow has five steps: (1) client requests a protected resource; (2) server returns `402` with a payment challenge; (3) client pays on-chain (a USDC transfer to `payTo`); (4) client retries with a base64 `X-Payment` proof; (5) server verifies the payment on-chain and serves the resource.

The challenge advertised on a `402` response (one entry per accepted payment option):

```json
{
  "x402Version": 1,
  "accepts": [
    {
      "scheme": "exact",
      "network": "sei-testnet",
      "maxAmountRequired": "1000",
      "resource": "/api/weather",
      "description": "Get current weather data",
      "mimeType": "application/json",
      "payTo": "0x9dC2aA0038830c052253161B1EE49B9dD449bD66",
      "maxTimeoutSeconds": 300,
      "asset": "0x4fCF1784B31630811181f670Aea7A7bEF803eaED",
      "extra": { "name": "USDC", "version": "2", "reference": "sei-1234567890-abc123" }
    }
  ]
}
```

`maxAmountRequired` is in USDC base units — `"1000"` is `0.001` USDC (`parseUnits('0.001', 6)`). The `reference` is a unique per-challenge nonce used to prevent replay. Note that `extra.version` is the USDC contract's **EIP-712 domain version** (used for permit/signed transfers of the token) — it is the token's domain version, not the x402 protocol version. The protocol version is the top-level `x402Version` (`1`); do not conflate the two.

Server side, in a Next.js route handler — return `402` until a valid proof arrives:

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const paymentHeader = req.headers.get('x-payment');

  if (!paymentHeader) {
    // No payment yet: advertise requirements.
    return NextResponse.json(generatePaymentChallenge(), { status: 402 });
  }

  const verification = await verifyPayment(paymentHeader);
  if (!verification.isValid) {
    const challenge = generatePaymentChallenge();
    (challenge as any).error = verification.reason ?? 'Payment verification failed';
    return NextResponse.json(challenge, { status: 402 });
  }

  // Paid: serve the resource.
  return NextResponse.json({ location: 'Sei Network', temperature: '99°F', payment: verification });
}
```

Verification checks the challenge fields and confirms the on-chain transaction succeeded:

```typescript
async function verifyPayment(paymentHeader: string) {
  const data = JSON.parse(Buffer.from(paymentHeader, 'base64').toString());
  const { x402Version, scheme, network, payload } = data;

  if (x402Version !== 1 || scheme !== 'exact' || network !== 'sei-testnet') {
    return { isValid: false, reason: 'Invalid payment format or network' };
  }

  const receipt = await publicClient.getTransactionReceipt({
    hash: payload.txHash as `0x${string}`,
  });
  // Also confirm recipient, amount, and that the reference has not been used before.
  return { isValid: receipt?.status === 'success', txHash: payload.txHash };
}
```

Client side, the proof is base64-encoded JSON sent back in `X-Payment`:

```typescript
const paymentProof = {
  x402Version: 1,
  scheme: 'exact',
  network: 'sei-testnet',
  payload: { txHash, amount: parseUnits('0.001', 6).toString(), from: senderAddress },
};

const res = await fetch(`${baseUrl}/api/weather`, {
  headers: { 'X-Payment': Buffer.from(JSON.stringify(paymentProof)).toString('base64') },
});
```

For production, prefer the `@sei-js/x402-*` middleware (Express/Hono/Next) and client wrappers over hand-rolling challenge/verify logic. See the [sei-x402 repo](https://github.com/sei-protocol/sei-x402) and its quickstarts for sellers and buyers.

## Common pitfalls

- **Treating USDC as 18 decimals.** USDC is 6 decimals on Sei. `parseUnits('10', 6)` not `parseEther('10')`. A single wrong constant multiplies the amount by 10^12.
- **Waiting for 12 confirmations.** Sei runs ~400ms blocks with fast finality. Use a single confirmation (`waitForTransactionReceipt` / `tx.wait(1)`); waiting 12 blocks adds pointless latency that defeats the point of micropayments.
- **Querying `safe` or `finalized` block tags.** Those tags do not exist on Sei. Read state at `latest`.
- **Sending EIP-1559 fee fields.** Use legacy `gasPrice`; there is no base-fee burn on Sei (all fees go to validators). The minimum gas price is governance-adjustable — link to https://docs.sei.io/evm/differences-with-ethereum rather than hardcoding a number.
- **Mixing TypeScript syntax into a `.js` file.** Plain `node index.js` cannot parse `as const`, the `!` non-null assertion, or `as` casts. Either keep the script as valid ESM JavaScript (as above) or rename it `index.ts` and run it with a TS runner like `npx tsx index.ts`.
- **Forgetting native SEI for fees.** A USDC transfer still costs transaction fees paid in native SEI. A wallet with USDC but zero SEI cannot pay.
- **Trusting `txHash` alone in x402.** Verify the receipt status, the recipient (`payTo`), the exact amount, AND that the `reference` nonce has not been seen before — otherwise the same valid payment can be replayed against your endpoint. Cache verified payments to prevent double-spend.
- **Confusing the two version fields in x402.** `x402Version` is the protocol version (`1`); `extra.version` is the USDC contract's EIP-712 domain version (`"2"`). They are unrelated.
- **Using testnet addresses on mainnet (or vice versa).** The USDC address differs per network; the wrong one points at a different/nonexistent token. Re-verify against Seiscan before moving real value.
- **Skipping address association assumptions.** Plain ERC-20 USDC transfers between `0x...` addresses need no association. Only if a flow crosses into Cosmos-side modules do the user's `sei1...` and `0x...` addresses need linking — see https://docs.sei.io/learn/accounts.
- **Assuming USDC is bridgeable for free.** To get USDC onto Sei from another chain, use Circle CCTP v2 (or the Circle Faucet on testnet); do not invent a bridge contract.

## Key docs

| Topic | Link |
| --- | --- |
| USDC on Sei (addresses, transfer guide) | https://docs.sei.io/evm/usdc-on-sei |
| x402 protocol on Sei | https://docs.sei.io/ai/x402 |
| sei-x402 repo (packages, quickstarts) | https://github.com/sei-protocol/sei-x402 |
| Accounts & dual-address association | https://docs.sei.io/learn/accounts |
| Circle developer docs / USDC | https://developers.circle.com |
| Circle testnet faucet | https://faucet.circle.com |
