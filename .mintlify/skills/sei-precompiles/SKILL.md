---
# GENERATED FROM sei-protocol/sei-skill@e2445c8 — DO NOT EDIT BY HAND.
# Edit the source in sei-skill, then regenerate via scripts/build-mintlify-skills.mjs
# (see .github/workflows/sync-skills.yml).
name: sei-precompiles
description: >
  Use when "call the Sei staking precompile", "delegate SEI from a contract", "vote on a Sei
  governance proposal in Solidity", "claim staking rewards via distribution precompile",
  "parse JSON on-chain on Sei", "verify a passkey/WebAuthn P256 signature on Sei",
  "associate my sei1 and 0x addresses", "look up the ERC20 pointer for a native or CW20 token",
  "register an EVM pointer for an existing CW20", "is the Sei oracle precompile still live",
  "can I still use the IBC precompile", "@sei-js/precompiles addresses and ABIs".
  Covers calling Sei's native precompiles (Staking, Governance, Distribution, JSON, P256,
  Addr, Bank, Pointer/PointerView, Solo) from Solidity and viem/ethers, which retired
  precompiles (Oracle, IBC) not to call, and cross-VM pointers for existing assets.
license: MIT
compatibility: Requires @sei-js/precompiles; Solidity 0.8.x or viem/ethers v6
metadata:
  author: Sei
  version: 1.2.0
  intended-host: docs.sei.io
  domain: precompiles
---

# Sei precompiles

This skill makes the agent precise at calling Sei's native precompiles — fixed-address contracts deployed by the protocol that expose native chain logic (staking, governance, distribution, address association, cross-VM pointers) plus JSON parsing and P-256 signature verification to the EVM. Precompiles behave like ordinary contracts from Solidity/viem/ethers but execute privileged native code efficiently. Use `@sei-js/precompiles` for addresses and ABIs. Examples default to Sei testnet (atlantic-2, EVM chainId 1328, `seiTestnet` in `viem/chains`); mainnet (pacific-1, chainId 1329, `sei`) is the production target.

## Critical facts

