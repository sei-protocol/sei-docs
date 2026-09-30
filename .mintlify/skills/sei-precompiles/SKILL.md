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

- **Addresses are fixed** (40-hex, left-padded): Bank `0x...1001` · CosmWasm `0x...1002` · JSON `0x...1003` · Addr `0x...1004` · Staking `0x...1005` · Governance `0x...1006` · Distribution `0x...1007` · Oracle `0x...1008` (retired) · IBC `0x...1009` (do not use) · PointerView `0x...100A` · Pointer `0x...100B` · Solo `0x...100C` · P256Verify `0x...1011`. Import them from `@sei-js/precompiles` rather than hardcoding. The live ABIs are in `sei-chain` under `precompiles/<name>/abi.json`.
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
} from '@sei-js/precompiles'; // BANK_*, POINTER_*, and P256_* are exported too

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
// Distribution (0x...1007) — the caller is the delegator (or, for commission, the validator operator):
function withdrawDelegationRewards(string memory validator) external returns (bool);
function withdrawMultipleDelegationRewards(string[] memory validators) external returns (bool);
function withdrawValidatorCommission() external returns (bool);
// Events: Delegate / Undelegate / Redelegate (delegator indexed) — rewards accrue every block.
```

Queries: `delegation(delegator, validator)` returns one struct — `balance` (`amount` in usei, `denom`) and `delegation` (`delegator_address`, `shares`, `decimals`, `validator_address`); distribution's `rewards(delegator)` and `delegationRewards(delegator, validator)` read pending rewards. `delegatorDelegations`, `validators(status, ...)`, and `delegatorUnbondingDelegations` paginate with a `bytes` key — pass the previous response's `nextKey`, or `"0x"` for the first page.

```typescript
import { DISTRIBUTION_PRECOMPILE_ADDRESS, DISTRIBUTION_PRECOMPILE_ABI } from '@sei-js/precompiles';
const distribution = new ethers.Contract(DISTRIBUTION_PRECOMPILE_ADDRESS, DISTRIBUTION_PRECOMPILE_ABI, signer);
const validator = 'seivaloper1...';

// Delegate 10 SEI — the amount is msg.value in wei (18 decimals)
const tx = await staking.delegate(validator, { value: ethers.parseEther('10') });
await tx.wait(1);

// Undelegate 10 SEI — amount in usei (6 decimals, NOT wei): 10 SEI = 10,000,000 usei
await (await staking.undelegate(validator, 10_000_000n)).wait(1); // unbonding period: 21 days

// Query a delegation — one struct: balance { amount (usei), denom } and delegation { shares, ... }
const { balance, delegation } = await staking.delegation(await signer.getAddress(), validator);
console.log('Shares:', delegation.shares.toString(), '| Balance:', balance.amount.toString(), balance.denom);

// Claim rewards — the caller is the delegator, so only the validator is passed
await (await distribution.withdrawDelegationRewards(validator)).wait(1);
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
    // The caller is the delegator — here, the vault contract itself.
    function withdrawDelegationRewards(string memory validator) external returns (bool);
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
        IDistribution(DISTRIBUTION).withdrawDelegationRewards(validatorAddress);
        uint256 rewards = address(this).balance;
        if (rewards > 0) IStaking(STAKING).delegate{value: rewards}(validatorAddress);
    }

    receive() external payable {} // accept plain SEI transfers
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
// proposalJSON, e.g. {"title":"...","description":"...","type":"Text","is_expedited":false}
// msg.value = deposit (3,500 SEI minimum on mainnet, 7,000 expedited)
function submitProposal(string memory proposalJSON) external payable returns (uint64 proposalID);

function proposal(uint64 proposalID) external view returns (Proposal memory);
function proposals(int32 proposalStatus, address voter, address depositor, bytes memory pageKey)
    external view returns (Proposal[] memory proposals, bytes memory nextKey);
