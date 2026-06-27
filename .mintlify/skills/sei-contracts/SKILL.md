---
name: sei-contracts
description: >
  Use when "deploy a smart contract on Sei", "set up Foundry for Sei", "set up Hardhat for Sei", "verify a contract on Seiscan", "write a Solidity contract for Sei", "make my Sei contract upgradeable", "optimize my contract for Sei parallel execution", "what is the Sei gas model", "use ERC-4337 account abstraction on Sei", "why does my contract behave differently on Sei than Ethereum", or "deploy a token on Sei". Covers EVM smart-contract development on Sei: Foundry/Hardhat setup, the Sei gas model, OCC parallel-execution-aware design, Seiscan verification via Sourcify, upgradeability, and account abstraction.
license: MIT
compatibility: Requires Node.js 18+; Foundry or Hardhat; solc 0.8.x
metadata:
  author: Sei
  version: 1.0.0
  intended-host: docs.sei.io
  domain: contracts
---

# Sei contracts

This skill makes an agent fluent in EVM smart-contract development on Sei: scaffolding projects with Foundry or Hardhat, pointing them at the right RPC endpoints and chain IDs, writing Solidity that respects the Sei gas model and the optimistic-concurrency (OCC) parallel scheduler, deploying with fast-finality semantics, verifying on Seiscan through Sourcify, and shipping upgradeable contracts and ERC-4337 account abstraction. Sei is EVM-compatible, so standard Solidity, OpenZeppelin, Foundry, and Hardhat all work — this skill focuses on the deltas from mainnet Ethereum that trip people up.

## Critical facts

- **Chain IDs:** mainnet `pacific-1` = `1329` (`0x531`); testnet `atlantic-2` = `1328` (`0x530`). Deploy and verify against testnet first.
- **EVM RPC:** mainnet `https://evm-rpc.sei-apis.com`; testnet `https://evm-rpc-testnet.sei-apis.com`. Gas is paid in `usei` (1 SEI = 10^18 wei, 18 decimals on the EVM side).
- **~400ms blocks with fast finality:** use `tx.wait(1)` — never `tx.wait(12)`. There are **no `safe` or `finalized` block tags** on Sei; use `latest`.
- **No EIP-1559 base-fee burn:** all transaction fees go to validators. Prefer **legacy `gasPrice`**. `maxFeePerGas`/`maxPriorityFeePerGas` are accepted but there is no priority-fee market.
- **`block.coinbase` returns the global fee collector**, not the block proposer — do not use it to identify the validator that produced a block.
- **`block.prevrandao` is NOT a safe randomness source** on Sei. Use an external VRF (Pyth Entropy/VRF or Chainlink VRF).
- **Parallel execution (OCC):** Sei executes non-conflicting transactions in parallel. Transactions that write the same storage key conflict and get re-executed serially. Partition state by user/asset/id; avoid hot global counters.
- **Storage write (SSTORE) gas is 72,000** — far above Ethereum's 20,000, and the **same on mainnet and testnet** (set by governance [Proposal #109](https://www.mintscan.io/sei/proposals/109)). It is a **governance-adjustable** on-chain parameter, so don't assume it is fixed forever: read the live value at https://docs.sei.io/evm/differences-with-ethereum#sstore-gas-cost and estimate per-transaction with `eth_estimateGas`. (A `forge --gas-report --fork-url` report uses revm's standard EVM schedule and shows ~22k, not Sei's cost.) The same governance-adjustable caveat applies to the **minimum gas price** and **block gas limit**.
- **Dual-address accounts:** every key has a `sei1...` (Cosmos) address and a `0x...` (EVM) address. Cross-VM value transfers require address association via the `Addr` precompile. See https://docs.sei.io/learn/accounts.
- **CosmWasm is deprecated for new development** per SIP-3 (proposal 99) — target Sei EVM.
- **Verification is via Seiscan, backed by Sourcify** — no Etherscan API key required.

## Default stack

