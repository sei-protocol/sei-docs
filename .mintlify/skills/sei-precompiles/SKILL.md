---
name: sei-precompiles
description: >
  Use when "call the Sei staking precompile", "delegate SEI from a contract", "vote on a Sei governance proposal in Solidity", "claim staking rewards via distribution precompile", "read a native denom balance with the bank precompile", "parse JSON on-chain on Sei", "verify a passkey/WebAuthn P256 signature on Sei", "associate my sei1 and 0x addresses", "look up an ERC20 pointer for a CW20/native token", "@sei-js/precompiles addresses and ABIs". Covers calling Sei's native precompiles (Bank, Staking, Governance, Distribution, Oracle, JSON, P256, Addr, IBC, Pointer/PointerView) from Solidity and viem/ethers.
license: MIT
compatibility: Requires @sei-js/precompiles; Solidity 0.8.x or viem/wagmi
metadata:
  author: Sei
  version: 1.0.0
  intended-host: docs.sei.io
  domain: precompiles
---

# Sei precompiles

This skill makes the agent precise at calling Sei's native precompiles — fixed-address contracts deployed by the protocol that expose Cosmos-layer functionality (staking, governance, distribution, bank, address association, IBC, cross-VM pointers) plus JSON parsing and P-256 verification to the EVM. Precompiles behave like ordinary contracts from Solidity/viem/ethers, but they execute privileged native logic. Use `@sei-js/precompiles` for the addresses and ABIs, and `viem/chains` for the `sei` / `seiTestnet` chain configs.

## Critical facts