```

```typescript
const proposalJSON = JSON.stringify({ title: 'My proposal', description: 'Why it matters', type: 'Text', is_expedited: false });
await (await governance.submitProposal(proposalJSON, { value: ethers.parseEther('3500') })).wait(1);
```

Parse the `proposalID` from the transaction's events after `submitProposal`. Contracts vote the same way — cast `0x0000000000000000000000000000000000001006` to an interface with `vote(uint64, int32) returns (bool)`.

## JSON parsing on-chain

The JSON precompile (`0x...1003`) parses payloads natively — far cheaper than hand-rolled Solidity parsing. Functions: `extractAsBytes`, `extractAsBytesList`, and `extractAsUint256` (each `(bytes input, string key)`), plus `extractAsBytesFromArray(bytes input, uint16 arrayIndex)` for top-level arrays. All are `view`. There is no dot-notation for nested keys — extract the parent object as bytes, then parse it again.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IJSON {
    function extractAsUint256(bytes memory input, string memory key) external view returns (uint256);
    function extractAsBytes(bytes memory input, string memory key) external view returns (bytes memory);
}

contract PayloadParser {
    address constant JSON = 0x0000000000000000000000000000000000001003;

    // Nested value {"oracle": {"symbol": "BTC"}} -> extract parent, then child
    function parseSymbol(bytes calldata payload) external view returns (bytes memory) {
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
    // input = abi.encodePacked(hash, r, s, x, y), 160 bytes
    function verify(bytes calldata input) external view returns (bytes memory response);
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
        // A valid signature returns non-empty data; an invalid one returns none, which would
        // revert a high-level call, so use staticcall and check the output length.
        (bool ok, bytes memory output) = P256.staticcall(
            abi.encodeWithSelector(IP256.verify.selector, abi.encodePacked(digest, r, s, pubKeyX, pubKeyY))
        );
        require(ok && output.length > 0, "Invalid P-256 signature");
        nonce++;
        (bool success, bytes memory result) = target.call(data);
        require(success, "Execution failed");
        return result;
    }
}
```

This verifies a raw P-256 signature over the digest, as an HSM or platform key produces. A WebAuthn passkey signs `sha256(authenticatorData ‖ sha256(clientDataJSON))` instead, so a passkey wallet must also check that the challenge inside `clientDataJSON` equals this digest — use an audited WebAuthn verifier rather than rolling your own.

```typescript
import { P256_PRECOMPILE_ADDRESS, P256_PRECOMPILE_ABI } from '@sei-js/precompiles';
const p256 = new ethers.Contract(P256_PRECOMPILE_ADDRESS, P256_PRECOMPILE_ABI, provider);

// 160-byte input: hash ‖ r ‖ s ‖ x ‖ y, each 32 bytes
const input = ethers.concat([messageHash, r, s, x, y].map((v) => ethers.zeroPadValue(v, 32)));
let isValid = false;
try {
  // Success returns 32 bytes ending in 0x01
  isValid = (await p256.verify(input)) === ethers.zeroPadValue('0x01', 32);
} catch {
  // An invalid signature returns no data, which ethers can't decode as bytes — treat it as invalid
}
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

An already-deployed CW20, CW721, or CW1155 without a pointer can still get one through the Pointer precompile (`0x000000000000000000000000000000000000100B`): `addCW20Pointer(string cwAddr)`, `addCW721Pointer(string cwAddr)`, and `addCW1155Pointer(string cwAddr)`, each `payable returns (address)` and charging a small protocol fee in SEI. `seid` has no pointer-registration command; it only looks pointers up:

```bash
seid q evm pointer CW20 <CW20_CONTRACT_ADDRESS> --node https://rpc-testnet.sei-apis.com
```

The Bank precompile (`0x...1001`, legacy bridge) can `send` existing native tokens from the EVM side but cannot mint; for a new token with programmatic minting, deploy an ERC-20. Full cross-VM model: https://docs.sei.io/learn/pointers.

## Common pitfalls

- **Treating `undelegate`/`redelegate` amounts as wei.** They are 6-decimal usei; only `delegate` uses 18-decimal `msg.value`. `parseEther('5')` passed to `undelegate` is off by 1e12.
- **Testing precompiles on a local node or a fork.** Precompiles are native to Sei nodes, so neither a local EVM nor a Foundry/Hardhat fork runs them. Test on Sei Testnet, and mock them in unit tests.
- **Verifying a caller-supplied hash in a signature-gated wallet.** Anyone who sees one valid signature can replay it for arbitrary calls — compute the digest in the contract from the chain ID, the wallet address, a nonce, and the call.
- **Calling the Oracle precompile.** Shut off July 2026 — queries revert, and `@sei-js/precompiles` no longer exports it. Use a third-party oracle (https://docs.sei.io/learn/oracles).
- **Calling the IBC precompile.** IBC is disabled in both directions, so `transfer` reverts — there is no IBC route on or off Sei.
- **Calling P256 with five `bytes32` arguments or a typed call.** `verify` takes one 160-byte `bytes` input and returns no data for an invalid signature, so a high-level Solidity call reverts instead of returning false — use `staticcall` and check the output length. Do not confuse P-256 (secp256r1, `0x...1011`) with secp256k1 (`ecrecover`).
- **Calling functions the precompiles don't have.** `withdrawDelegatorReward`, a four-string `submitProposal`, `getProposal`/`getProposals`, `extractAsBytes32`, and `registerCW20Pointer` aren't in the ABIs — use `withdrawDelegationRewards(validator)`, `submitProposal(proposalJSON)`, `proposal`/`proposals`, `extractAsBytesFromArray`, and `addCW20Pointer`.
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