- **Toolchain:** Foundry for contract-heavy work (fast tests, fuzzing, fork testing); Hardhat for JS/TS-heavy teams that want Ignition and the OpenZeppelin Upgrades plugin.
- **Solidity:** `solc` 0.8.x (the docs use `0.8.28`) with the optimizer enabled (`runs = 200`).
- **Libraries:** OpenZeppelin Contracts v5 (`@openzeppelin/contracts`), plus `@openzeppelin/contracts-upgradeable` for proxies.
- **Precompile ABIs + viem chain configs:** import from `@sei-js/precompiles` (exports the precompile addresses/ABIs and `sei` / `seiTestnet` viem chains) — do not hardcode.
- **Scaffold a dApp:** `npx @sei-js/create-sei app --name <name>`.
- **AI tooling:** `claude mcp add sei-mcp-server npx @sei-js/mcp-server`.
- **Networks:** default to testnet (`atlantic-2`, 1328); only target mainnet (1329) on explicit confirmation.

## Foundry setup

`foundry.toml` — pin the compiler, enable the optimizer, and register both Sei RPCs:

```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
solc_version = "0.8.28"
optimizer = true
optimizer_runs = 200

[rpc_endpoints]
sei_testnet = "https://evm-rpc-testnet.sei-apis.com"
sei_mainnet = "https://evm-rpc.sei-apis.com"
```

Deploy with a Forge script, then verify on Sourcify (testnet shown):

```bash
# Deploy (private key from env; never commit it)
forge script script/DeployCounter.s.sol \
  --rpc-url $SEI_TESTNET_RPC --private-key $PRIVATE_KEY --broadcast

# Verify on Seiscan via Sourcify — no API key needed
forge verify-contract \
  --verifier sourcify \
  --chain-id 1328 \
  <DEPLOYED_CONTRACT_ADDRESS> \
  src/Counter.sol:Counter
```

Profile your contract's gas with Foundry, but get Sei's real storage-write cost from a live estimate — a `--fork-url` report forks state yet runs the standard EVM gas schedule, so it shows SSTORE at ~22k, not Sei's ~72k:

```bash
forge test --gas-report --fork-url https://evm-rpc-testnet.sei-apis.com  # relative profiling of your own logic
# For Sei's actual storage-write cost, estimate on-chain against a Sei RPC:
cast estimate <contract> "<funcSig>" <args...> --rpc-url https://evm-rpc.sei-apis.com
```

## Hardhat setup

Hardhat 3 is ESM-first and loads plugins via an explicit `plugins` array. Each network needs `type: 'http'`:

```typescript
import type { HardhatUserConfig } from 'hardhat/config';
import { configVariable } from 'hardhat/config';
import hardhatToolboxMochaEthers from '@nomicfoundation/hardhat-toolbox-mocha-ethers';

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxMochaEthers],
  solidity: {
    version: '0.8.28',
    settings: { optimizer: { enabled: true, runs: 200 } }
  },
  networks: {
    seitestnet: {
      type: 'http',
      chainType: 'l1',
      url: 'https://evm-rpc-testnet.sei-apis.com',
      accounts: [configVariable('SEI_PRIVATE_KEY')],
      chainId: 1328
    },
    seimainnet: {
      type: 'http',
      chainType: 'l1',
      url: 'https://evm-rpc.sei-apis.com',
      accounts: [configVariable('SEI_PRIVATE_KEY')],
      chainId: 1329
    }
  }
};

export default config;
```

Store the deploy key in Hardhat's encrypted keystore (never a plaintext file): `npx hardhat keystore set SEI_PRIVATE_KEY`. Deploy and verify:

```bash
npx hardhat ignition deploy ignition/modules/deploy-sei-token.ts --network seitestnet
# Sourcify is enabled by default in hardhat-verify — no API key
npx hardhat verify sourcify --network seitestnet <CONTRACT_ADDRESS>
```

## Design for parallel execution (OCC)

