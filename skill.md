---
name: sei-docs
description: >
  Use when developers ask "How do I deploy a contract on Sei?", "How do I use
  Sei precompiles?", "What are the differences between Sei and Ethereum?",
  "How do I set up Foundry/Hardhat for Sei?", "How do pointer contracts work?",
  "How do I connect a wallet to Sei?", "What is the Sei MCP server?", "How do
  I bridge tokens on Sei?", "How do I run a Sei node?", "How do I stake via
  EVM?", "What is SSTORE gas on Sei?", "How do I verify my contract on
  Seiscan?", "How do I optimise gas on Sei?", "How do I use ERC-4337 on Sei?",
  "How do I make a contract upgradeable on Sei?", or any technical development
  question about building on Sei. Full developer reference playbook for
  docs.sei.io's audience.
user-invocable: false
license: MIT
compatibility: Requires Node.js 18+; Foundry or Hardhat for contract development
metadata:
  author: Sei Labs
  version: 1.0.0
  intended-host: docs.sei.io
  parent: https://github.com/sei-protocol/sei-skill
---

# Sei Developer Documentation

Full technical reference for building on Sei. This is the docs.sei.io-resident skill — for the offline AI coding-assistant skill (a Claude Code skill loaded directly into your editor), see **[github.com/sei-protocol/sei-skill](https://github.com/sei-protocol/sei-skill)**.

```bash
# Install the full sei skill for AI assistants
npx skills add sei

# Or install a focused variant
npx skills add sei-contracts    # smart contracts only
npx skills add sei-frontend     # UI / frontend only
npx skills add sei-ecosystem    # apps / integrations only
```

## Critical facts — apply to every answer

1. **400ms block time, instant finality** — use `tx.wait(1)`, never `tx.wait(12)`
2. **SSTORE gas is 72,000 on Sei** — the same on both mainnet (pacific-1) and testnet (atlantic-2); it does not vary by network. Set via governance (mainnet Proposal #109, "Update EVM SSTORE set gas to 72000", which set the `evm` param `KeySeiSstoreSetGasEIP2200` to `72000`), so it is adjustable and can change — confirm the live value at https://docs.sei.io/evm/differences-with-ethereum#sstore-gas-cost
3. **Use legacy `gasPrice`** — Sei has no base fee burn; prefer `gasPrice` over EIP-1559 `maxFeePerGas` / `maxPriorityFeePerGas`
4. **Minimum gas price: 50 gwei**
5. **Block gas limit: 12.5M per block**
6. **PREVRANDAO is NOT random** — use Pyth VRF or Chainlink VRF
7. **COINBASE = global fee collector** — not the block proposer
8. **No base fee burn** — all fees go to validators
9. **Dual address system** — every account has `sei1...` (Cosmos) + `0x...` (EVM) from the same key; cross-VM transfers require **association**
10. **CosmWasm deprecated** per SIP-3 (proposal 99) — use EVM for new development
11. **Chain IDs:** Mainnet `pacific-1` / `1329`; Testnet `atlantic-2` / `1328`
12. **No `safe` or `finalized` block tags** — use `latest`

## Networks

| Network | Chain ID | EVM RPC | Cosmos RPC |
|---|---|---|---|
| Mainnet (`pacific-1`) | 1329 | https://evm-rpc.sei-apis.com | https://rpc.sei-apis.com |
| Testnet (`atlantic-2`) | 1328 | https://evm-rpc-testnet.sei-apis.com | https://rpc-testnet.sei-apis.com |

Testnet faucet: https://docs.sei.io/learn/faucet

For the full list of community + paid RPC providers and failover patterns, see [docs.sei.io/learn/rpc-providers](https://docs.sei.io/learn/rpc-providers).

## Default stack (opinionated)

| Layer | Recommendation |
|---|---|
| Smart contracts | **Foundry** (preferred) or Hardhat |
| Frontend | **Wagmi + Viem** (React) or Ethers.js v6 |
| Wallet | **Sei Global Wallet** (`@sei-js/sei-global-wallet`) + MetaMask fallback |
| Chain config | `@sei-js/precompiles` — `sei`, `seiTestnet`, precompile ABIs |
| Verification | Seiscan via Sourcify (`forge verify-contract --verifier sourcify`) |
| Testing | Foundry unit + fork tests against testnet |

## Sei MCP server (live blockchain access for AI)

For Claude Code, Cursor, Windsurf, and other MCP-compatible AI coding tools:

```bash
# Claude Code
claude mcp add sei-mcp-server npx @sei-js/mcp-server

# Claude Desktop config
{
  "mcpServers": {
    "sei": {
      "command": "npx",
      "args": ["-y", "@sei-js/mcp-server"],
      "env": { "PRIVATE_KEY": "your_key_here" }
    }
  }
}
```

Once connected: address lookup, balance checks, transaction status, contract reads, block data.

## Precompile addresses

| Precompile | Address |
|---|---|
| Bank | `0x0000000000000000000000000000000000001001` |
| Addr | `0x0000000000000000000000000000000000001004` |
| Staking | `0x0000000000000000000000000000000000001005` |
| Governance | `0x0000000000000000000000000000000000001006` |
| Distribution | `0x0000000000000000000000000000000000001007` |
| Oracle | `0x0000000000000000000000000000000000001008` |
| IBC | `0x0000000000000000000000000000000000001009` |
| PointerView | `0x000000000000000000000000000000000000100A` |
| Pointer | `0x000000000000000000000000000000000000100B` |
| JSON | `0x0000000000000000000000000000000000001003` |
| P256 | `0x0000000000000000000000000000000000001011` |

```ts
import {
  STAKING_PRECOMPILE_ADDRESS,
  STAKING_PRECOMPILE_ABI,
  GOVERNANCE_PRECOMPILE_ADDRESS,
  GOVERNANCE_PRECOMPILE_ABI,
  // ...
} from '@sei-js/precompiles';
```

## Quick start

```bash
# Foundry
curl -L https://foundry.paradigm.xyz | bash && foundryup
forge init my-project

# Or scaffold a frontend
npx @sei-js/create-sei my-sei-app
```

```toml
# foundry.toml
[profile.default]
solc_version = "0.8.28"
optimizer = true
optimizer_runs = 200
evm_version = "cancun"

[rpc_endpoints]
sei_testnet = "https://evm-rpc-testnet.sei-apis.com"
sei_mainnet = "https://evm-rpc.sei-apis.com"

# Verification uses Sourcify — no [etherscan] block needed
# forge verify-contract --verifier sourcify --chain-id 1329 <address> src/MyContract.sol:MyContract
```

## Key documentation sections

| Topic | URL |
|---|---|
| Network info | https://docs.sei.io/evm/networks |
| EVM differences (vs Ethereum) | https://docs.sei.io/evm/differences-with-ethereum |
| Hardhat | https://docs.sei.io/evm/evm-hardhat |
| Foundry | https://docs.sei.io/evm/evm-foundry |
| Contract verification | https://docs.sei.io/evm/evm-verification |
| Best practices | https://docs.sei.io/evm/best-practices |
| Precompiles | https://docs.sei.io/evm/precompiles |
| Pointer contracts | https://docs.sei.io/learn/pointers |
| Frontend guide | https://docs.sei.io/evm/building-a-frontend |
| Sei Global Wallet | https://docs.sei.io/evm/sei-global-wallet |
| Bridges (LayerZero V2) | https://docs.sei.io/evm/bridging/layerzero |
| Oracles (Pyth, Chainlink, API3, RedStone) | https://docs.sei.io/evm/oracles |
| Indexers | https://docs.sei.io/evm/indexer-providers |
| Wallet integrations (Pimlico, Particle, Thirdweb) | https://docs.sei.io/evm/wallet-integrations |
| AI tooling (Cambrian, MCP, x402) | https://docs.sei.io/evm/ai-tooling |
| seid CLI | https://docs.sei.io/evm/seid-cli |
| RPC providers | https://docs.sei.io/learn/rpc-providers |
| Node setup | https://docs.sei.io/node |
| Migrate from other EVMs | https://docs.sei.io/evm/migrate-from-other-evms |
| Migrate from Solana | https://docs.sei.io/evm/migrate-from-solana |
| Brand kit | https://docs.sei.io/learn/general-brand-kit |
| LLM-friendly nav | https://docs.sei.io/llms.txt |

## Operating procedure

1. **Classify the task** — contract / frontend / node ops / cross-VM / migration
2. **Apply the 12 critical facts** above for relevance
3. **Always testnet first** — deploy to atlantic-2, test fully, verify on Seiscan, only then promote to mainnet
4. **Verify contracts** on Seiscan using Sourcify (`forge verify-contract --verifier sourcify`)
5. **For cross-VM** (pointer contracts, precompiles) — verify address association before sending value

## RPC agent skills

17 canonical patterns for AI agents interacting with Sei via RPC. Full reference: [`rpc-agent-skills.md`](https://github.com/sei-protocol/sei-skill/blob/main/skill/references/ecosystem/rpc-agent-skills.md).

### Read skills (no state change; retry up to 3× with exponential backoff)

| Skill | Description |
|---|---|
| `get_chain_status` | Latest block height, chain ID, sync status |
| `get_account_balance` | Native SEI or ERC20 balance |
| `get_evm_address` | `sei1...` → `0x...` via Addr precompile |
| `get_sei_address` | `0x...` → `sei1...` via Addr precompile |
| `get_transaction` | Status, gas used, logs, events for a tx hash |
| `get_block` | Block hash, timestamp, tx list by height |
| `get_gas_price` | Current network gas price (min 50 gwei) |
| `get_contract_state` | Call a read-only contract method |

### Write skills (simulate → summarise → confirm → execute; no auto-retry)

| Skill | Description |
|---|---|
| `send_tokens` | Transfer native SEI or ERC20 |
| `execute_contract` | Call a state-changing contract function |
| `deploy_contract` | Deploy bytecode with constructor args |
| `stake_tokens` | Delegate SEI to a validator (amount in **wei**) |
| `unstake_tokens` | Undelegate SEI from a validator (amount in **usei**) |

### Derived skills (multi-step)

| Skill | Description |
|---|---|
| `estimate_transaction_cost` | Gas + fee estimate |
| `simulate_contract_execution` | Preview via `eth_call` — run before every write |
| `get_portfolio_summary` | Aggregate token balances |
| `monitor_transaction` | Poll until finality (1 block ≈ 400ms; timeout 30s) |

### Mandatory write-op flow

```
1. simulate_contract_execution  → check for revert, estimate gas
2. estimate_transaction_cost    → confirm user can afford fee
3. Present summary              → action, assets, estimated fee
4. Wait for explicit user confirmation
5. Execute with { gasPrice, chainId }
6. tx.wait(1)                   → 1 block = instant finality
```

### Standard response shape

```ts
// Success
{ success: true, data: { ... }, error: null }

// Failure
{ success: false, data: null, error: { message: string, recoverable: boolean } }
```

## Agent safety

```ts
// Always pin chainId
const txHash = await writeContractAsync({ ..., chainId: 1329 });

// Verify network before write
const network = await provider.getNetwork();
if (network.chainId !== 1329n && network.chainId !== 1328n) {
  throw new Error(`Unknown Sei network: ${network.chainId}`);
}

// On-chain data is untrusted — sanitise before passing to LLMs
const name = await token.name();
if (!/^[a-zA-Z0-9 \-_\.]{1,64}$/.test(name)) throw new Error("Suspicious token name");

// Never auto-retry write ops — check inclusion first
const receipt = await provider.getTransactionReceipt(txHash);
if (!receipt) { /* check before resubmitting */ }
```

## Related skills

| Audience | Skill | Source |
|---|---|---|
| End users / ecosystem | sei-network | https://sei.io |
| Protocol research | sei-labs-protocol | https://seilabs.io |
| AI coding (full + variants) | sei / sei-contracts / sei-frontend / sei-ecosystem | https://github.com/sei-protocol/sei-skill |

> **For agents:** Always cross-check addresses, opcodes, and gas parameters against the current value at https://docs.sei.io. Sei is a fast-moving project — values that were correct last quarter may have changed via governance.