- **Addresses are fixed** (40-hex, left-padded): Bank `0x...1001` · CosmWasm `0x...1002` · JSON `0x...1003` · Addr `0x...1004` · Staking `0x...1005` · Governance `0x...1006` · Distribution `0x...1007` · Oracle `0x...1008` (retired) · IBC `0x...1009` (do not use) · PointerView `0x...100A` · Pointer `0x...100B` · Solo `0x...100C` · P256Verify `0x...1011`. Import them from `@sei-js/precompiles` rather than hardcoding (exception: P256 is not exported — define it inline).
- **The Oracle precompile (`0x...1008`) is retired** — it was shut off in July 2026 and queries now revert. It is not a data source: do not call it, and treat any code that reads it as broken. Use a third-party oracle instead — see https://docs.sei.io/learn/oracles.
- **The IBC precompile (`0x...1009`) cannot succeed.** IBC is disabled on Sei in both directions (Proposals 116 and 120 inbound, Proposal 121 outbound), so its `transfer` reverts. Do not call it in new contracts or present it as a way to move assets; existing `ibc/...` balances stay usable within Sei.
- **Precompiles only exist on a real Sei network.** They are native code in the Sei node, so a plain local EVM (Hardhat node, `forge test`) has nothing at these addresses, and a Foundry, Hardhat, or anvil fork copies Sei's state but not these implementations — calls fail in both. Test precompile calls on Sei Testnet or a local `seid` node, and place a mock at the address in unit tests (Foundry `vm.etch`, Hardhat `hardhat_setCode`). Endpoints: https://docs.sei.io/evm/networks.
- **Staking decimal asymmetry (the #1 footgun).** `delegate()` reads `msg.value` in 18-decimal wei (`1 SEI = 1e18 wei`); `undelegate()` / `redelegate()` take the amount in 6-decimal usei (`1 SEI = 1,000,000 usei`). The asymmetry is intentional — match each signature exactly. Unbonding takes 21 days; delegators share proportionally in validator slashing.
- **No approvals, and events are emitted.** Precompiles never use the ERC20 approve pattern — value goes in as `msg.value` (payable) or as parameters. All precompiles emit events; index them with `eth_getLogs` or The Graph.
- **Governance voting power = staked SEI only.** Liquid SEI gives zero voting power; non-voters inherit their validator's vote. Mainnet: minimum deposit 3,500 SEI (7,000 expedited), deposit period 2 days, voting period 3 days (1 day expedited), quorum 33.4% of bonded stake; ALL deposits are burned if a proposal gets >33.4% NoWithVeto. Vote options: `1`=Yes, `2`=Abstain, `3`=No, `4`=NoWithVeto. atlantic-2 uses much smaller deposits — rehearse the full flow there.
- **CosmWasm-side precompiles are legacy per SIP-3.** CosmWasm (`0x...1002`), Bank (`0x...1001`), and Solo (`0x...100C`, claims/migrates legacy CW20/CW721 tokens to EVM) remain functional for existing integrations, and so do the pointer precompiles. New projects should be EVM-only: deploy ERC-20/721/1155 contracts. Tokenfactory is not a supported path for new tokens — see https://docs.sei.io/cosmos-sdk#tokenfactory-is-not-supported.
- **Pointers are a legacy and migration tool, one per contract.** A pointer is a translation layer, not a lock/mint bridge — both VMs see the same single supply. Registering a new pointer only applies to already-deployed CosmWasm contracts, a second pointer for the same contract fails on-chain, and the registered pointer is the canonical interface.
- **Validator parameters are bech32 strings** (`seivaloper1...`), passed as Solidity `string`, not `address`.

## Setup

```bash
npm install @sei-js/precompiles ethers viem
```

```typescript
import {
  STAKING_PRECOMPILE_ADDRESS, STAKING_PRECOMPILE_ABI,
  GOVERNANCE_PRECOMPILE_ADDRESS, GOVERNANCE_PRECOMPILE_ABI,
  DISTRIBUTION_PRECOMPILE_ADDRESS, DISTRIBUTION_PRECOMPILE_ABI,
  JSON_PRECOMPILE_ADDRESS, JSON_PRECOMPILE_ABI,
  ADDRESS_PRECOMPILE_ADDRESS, ADDRESS_PRECOMPILE_ABI,
  POINTERVIEW_PRECOMPILE_ADDRESS, POINTERVIEW_PRECOMPILE_ABI,
} from '@sei-js/precompiles'; // BANK_* and POINTER_* also exported; P256 is NOT

// ethers v6 — signer from the connected wallet (atlantic-2 while testing)
import { ethers } from 'ethers';
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const staking = new ethers.Contract(STAKING_PRECOMPILE_ADDRESS, STAKING_PRECOMPILE_ABI, signer);

// viem — chain configs ship in viem/chains
import { createWalletClient, custom, getContract } from 'viem';
import { seiTestnet } from 'viem/chains'; // atlantic-2, chainId 1328; use `sei` (pacific-1, 1329) in production
const walletClient = createWalletClient({ chain: seiTestnet, transport: custom(window.ethereum) });
const stakingViem = getContract({ address: STAKING_PRECOMPILE_ADDRESS, abi: STAKING_PRECOMPILE_ABI, client: walletClient });
```

## Staking + Distribution (ethers v6)

Core signatures — note which unit each amount uses:

```solidity
function delegate(string memory validatorAddress) external payable returns (bool);           // value = wei (1e18)
function undelegate(string memory validatorAddress, uint256 amount) external returns (bool); // amount = usei (1e6)
function redelegate(string memory srcValidatorAddress, string memory dstValidatorAddress, uint256 amount)
    external returns (bool);                                                                  // amount = usei (1e6)
// Distribution (0x...1007):
function withdrawDelegatorReward(address delegatorAddress, string memory validatorAddress) external returns (bool);
function withdrawValidatorCommission(string memory validatorAddress) external returns (bool);
// Events: Delegate / Undelegate / Redelegate (delegator indexed) — rewards accrue every block.
```

Queries: `delegation(delegator, validator)` returns `(shares, Coin balance)`; `delegatorDelegations`, `validators(status, ...)`, and `delegatorUnbondingDelegations` list results with cursor pagination — pass the previous response's `nextKey`/`pageKey`, or `""` for the first page.

```typescript
import { DISTRIBUTION_PRECOMPILE_ADDRESS, DISTRIBUTION_PRECOMPILE_ABI } from '@sei-js/precompiles';
const distribution = new ethers.Contract(DISTRIBUTION_PRECOMPILE_ADDRESS, DISTRIBUTION_PRECOMPILE_ABI, signer);
const validator = 'seivaloper1...';

// Delegate 10 SEI — the amount is msg.value in wei (18 decimals)
const tx = await staking.delegate(validator, { value: ethers.parseEther('10') });
await tx.wait(1);

// Undelegate 10 SEI — amount in usei (6 decimals, NOT wei): 10 SEI = 10,000,000 usei
await (await staking.undelegate(validator, 10_000_000n)).wait(1); // unbonding period: 21 days

// Query a delegation — balance is a Coin { amount, denom }
const [shares, balance] = await staking.delegation(await signer.getAddress(), validator);
console.log('Shares:', shares.toString(), '| Balance:', balance.amount.toString(), balance.denom);

// Claim rewards — note the (delegator, validator) argument pair
await (await distribution.withdrawDelegatorReward(await signer.getAddress(), validator)).wait(1);
```

## Solidity: stake from a contract

Declare a minimal interface and cast the fixed address — the pattern works for every precompile.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IStaking {
    function delegate(string memory validatorAddress) external payable returns (bool);
}
interface IDistribution {
    function withdrawDelegatorReward(address delegatorAddress, string memory validatorAddress)
        external returns (bool);
}

contract StakingVault {
    address constant STAKING = 0x0000000000000000000000000000000000001005;
    address constant DISTRIBUTION = 0x0000000000000000000000000000000000001007;
    string public validatorAddress; // seivaloper1...

    constructor(string memory _validator) { validatorAddress = _validator; }

    // msg.value = delegation amount in wei (18 decimals). The delegation is recorded under
    // THIS contract's address, not the caller's — mint shares if you need per-user attribution.
    function deposit() external payable {
        require(msg.value > 0, "Must send SEI");
        require(IStaking(STAKING).delegate{value: msg.value}(validatorAddress), "Delegation failed");
    }

    // Claim rewards and immediately re-delegate them.
    function compound() external {
        IDistribution(DISTRIBUTION).withdrawDelegatorReward(address(this), validatorAddress);
        uint256 rewards = address(this).balance;
        if (rewards > 0) IStaking(STAKING).delegate{value: rewards}(validatorAddress);
    }

    receive() external payable {} // receives the withdrawn rewards
}
```

## Governance

```typescript
import { GOVERNANCE_PRECOMPILE_ADDRESS, GOVERNANCE_PRECOMPILE_ABI } from '@sei-js/precompiles';
const governance = new ethers.Contract(GOVERNANCE_PRECOMPILE_ADDRESS, GOVERNANCE_PRECOMPILE_ABI, signer);

// Vote Yes (1) on proposal 42 — requires staked SEI for voting power
await (await governance.vote(42n, 1)).wait(1);

// Split vote: 70% Yes, 30% Abstain — weights MUST sum to exactly "1.0"
await (await governance.voteWeighted(42n, [
  { option: 1, weight: "0.7" },
  { option: 2, weight: "0.3" },
])).wait(1);

// Deposit 100 SEI to push a proposal into its voting period (msg.value in wei)
await (await governance.deposit(42n, { value: ethers.parseEther('100') })).wait(1);
```

Proposal submission and queries:

```solidity
function submitProposal(
    string memory title,
    string memory description,
    string memory metadata,     // e.g. "ipfs://..."
    string memory proposalType  // "Text", "ParameterChange", "SoftwareUpgrade"
) external payable returns (uint64 proposalID); // msg.value = deposit (3,500 SEI minimum on mainnet)

function getProposal(uint64 proposalID) external view returns (Proposal memory);
function getProposals(uint32 proposalStatus, uint32 pageLimit, string memory pageKey)
    external view returns (Proposal[] memory);
```

Parse the `proposalID` from the transaction's events after `submitProposal`. Contracts vote the same way — cast `0x0000000000000000000000000000000000001006` to an interface with `vote(uint64, int32) returns (bool)`.

## JSON parsing on-chain

The JSON precompile (`0x...1003`) parses payloads natively — far cheaper than hand-rolled Solidity parsing. Functions: `extractAsBytes`, `extractAsBytes32`, `extractAsBytesList`, `extractAsUint256` (all `(bytes input, string key)`). There is no dot-notation for nested keys — extract the parent object as bytes, then parse it again.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IJSON {
    function extractAsUint256(bytes memory input, string memory key) external pure returns (uint256);
    function extractAsBytes(bytes memory input, string memory key) external pure returns (bytes memory);
}

contract PayloadParser {
    address constant JSON = 0x0000000000000000000000000000000000001003;

    // Nested value {"oracle": {"symbol": "BTC"}} -> extract parent, then child
    function parseSymbol(bytes calldata payload) external pure returns (bytes memory) {
        bytes memory oracle = IJSON(JSON).extractAsBytes(payload, "oracle");
        return IJSON(JSON).extractAsBytes(oracle, "symbol");
    }
}
```

```typescript
import { JSON_PRECOMPILE_ADDRESS, JSON_PRECOMPILE_ABI } from '@sei-js/precompiles';
const json = new ethers.Contract(JSON_PRECOMPILE_ADDRESS, JSON_PRECOMPILE_ABI, provider);
const payload = ethers.toUtf8Bytes('{"price": "1234000000000000000000"}');
const price = await json.extractAsUint256(payload, 'price'); // 1234000000000000000000n
```

## P256 verification (passkeys)

The P256 precompile (`0x...1011`) verifies NIST P-256 (secp256r1) signatures — the curve used by WebAuthn/passkeys (Touch ID, Face ID, hardware keys), Apple/Google platform credentials, HSMs, and ERC-4337 passkey smart accounts. It is a different curve from Ethereum's secp256k1 (`ecrecover`).

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IP256 {
    function verify(bytes32 messageHash, bytes32 r, bytes32 s, bytes32 x, bytes32 y)
        external view returns (bool);
}

contract P256Wallet {
    address constant P256 = 0x0000000000000000000000000000000000001011;
    bytes32 public pubKeyX; // stored at registration
    bytes32 public pubKeyY;
    uint256 public nonce;

    constructor(bytes32 _x, bytes32 _y) { pubKeyX = _x; pubKeyY = _y; }

    // Build the signed digest here, never from caller input: binding it to this chain,
    // this wallet, the next nonce, and the exact call stops replays and redirected calls.
    function execute(address target, bytes calldata data, bytes32 r, bytes32 s)
        external returns (bytes memory)
    {
        bytes32 digest = keccak256(abi.encode(block.chainid, address(this), nonce, target, data));
        require(IP256(P256).verify(digest, r, s, pubKeyX, pubKeyY), "Invalid P-256 signature");
        nonce++;
        (bool ok, bytes memory result) = target.call(data);
        require(ok, "Execution failed");
        return result;
    }
}
```

This verifies a raw P-256 signature over the digest, as an HSM or platform key produces. A WebAuthn passkey signs `sha256(authenticatorData ‖ sha256(clientDataJSON))` instead, so a passkey wallet must also check that the challenge inside `clientDataJSON` equals this digest — use an audited WebAuthn verifier rather than rolling your own.

```typescript
// P256 is NOT exported by @sei-js/precompiles — define the address and ABI inline.
// Source of truth: github.com/sei-protocol/sei-chain/tree/main/precompiles/p256
const P256_PRECOMPILE_ADDRESS = '0x0000000000000000000000000000000000001011';
const P256_PRECOMPILE_ABI = [
  'function verify(bytes32 hash, bytes32 r, bytes32 s, bytes32 x, bytes32 y) view returns (bool)',
];
const p256 = new ethers.Contract(P256_PRECOMPILE_ADDRESS, P256_PRECOMPILE_ABI, provider);
const isValid = await p256.verify(messageHash, r, s, x, y); // true for a valid P-256 signature
```

## Address association (Addr precompile)

Every Sei account has two representations of the same key — a bech32 `sei1...` address and an EVM `0x...` address — linked by an on-chain association (created automatically the first time the account transacts). The Addr precompile (`0x...1004`) converts between them.

```typescript
import { ADDRESS_PRECOMPILE_ADDRESS, ADDRESS_PRECOMPILE_ABI } from '@sei-js/precompiles';
const addr = new ethers.Contract(ADDRESS_PRECOMPILE_ADDRESS, ADDRESS_PRECOMPILE_ABI, provider);

try {
  const seiAddr = await addr.getSeiAddr('0xYourAddress'); // "sei1..."
} catch {
  // REVERTS when the address has no association yet — it does NOT return an empty string.
}
const evmAddr = await addr.getEvmAddr('sei1...'); // "0x..."; also reverts if unassociated
```

Account model details: https://docs.sei.io/learn/accounts.

## Cross-VM pointers (PointerView / Pointer)

EVM wallets only see ERC20/ERC721; Cosmos wallets only see native and CW20/CW721 tokens. A registered pointer makes one existing token visible in both ecosystems — `transfer()` on an ERC20 pointer moves the underlying native token. Pointers are now a legacy and migration tool: native SEI, existing `ibc/...` balances, and already-deployed CW20/CW721 contracts keep working through theirs, but new tokens are deployed as ERC-20/721/1155. Resolve an existing pointer with PointerView (`0x...100A`) — always gate on `exists`:

```typescript
import { POINTERVIEW_PRECOMPILE_ADDRESS, POINTERVIEW_PRECOMPILE_ABI } from '@sei-js/precompiles';
const pointerView = new ethers.Contract(POINTERVIEW_PRECOMPILE_ADDRESS, POINTERVIEW_PRECOMPILE_ABI, provider);

const [pointerAddress, version, exists] = await pointerView.getNativePointer('usei');
if (exists) {
  // pointerAddress is a standard ERC20 for the native denom — use it with any ERC20 tooling
}
const [cwPointer, cwVersion, cwExists] = await pointerView.getCW20Pointer('sei1cw20contract...');
```

An already-deployed CW20 or CW721 without a pointer can still get one (types `CW20`, `CW721`):

```bash
seid tx evm register-evm-pointer CW20 <CW20_CONTRACT_ADDRESS> \
  --from <KEY_NAME> --chain-id atlantic-2 \
  --node https://rpc-testnet.sei-apis.com --fees 40000usei

# Look up an existing pointer
seid q evm pointer CW20 <CW20_CONTRACT_ADDRESS> --node https://rpc-testnet.sei-apis.com
```

Or from Solidity via the Pointer precompile (`0x000000000000000000000000000000000000100B`): `registerCW20Pointer(string cwAddr)` and `registerCW721Pointer(string cwAddr)` — each `payable returns (address pointer)`, charging a small protocol fee in SEI. The Bank precompile (`0x...1001`, legacy bridge) can `send` existing native tokens from the EVM side but cannot mint; for a new token with programmatic minting, deploy an ERC-20. Full cross-VM model: https://docs.sei.io/learn/pointers.

## Common pitfalls

- **Treating `undelegate`/`redelegate` amounts as wei.** They are 6-decimal usei; only `delegate` uses 18-decimal `msg.value`. `parseEther('5')` passed to `undelegate` is off by 1e12.
- **Testing precompiles on a local node or a fork.** Precompiles are native to Sei nodes, so neither a local EVM nor a Foundry/Hardhat fork runs them. Test on Sei Testnet, and mock them in unit tests.
- **Verifying a caller-supplied hash in a signature-gated wallet.** Anyone who sees one valid signature can replay it for arbitrary calls — compute the digest in the contract from the chain ID, the wallet address, a nonce, and the call.
- **Calling the Oracle precompile.** Shut off July 2026 — queries revert even though `ORACLE_PRECOMPILE_ADDRESS`/`ABI` are still exported. Use a third-party oracle (https://docs.sei.io/learn/oracles).
- **Calling the IBC precompile.** IBC is disabled in both directions, so `transfer` reverts — there is no IBC route on or off Sei.
- **Looking for P256 in `@sei-js/precompiles`.** Not exported; define the address/ABI inline. Do not confuse P-256 (secp256r1, `0x...1011`) with secp256k1 (`ecrecover`).
- **`voteWeighted` weights not summing to exactly `"1.0"`** → the transaction fails. Weights are decimal strings, not integers.
- **Expecting voting power from liquid SEI.** Only staked SEI votes; non-voters inherit their validator's vote. And >33.4% NoWithVeto burns ALL deposits on a proposal, including yours.
- **Assuming `getSeiAddr`/`getEvmAddr` return empty strings for unknown addresses.** They REVERT when no association exists — wrap in try/catch.
- **Skipping the `exists` check on pointer queries.** `getNativePointer`/`getCW20Pointer` return `(address, version, exists)`; the address is meaningless when `exists` is false.
- **Registering a second pointer for the same contract.** Enforced on-chain — one pointer per contract; the registration fails.
- **Launching a new token through tokenfactory or a new native-denom pointer.** Unsupported — deploy an ERC-20 instead.
- **Using dot-notation for nested JSON keys.** Not supported — `extractAsBytes` the parent object, then extract the child from it.
- **Adding ERC20 `approve` flows to precompile calls.** Value goes in as `msg.value` or parameters; there is no allowance model.

## Key docs

| Topic | Link |
| --- | --- |
| Precompile example usage (staking/gov/distribution/JSON) | https://docs.sei.io/evm/precompiles/example-usage |
| Staking precompile (delegate, undelegate, queries) | https://docs.sei.io/evm/precompiles/staking |
| Distribution precompile (rewards, commission) | https://docs.sei.io/evm/precompiles/distribution |
| Governance precompile (vote, deposit, proposals) | https://docs.sei.io/evm/precompiles/governance |
| JSON precompile | https://docs.sei.io/evm/precompiles/json |
| P256 precompile (passkeys/WebAuthn) | https://docs.sei.io/evm/precompiles/p256-precompile |
| Addr precompile (association) | https://docs.sei.io/evm/precompiles/cosmwasm-precompiles/addr |
| Bank precompile (legacy bridge) | https://docs.sei.io/evm/precompiles/cosmwasm-precompiles/bank |
| Oracle precompile (retired) | https://docs.sei.io/evm/precompiles/oracle |
| Third-party oracles | https://docs.sei.io/learn/oracles |
| Pointer contracts / cross-VM | https://docs.sei.io/learn/pointers |
| Tokenfactory status (unsupported) | https://docs.sei.io/cosmos-sdk#tokenfactory-is-not-supported |
| Accounts & address association | https://docs.sei.io/learn/accounts |
| Network info (chain IDs, RPC endpoints) | https://docs.sei.io/evm/networks |