Sei runs transactions optimistically in parallel and re-executes any pair that wrote the same storage key. Keeping write-sets disjoint is the single biggest throughput lever. **Partition state by user/asset/id; never bump a global counter on a hot path.**

```solidity
// BAD — every swap writes the same slot, so all swaps serialize
contract DEX {
    uint256 public totalVolume;
    mapping(address => uint256) public balances;

    function swap(uint256 amount) external {
        balances[msg.sender] -= amount;  // per-user — fine
        totalVolume += amount;           // GLOBAL hot key — conflicts every tx
    }
}

// GOOD — drop the global write; reconstruct the aggregate off-chain from events
contract DEX {
    mapping(address => uint256) public balances;
    event Swap(address indexed user, uint256 amount);

    function swap(uint256 amount) external {
        balances[msg.sender] -= amount;
        emit Swap(msg.sender, amount);   // indexer sums Swap events for total volume
    }
}
```

Further OCC-aware rules:

- **Prefer pull over push:** let users `withdraw()` their own balance (a single isolated key) instead of looping over recipients.
- **Avoid unbounded loops** that write storage — page work across multiple transactions.
- **Per-user reentrancy state:** OpenZeppelin's single-slot `ReentrancyGuard` makes every guarded call conflict on one slot. Key the guard by `msg.sender` if concurrency matters.
- **If you must keep an on-chain aggregate, shard it** into N buckets (e.g. by `uint256(uint160(msg.sender)) & 0xFF`) so conflicts are rare.
- **Use precompiles** where available — they are optimized and cheaper than reimplementing logic in Solidity. See https://docs.sei.io/evm/precompiles/example-usage.

Full playbook: https://docs.sei.io/evm/best-practices/optimizing-for-parallelization.

## Gas-efficient Solidity on Sei

Most Ethereum gas advice carries over. The Sei-specific priorities:

- **Minimize storage writes.** SSTORE is 72,000 gas on Sei (vs Ethereum's 20,000) — batch computation in memory and commit a minimal set of writes. Estimate the real cost on-chain with `eth_estimateGas`; a `--fork-url` gas report uses the standard EVM schedule and understates it.
- **Use legacy `gasPrice`.** Do not rely on EIP-1559 priority-fee mechanics; there is no base-fee burn. Check the live minimum gas price at https://docs.sei.io before assuming a floor.
- **Respect the block gas limit.** A single transaction cannot exceed the (governance-adjustable) per-block gas limit — split long migration scripts into pageable batches.
- Standard wins: mark externally-called functions `external`, pack storage variables into shared slots, prefer `calldata` over `memory` for read-only array inputs, use `unchecked { ++i; }` where overflow is impossible, and use custom errors instead of revert strings.

## Deploying with fast finality

Sei reaches finality in roughly one block (~400ms), so wait for a single confirmation — never the Ethereum-style 12:

```typescript
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider('https://evm-rpc-testnet.sei-apis.com');
const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

const tx = await contract.increment();
await tx.wait(1); // one confirmation is final on Sei — do NOT use wait(12)

// Always read against 'latest' — Sei has no 'safe'/'finalized' tags
const head = await provider.getBlock('latest');
```

## Upgradeability

UUPS (ERC-1822) is the recommended default — a small proxy with upgrade logic in the implementation. Use `@openzeppelin/contracts-upgradeable`, an `initializer` instead of a constructor, and gate upgrades in `_authorizeUpgrade`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract MyToken is Initializable, ERC20Upgradeable, OwnableUpgradeable, UUPSUpgradeable {
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() { _disableInitializers(); }

    function initialize(address owner) public initializer {
        __ERC20_init("MyToken", "MTK");
        __Ownable_init(owner);
        // OZ v5's UUPSUpgradeable is stateless — no __UUPSUpgradeable_init() call
    }

    function _authorizeUpgrade(address) internal override onlyOwner {}
}
```

Sei-specific upgrade notes:

- **The upgrade admin is a `0x...` EVM address.** `Ownable` will not accept a `sei1...` Cosmos address — if governance lives on the Cosmos side, authorize the associated EVM address or an EVM-side multisig (Safe).
- **Treat precompile addresses as `constant`** — they are fixed by Sei consensus and should never live in upgradeable storage.
- **Always check storage layout before upgrading** — only *append* new state variables. Use OpenZeppelin's `hardhat-upgrades` linter, or `forge inspect <Contract> storageLayout` and diff manually for Foundry. Note: the OpenZeppelin `hardhat-upgrades` plugin targets Hardhat 2; on Hardhat 3 deploy an ERC1967 proxy directly and upgrade via UUPS `upgradeToAndCall`, validating layouts separately with `@openzeppelin/upgrades-core`.
- **Verify the new implementation, then mark the proxy.** Run `forge verify-contract <NEW_IMPL> ... --verifier sourcify --chain-id 1329`, then on Seiscan open the proxy address and confirm it as a proxy so reads route to the new ABI.

## Account abstraction (ERC-4337)

ERC-4337 works on Sei EVM. Sei's instant finality and gas model make it a good fit for gasless onboarding, ERC20-paymaster gas, batched user ops, and session keys. Use a bundler/paymaster provider (e.g. Pimlico or Particle Network) via the standard EntryPoint and a smart-account factory such as Safe, Kernel, SimpleAccount, or Biconomy. For consumer flows, the Sei Global Wallet wraps AA primitives so users never touch a seed phrase. Verify the live EntryPoint address, supported bundlers, and any token/paymaster addresses against https://docs.sei.io/evm/wallet-integrations/pimlico before deploying — do not hardcode them from memory. AA adds gas overhead per user op versus a direct EOA call, so skip it when a single signed call suffices.

## Common pitfalls

- **Waiting for 12 confirmations.** Sei is final in ~1 block; `tx.wait(12)` just stalls your dApp. Use `tx.wait(1)`.
- **Querying `safe` or `finalized` block tags.** They don't exist on Sei — use `latest`.
- **Using EIP-1559 fee fields and expecting a priority market.** There's no base-fee burn; set a legacy `gasPrice`.
- **Trusting `block.prevrandao` for randomness.** It is block-time-derived on Sei, not RANDAO output — use an external VRF.
- **Reading the proposer from `block.coinbase`.** It returns the global fee collector address.
- **Hot global counters.** A single `totalX += amount;` on every call serializes all callers under OCC — aggregate off-chain via events or shard the slot.
- **Assuming Ethereum's 20,000-gas SSTORE.** Storage writes cost 72,000 gas on Sei (governance-adjustable, same on mainnet and testnet) — estimate on-chain with `eth_estimateGas`; a `--gas-report --fork-url` report applies the standard schedule and understates it, so storage-heavy designs surprise you in production.
- **Mixing address formats.** A contract expecting a `0x...` address will not accept a `sei1...` address; cross-VM transfers need the accounts associated first.
- **Single-transaction mega-migrations.** A loop that fits in a 60M-gas Ethereum block can exceed Sei's lower, governance-set block gas limit — paginate.
- **Reaching for CosmWasm for a new project.** It's deprecated for new development per SIP-3 — build on Sei EVM.

## Key docs

| Topic | Link |
| --- | --- |
| EVM overview | https://docs.sei.io/evm/evm-general |
| Foundry on Sei | https://docs.sei.io/evm/evm-foundry |
| Hardhat on Sei | https://docs.sei.io/evm/evm-hardhat |
| Verify contracts (Sourcify/Seiscan) | https://docs.sei.io/evm/evm-verify-contracts |
| Optimizing for parallelization | https://docs.sei.io/evm/best-practices/optimizing-for-parallelization |
| Parallelization engine | https://docs.sei.io/learn/parallelization-engine |
| Precompiles (addresses + examples) | https://docs.sei.io/evm/precompiles/example-usage |
| Accounts & dual addresses | https://docs.sei.io/learn/accounts |
| Account abstraction (Pimlico AA / paymasters) | https://docs.sei.io/evm/wallet-integrations/pimlico |