- **Addresses are fixed** (40-hex, left-padded). Bank `0x...1001` · JSON `0x...1003` · Addr `0x...1004` · Staking `0x...1005` · Governance `0x...1006` · Distribution `0x...1007` · Oracle `0x...1008` · IBC `0x...1009` · PointerView `0x...100A` · Pointer `0x...100B` · P256 `0x...1011`. Get them from `@sei-js/precompiles` rather than hardcoding.
- **Precompiles only exist on Sei.** A plain local EVM (Hardhat node, `forge test` without a fork) has nothing at these addresses, so calls revert. Test against a fork: Foundry `--fork-url https://evm-rpc.sei-apis.com`, or Hardhat `forking`.
- **Staking decimal asymmetry (the #1 footgun).** `delegate()` reads `msg.value` in 18-decimal wei; `undelegate()` / `redelegate()` take the amount in 6-decimal usei (`1 SEI = 1_000_000 usei`). `delegate()`'s `msg.value` is truncated to 6 decimals, so send a multiple of `1e12` wei. `createValidator()` also takes `msg.value` in wei. Match each signature exactly.
- **Mixed precision in reads.** Staking `delegation().balance.amount` is 6-decimal usei while `.delegation.shares` is 18-decimal (`.delegation.decimals` always returns `18`, referring to shares). Distribution `rewards()` returns 18-decimal `DecCoins`; the amounts actually withdrawn (and in events) are 6-decimal usei — a `1e12` gap when reconciling.
- **The native Oracle precompile (`0x...1008`) is deprecated** and will be shut off soon. For new price feeds use a third-party oracle (Chainlink, Pyth, Redstone, API3) — see https://docs.sei.io/evm/oracles. Do not build new code on the Oracle precompile.
- **Governance voting power = staked SEI only.** Liquid (unstaked) SEI gives zero voting power. Mainnet proposal deposit is 3,500 SEI (7,000 expedited); deposits are burned if a proposal gets >33.4% NoWithVeto. Vote options: `1`=Yes, `2`=Abstain, `3`=No, `4`=NoWithVeto. `voteWeighted` weights are decimal strings that must sum to exactly `"1.0"`.
- **Dual-address accounts.** Every key has a `sei1...` (bech32) and a `0x...` (EVM) address. They are linked only after *association*; the Addr precompile (`0x...1004`) queries/creates the mapping, and association happens automatically on the account's first on-chain transaction. Validator addresses use the `seivaloper1...` prefix.
- **Fast finality + legacy fees.** Block time is ~400ms with fast/instant finality — use `tx.wait(1)`, never `tx.wait(12)`. The `safe`/`finalized`/`latest` commitment levels all resolve to the same instantly-final block on Sei, so just query `latest`. Send transactions with a legacy `gasPrice` (Sei has no EIP-1559 base-fee burn).
- **Storage gas differs from Ethereum.** Writing storage (SSTORE) costs 72,000 gas on Sei — far above Ethereum's 20,000, and the same on mainnet and testnet (set by governance [Proposal #109](https://www.mintscan.io/sei/proposals/109)). It is a governance-adjustable on-chain parameter, so don't hardcode it forever. Block gas limit and minimum gas price are likewise governance-adjustable. Check the live values at https://docs.sei.io/evm/differences-with-ethereum#sstore-gas-cost.

## Setup

```bash
npm install @sei-js/precompiles viem ethers
```

```ts
// Addresses + ABIs come from @sei-js/precompiles; viem chains from viem/chains.
import {
  BANK_PRECOMPILE_ADDRESS, BANK_PRECOMPILE_ABI,
  STAKING_PRECOMPILE_ADDRESS, STAKING_PRECOMPILE_ABI,
  GOVERNANCE_PRECOMPILE_ADDRESS, GOVERNANCE_PRECOMPILE_ABI,
  DISTRIBUTION_PRECOMPILE_ADDRESS, DISTRIBUTION_PRECOMPILE_ABI,
  JSON_PRECOMPILE_ADDRESS, JSON_PRECOMPILE_ABI,
  ADDRESS_PRECOMPILE_ADDRESS, ADDRESS_PRECOMPILE_ABI,
} from '@sei-js/precompiles';
import { sei, seiTestnet } from 'viem/chains'; // viem chain configs
```

## Default stack

- **TypeScript:** viem or ethers v6 + `@sei-js/precompiles` for addresses/ABIs. Import the `sei` (pacific-1, chainId 1329) / `seiTestnet` (atlantic-2, chainId 1328) chain configs from `viem/chains`.
- **Solidity:** declare a minimal `interface` for the precompile you call and cast the fixed address to it (shown below). Solidity 0.8.x.
- **Testing:** Foundry with `--fork-url`, or Hardhat with network forking, so the precompile addresses are populated.
- **Scaffold:** `npx @sei-js/create-sei app --name <name>`.

## Reading state (Bank, viem)

`eth_getBalance` only returns the EVM-side SEI balance. Use the Bank precompile to read any native denom (including factory and IBC tokens) for any address.

```ts
import { createPublicClient, http } from 'viem';
import { sei } from 'viem/chains';
import { BANK_PRECOMPILE_ADDRESS, BANK_PRECOMPILE_ABI } from '@sei-js/precompiles';

const client = createPublicClient({ chain: sei, transport: http('https://evm-rpc.sei-apis.com') });

const usei = await client.readContract({
  address: BANK_PRECOMPILE_ADDRESS,
  abi: BANK_PRECOMPILE_ABI,
  functionName: 'balance',
  args: ['0xYourAddress', 'usei'],
});

const all = await client.readContract({
  address: BANK_PRECOMPILE_ADDRESS,
  abi: BANK_PRECOMPILE_ABI,
  functionName: 'all_balances',
  args: ['0xYourAddress'],
}); // -> [{ denom: 'usei', amount: 1000000n }, ...]
```

## Staking + Distribution (ethers v6)

Mind the decimals: `delegate` → wei (18), `undelegate`/`redelegate` → usei (6), reads → usei (6) for balances.

```ts
import { ethers } from 'ethers';
import {
  STAKING_PRECOMPILE_ADDRESS, STAKING_PRECOMPILE_ABI,
  DISTRIBUTION_PRECOMPILE_ADDRESS, DISTRIBUTION_PRECOMPILE_ABI,
} from '@sei-js/precompiles';

const provider = new ethers.JsonRpcProvider('https://evm-rpc.sei-apis.com');
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
const staking = new ethers.Contract(STAKING_PRECOMPILE_ADDRESS, STAKING_PRECOMPILE_ABI, wallet);
const distribution = new ethers.Contract(DISTRIBUTION_PRECOMPILE_ADDRESS, DISTRIBUTION_PRECOMPILE_ABI, wallet);
const validator = 'seivaloper1...';

// Delegate 10 SEI — msg.value in wei (18 decimals). Format to 6 dp first so it is a multiple of 1e12.
const delegateTx = await staking.delegate(validator, { value: ethers.parseUnits('10', 18) });
await delegateTx.wait(1);

// Undelegate 5 SEI — amount in usei (6 decimals), NOT wei. Subject to a 21-day unbonding period.
const undelegateTx = await staking.undelegate(validator, ethers.parseUnits('5', 6));
await undelegateTx.wait(1);

// Read a delegation: balance.amount is 6-decimal usei; delegation.shares is 18-decimal.
const d = await staking.delegation(wallet.address, validator);
console.log('Staked:', ethers.formatUnits(d.balance.amount, 6), 'SEI');

// Claim rewards. rewards() query is 18-decimal DecCoins; the withdrawn amount is 6-decimal usei.
const claimTx = await distribution.withdrawDelegationRewards(validator);
await claimTx.wait(1);
```

## Governance vote (viem)

```ts
import { createWalletClient, custom } from 'viem';
import { sei } from 'viem/chains';
import { GOVERNANCE_PRECOMPILE_ADDRESS, GOVERNANCE_PRECOMPILE_ABI } from '@sei-js/precompiles';

const walletClient = createWalletClient({ chain: sei, transport: custom(window.ethereum) });
const [account] = await walletClient.getAddresses();

// Vote Yes (1) on proposal 99. Requires staked SEI for voting power.
const hash = await walletClient.writeContract({
  account,
  address: GOVERNANCE_PRECOMPILE_ADDRESS,
  abi: GOVERNANCE_PRECOMPILE_ABI,
  functionName: 'vote',
  args: [99n, 1],
});
```

## Solidity: stake from a contract

Declare a minimal interface and cast the fixed address. This pattern works for any precompile.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IStaking {
    function delegate(string memory validator) external payable returns (bool);
}
interface IDistribution {
    function withdrawDelegationRewards(string memory validator) external returns (bool);
}

contract StakeHelper {
    address constant STAKING = 0x0000000000000000000000000000000000001005;
    address constant DISTRIBUTION = 0x0000000000000000000000000000000000001007;

    // msg.value is the delegation amount in wei (18 decimals).
    // Delegation is recorded under THIS contract's address, not the caller's —
    // track per-user shares yourself if you need attribution.
    function stake(string calldata validator) external payable {
        require(msg.value > 0, "no value");
        require(IStaking(STAKING).delegate{value: msg.value}(validator), "delegate failed");
    }

    function harvest(string calldata validator) external {
        require(IDistribution(DISTRIBUTION).withdrawDelegationRewards(validator), "claim failed");
    }
}
```

## P256 verification (Solidity)

Sei's P256 precompile implements RIP-7212. Its real interface is `verify(bytes input) view returns (bytes)` — the 160-byte input is `hash ‖ r ‖ s ‖ pubX ‖ pubY`. On an invalid signature it returns **empty** data, which makes a high-level typed call revert when decoding `bytes`. Always use a low-level `staticcall` and treat empty output as "invalid".

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IP256Verify {
    function verify(bytes calldata input) external view returns (bytes memory);
}

contract PasskeyAuth {
    address constant P256 = 0x0000000000000000000000000000000000001011;

    function verifySig(bytes32 hash, bytes32 r, bytes32 s, bytes32 x, bytes32 y)
        external view returns (bool)
    {
        bytes memory input = abi.encodePacked(hash, r, s, x, y); // 160 bytes
        (bool ok, bytes memory out) = P256.staticcall(
            abi.encodeWithSelector(IP256Verify.verify.selector, input)
        );
        return ok && out.length > 0; // empty return data == invalid signature
    }
}
```

## JSON parsing on-chain

The JSON precompile parses payloads far cheaper than hand-rolled Solidity. `extractAsUint256` handles integers only (no decimals/booleans/negatives — encode decimals as scaled integers). It does **not** support dot-notation for nested keys; extract the parent object as bytes, then parse it.

```ts
import { ethers } from 'ethers';
import { JSON_PRECOMPILE_ADDRESS, JSON_PRECOMPILE_ABI } from '@sei-js/precompiles';

const json = new ethers.Contract(JSON_PRECOMPILE_ADDRESS, JSON_PRECOMPILE_ABI, provider);
const input = ethers.toUtf8Bytes(JSON.stringify({ price: 100, symbol: 'SEI' }));

const price = await json.extractAsUint256(input, 'price');          // 100n
const symbol = ethers.toUtf8String(await json.extractAsBytes(input, 'symbol')); // "SEI"
```

## Address association (Addr precompile)

Query the link between a key's `sei1...` and `0x...` addresses. Association is automatic on first transaction and **permanent**; manual association via `associate(v,r,s,customMessage)` or `associatePubKey(pubKeyHex)` is for the cases where it hasn't happened yet.

```ts
import { ethers } from 'ethers';
import { ADDRESS_PRECOMPILE_ADDRESS, ADDRESS_PRECOMPILE_ABI } from '@sei-js/precompiles';

const addr = new ethers.Contract(ADDRESS_PRECOMPILE_ADDRESS, ADDRESS_PRECOMPILE_ABI, provider);
const seiAddr = await addr.getSeiAddr('0xYourAddress'); // "sei1..."; REVERTS if unassociated — wrap in try/catch
const evmAddr = await addr.getEvmAddr('sei1...');        // "0x..."
```

## Cross-VM: Pointer / PointerView

Pointers are automatically deployed contracts that proxy a token from one VM in the other (e.g. a native/CW20 denom as a standard ERC20, a CW721 as an ERC721). Resolve an existing pointer with PointerView (`0x...100A`) — `getNativePointer(denom)`, `getCW20Pointer(addr)`, `getCW721Pointer(addr)`. The return value exposes the pointer address as `.addr` and an `exists` boolean; **always check `exists`** before using the address, since not every token has a deployed pointer. Once you have the address, treat it as a plain ERC20/ERC721.

```ts
import { POINTERVIEW_PRECOMPILE_ADDRESS, POINTERVIEW_PRECOMPILE_ABI } from '@sei-js/precompiles';

const pointerView = new ethers.Contract(POINTERVIEW_PRECOMPILE_ADDRESS, POINTERVIEW_PRECOMPILE_ABI, provider);

const result = await pointerView.getNativePointer('usei');
if (result.exists) {
  console.log('ERC20 pointer for usei:', result.addr);
  // result.addr is now usable as a standard ERC20 contract.
}
```

Deploying a *new* pointer (the registration side, Pointer precompile `0x...100B`) and the cross-VM/CosmWasm interop story are out of scope here — CosmWasm is deprecated for new development per SIP-3, so new projects should target EVM-only. For pointer registration details and the full cross-VM model, see https://docs.sei.io/learn/pointers.

## Common pitfalls

- **Treating `undelegate`/`redelegate` amounts as wei.** They are 6-decimal usei. Passing `parseEther('5')` undelegates 5,000,000,000,000 SEI worth of units — it will fail or behave wildly. Only `delegate`/`createValidator` use 18-decimal `msg.value`.
- **Reconciling `rewards()` against withdrawn amounts directly.** The query is 18-decimal DecCoins; withdrawals are 6-decimal usei. Divide the query by `1e18` and withdrawals by `1e6` before comparing.
- **Assuming `getNativePointer`/`getCW20Pointer` returns a bare address or a 3-tuple.** It returns a struct — read `.addr` and gate on `.exists`. Do not destructure a positional `version`/3-element tuple; no such field is documented.
- **Testing precompiles on a non-forked local node.** Nothing is deployed at the precompile addresses off-Sei → reverts. Fork mainnet/testnet RPC in your test runner.
- **Building on the native Oracle precompile.** It is deprecated and will be turned off. Use Chainlink/Pyth/Redstone/API3 instead.
- **Calling P256 `verify` through a typed high-level contract call.** Invalid signatures return empty data and the decode reverts. Use `staticcall` and check `out.length > 0`.
- **`extractAsUint256` on non-integers** (decimals, booleans, negatives) reverts. Scale decimals to integers; encode booleans as 0/1.
- **Expecting voting power from liquid SEI.** Only staked/delegated SEI votes; if you don't vote, your validator's vote is inherited.
- **`voteWeighted` weights not summing to exactly `"1.0"`** → the transaction is rejected by the gov module.
- **Using `tx.wait(12)` or expecting `finalized`/`safe` to lag `latest`.** Sei finalizes fast and those commitment levels resolve to the same block — `tx.wait(1)` and `latest` are correct. Use legacy `gasPrice`, not EIP-1559 `maxFeePerGas`/priority fees.
- **Hardcoding a single SSTORE/storage gas number.** It is currently 72,000 gas (the same on mainnet and testnet) but is governance-adjustable. Estimate gas dynamically (`estimateGas`) and link to the live value rather than baking in a constant.
- **Assuming a `sei1` and `0x` address are already linked.** They share a key but are only mapped after association; sending native tokens to an unassociated counterpart can be unreachable from the other VM.

## Key docs

| Topic | Link |
| --- | --- |
| Precompile example usage (Bank/Staking/Gov/Distribution/JSON) | https://docs.sei.io/evm/precompiles/example-usage |
| Staking precompile (decimals, validators, unbonding) | https://docs.sei.io/evm/precompiles/staking |
| Distribution precompile (rewards, commission) | https://docs.sei.io/evm/precompiles/distribution |
| Governance precompile (vote, deposit, proposals) | https://docs.sei.io/evm/precompiles/governance |
| JSON precompile | https://docs.sei.io/evm/precompiles/json |
| P256 precompile (RIP-7212 / passkeys) | https://docs.sei.io/evm/precompiles/p256-precompile |
| Address precompile (association) | https://docs.sei.io/evm/precompiles/cosmwasm-precompiles/addr |
| Bank precompile | https://docs.sei.io/evm/precompiles/cosmwasm-precompiles/bank |
| Oracle precompile (deprecated) + third-party oracles | https://docs.sei.io/evm/oracles |
| Pointer contracts / cross-VM | https://docs.sei.io/learn/pointers |
| Accounts & address association | https://docs.sei.io/learn/accounts |
