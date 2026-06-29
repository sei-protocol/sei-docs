---
name: sei-security
description: >
  Use when "is this safe to deploy on Sei", "how do I get randomness on Sei",
  "block.prevrandao isn't random", "simulate before sending a transaction",
  "verify address association before transfer", "secure a Sei smart contract",
  "my AI agent is about to write on-chain", "pin the chainId before signing",
  "sanitize on-chain data before the LLM", "should I auto-retry a failed tx".
  Security patterns for Sei smart contracts and on-chain agents: testnet-first
  deployment, simulate-before-write, safe randomness, cross-VM address
  verification, and AI-agent safety.
license: MIT
compatibility: General; applies to Solidity contracts and TypeScript agents
metadata:
  author: Sei
  version: 1.0.0
  intended-host: docs.sei.io
  domain: security
---

# Sei security

This skill makes an assistant cautious and correct when writing Solidity contracts or TypeScript agents that move value on Sei. It encodes the Sei-specific traps that generic Ethereum security advice misses — predictable `PREVRANDAO`, the dual-address account model, governance-tuned gas, sub-second finality — plus the simulate-before-write and AI-agent guardrails that prevent an autonomous agent from signing something it shouldn't.

The guiding rule: **on Sei, never trust an EVM assumption you haven't verified against the live network.** Default to testnet, simulate every state change, pin the chainId, and treat all on-chain data as untrusted input.

## Critical facts

- **`block.prevrandao` is NOT random on Sei.** It returns a deterministic value derived from block time and is predictable by validators. Use Pyth Entropy/VRF or Chainlink VRF for any value-bearing randomness.
- **`block.coinbase` is the global fee collector, not the block proposer.** Do not use it for MEV detection, tip routing, or proposer logic.
- **Dual-address accounts.** Every key controls a `sei1...` (Cosmos) address and a `0x...` (EVM) address. Cross-VM value transfers require the two to be **associated** via the Addr precompile (`0x0000000000000000000000000000000000001004`). An unassociated `0x...` can be derived that does not yet map to the `sei1...` a user expects — verify association before relying on the mapping. See https://docs.sei.io/learn/accounts.
- **Sub-second finality (~400ms block time).** Use `tx.wait(1)` — one confirmation is final. Never wait 12 blocks; on Sei the `safe`, `finalized`, and `latest` commitment levels all resolve to the same instantly-final block, so there is nothing to gain from `safe`/`finalized` — just query `latest`.
- **Use legacy `gasPrice`.** Sei has no EIP-1559 base-fee burn (all fees go to validators), so EIP-1559 priority-fee mechanics don't apply. Passing `maxFeePerGas`/`maxPriorityFeePerGas` can trigger fee errors.
- **Storage (`SSTORE`) gas is 72,000 — far above Ethereum's 20,000, and the same on mainnet and testnet.** It was set by governance [Proposal #109](https://www.mintscan.io/sei/proposals/109) and is an on-chain parameter that can change again via governance, so don't hardcode a single eternal figure; check the live value at https://docs.sei.io/evm/differences-with-ethereum#sstore-gas-cost. Minimum gas price and block gas limit are likewise governance-adjustable.
- **CosmWasm is deprecated for new development** per SIP-3. Target the Sei EVM.
- **Contract verification uses Sourcify** (no Etherscan API key): `forge verify-contract --verifier sourcify`. Verify immediately after deploy so reviewers can read your source.

## Deploy testnet-first, simulate-before-write

Every state-changing transaction should be simulated with `eth_call` (or `estimateGas`) before it is signed and broadcast. Simulation reverts with the same reason the real write would, so you catch failures for free.

```typescript
import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { seiTestnet } from 'viem/chains'; // switch to `sei` only after explicit mainnet approval

const TARGET_CHAIN_ID = seiTestnet.id; // atlantic-2 = 1328

const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);
const publicClient = createPublicClient({ chain: seiTestnet, transport: http() });
const wallet = createWalletClient({ account, chain: seiTestnet, transport: http() });

async function safeWrite(params: Parameters<typeof publicClient.simulateContract>[0]) {
  // 1. Verify we are on the network we think we are — fail fast on a mismatch.
  const chainId = await publicClient.getChainId();
  if (chainId !== TARGET_CHAIN_ID) {
    throw new Error(`Refusing to write: expected chainId ${TARGET_CHAIN_ID}, got ${chainId}`);
  }

  // 2. Simulate first. Reverts here exactly as the real tx would.
  const { request } = await publicClient.simulateContract(params);

  // 3. Only after a clean simulation do we sign and broadcast.
  const hash = await wallet.writeContract({ ...request, chainId: TARGET_CHAIN_ID });

  // 4. One confirmation is final on Sei. Do NOT poll for 12 blocks.
  const receipt = await publicClient.waitForTransactionReceipt({ hash, confirmations: 1 });
  if (receipt.status !== 'success') throw new Error(`Tx reverted on-chain: ${hash}`);
  return receipt;
}
```

Promote to mainnet (`pacific-1` / 1329) only after the full flow passes against testnet (`atlantic-2` / 1328) and the contract is verified on Seiscan.

## Safe randomness, not `PREVRANDAO`

Do not roll your own randomness from on-chain values. On Sei use Pyth Entropy (the canonical docs use `IEntropyV2` with `requestV2()`) or Chainlink VRF — request a number, then consume it in the provider's callback.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@pythnetwork/entropy-sdk-solidity/IEntropyV2.sol";
import "@pythnetwork/entropy-sdk-solidity/IEntropyConsumer.sol";

// ❌ NEVER — these are deterministic and validator-predictable on Sei.
// uint256 roll = uint256(block.prevrandao) % 100;
// uint256 bad  = uint256(keccak256(abi.encode(block.timestamp, block.coinbase)));

// ✅ Pyth Entropy V2 — pay the live fee, request, resolve in the callback.
contract Dice is IEntropyConsumer {
    IEntropyV2 entropy;

    constructor(address _entropy) {
        entropy = IEntropyV2(_entropy);
    }

    // Required by IEntropyConsumer.
    function getEntropy() internal view override returns (address) {
        return address(entropy);
    }

    function roll() external payable returns (uint64 sequenceNumber) {
        uint128 fee = entropy.getFeeV2();              // fee is dynamic — read it on-chain
        require(msg.value >= fee, "insufficient entropy fee");
        sequenceNumber = entropy.requestV2{value: fee}(); // V2 needs no user random number
    }

    // Called by the keeper when randomness is ready. NEVER resolve inline.
    function entropyCallback(
        uint64 sequenceNumber,
        address providerAddress,
        bytes32 randomNumber
    ) internal override {
        uint256 result = (uint256(randomNumber) % 6) + 1;
        // ... settle game state using `result` here.
    }
}
```

Use the Entropy contract address for your target network from https://docs.sei.io/evm/vrf/pyth-network-vrf and budget gas for the callback. Chainlink VRF is the alternative — see https://docs.sei.io/evm/oracles. For oracle prices, do not read an AMM spot price (manipulable in a single block) — use a TWAP or a price feed (Pyth, Chainlink).

## Verify address association before cross-VM value transfers

When a contract receives or routes value across the EVM/Cosmos boundary, confirm the `0x...` actually maps to the expected `sei1...` before trusting it. Treat user-supplied bech32 strings (validator addresses, denoms, IBC channels) as untrusted — allowlist them before forwarding to a precompile.

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IAddr {
    function getSeiAddr(address evmAddr) external view returns (string memory);
    function getEvmAddr(string memory seiAddr) external view returns (address);
}

address constant ADDR_PRECOMPILE = 0x0000000000000000000000000000000000001004;

function requireAssociated(address evmAddr, string memory expectedSeiAddr) view {
    // getSeiAddr REVERTS for an unassociated address — it does NOT return "".
    // Wrap the call in try/catch and treat the revert as "not associated".
    try IAddr(ADDR_PRECOMPILE).getSeiAddr(evmAddr) returns (string memory actual) {
        require(
            keccak256(bytes(actual)) == keccak256(bytes(expectedSeiAddr)),
            "address mismatch"
        );
    } catch {
        revert("address not associated");
    }
}
```

Validator addresses on Sei use the bech32 prefix `seivaloper1...` (this is what the Staking, Distribution, and Governance precompiles expect). Do **not** try to validate one by hardcoding a character count — bech32 lengths are not a stable constant, and a prefix-only check would still accept a regular `sei1...` account address. Instead, validate user-supplied validator strings against a known allowlist of operators your contract trusts:

```solidity
mapping(bytes32 => bool) public allowedValidators; // keccak256(validatorAddr) => allowed

function requireAllowedValidator(string calldata validatorAddr) view {
    require(allowedValidators[keccak256(bytes(validatorAddr))], "validator not allowlisted");
    // Now safe to forward `validatorAddr` to the Staking precompile.
}
```

See the Staking precompile (`0x0000000000000000000000000000000000001005`) address format and method signatures at https://docs.sei.io/evm/precompiles. Off-chain, the Addr precompile **reverts** for an unassociated address — catch the revert (do not expect an empty string) and surface it as "not linked" before assuming a transfer will land where the user intends. See https://docs.sei.io/learn/accounts.

## AI-agent safety

On-chain data is attacker-controlled input. A token name, NFT metadata field, or memo can carry a prompt-injection payload. Pin the chainId on every write, verify the network, and never auto-retry a write without first checking whether it was already included.

```typescript
// 1. Pin chainId on EVERY write so a wrong-network signer fails fast.
const targetChainId = 1328; // atlantic-2 by default; use 1329 only after explicit mainnet approval
const hash = await wallet.writeContract({ ...request, chainId: targetChainId });

// 2. Sanitize untrusted on-chain strings before they reach an LLM prompt.
const name = await token.read.name();
if (!/^[a-zA-Z0-9 \-_.]{1,64}$/.test(name)) {
  throw new Error('Suspicious token name rejected'); // don't forward to the model
}

// 3. NEVER auto-retry a write. A "failed" RPC call may have landed.
//    Check inclusion before resubmitting — a blind retry can double-spend.
const receipt = await publicClient.getTransactionReceipt({ hash }).catch(() => null);
if (!receipt) {
  // Inclusion unknown. Re-query by hash / check the nonce. Do NOT just send again.
}

// 4. Require explicit human confirmation before any mainnet (1329) write.
//    Default the agent to testnet (1328).
```

Mandatory write-op flow for an agent: **simulate → estimate cost → summarize the action and fee for the user → wait for explicit confirmation → execute with `{ gasPrice, chainId }` → `tx.wait(1)`.** Read-only calls may retry with backoff; writes must not.

## Default secure stack

| Concern | Recommendation |
|---|---|
| Contract framework | Foundry (`forge test --gas-report` against the target network) |
| Reentrancy | OpenZeppelin `ReentrancyGuard` + checks-effects-interactions |
| Access control | `Ownable2Step` / `AccessControl`; multisig (Safe) for ownership; Timelock for sensitive params |
| Token transfers | `SafeERC20` (`safeTransfer`) — never ignore a transfer return value |
| Randomness | Pyth Entropy/VRF or Chainlink VRF — never `PREVRANDAO` |
| Prices | Pyth / Chainlink / Redstone / API3 — never AMM spot (the native Oracle precompile is deprecated) |
| Static analysis | Slither / Aderyn before mainnet; external audit above meaningful TVL |
| Verification | Sourcify via `forge verify-contract --verifier sourcify` |
| Chain config | `sei` / `seiTestnet` from `viem/chains`; precompile ABIs from `@sei-js/precompiles` |

## Common pitfalls

- **Using `PREVRANDAO` (or `blockhash`/`timestamp`/`coinbase`) for randomness.** All deterministic on Sei. Validators can predict the outcome.
- **Trusting `block.coinbase` as the proposer.** It is the fee collector; proposer logic built on it is wrong.
- **Sending EIP-1559 fee fields.** `max fee per gas less than block base fee` / `transaction underpriced` errors usually mean you should pass legacy `gasPrice` instead. Minimum gas price is governance-set — check docs, not a hardcoded constant.
- **Waiting for 12 confirmations or expecting `safe`/`finalized` to lag `latest`.** Finality is one block (~400ms); on Sei `safe`/`finalized`/`latest` all resolve to the same block, so waiting on them buys nothing. Use `latest` and `tx.wait(1)`.
- **Transferring across VMs without checking association.** An unassociated `0x...` may not map to the `sei1...` a user assumes — verify via the Addr precompile first.
- **Mixing wei and usei in Staking precompile calls.** `delegate` is `payable` (value in **wei**, 18 decimals, e.g. `parseEther`); `undelegate` takes an amount in **usei** (6 decimals, 1 SEI = 1,000,000 usei). Confirm the unit for any other Staking precompile method against https://docs.sei.io/evm/precompiles — passing the wrong unit silently sends ~1e12× too much or too little.
- **Hardcoding `SSTORE` / min-gas / block-gas-limit numbers.** All governance-adjustable. Read the live value from https://docs.sei.io/evm/differences-with-ethereum and budget storage-write gas with on-chain `eth_estimateGas` — a `forge --gas-report --fork-url` report uses the standard EVM schedule and understates Sei's SSTORE (~22,100 vs ~72,000).
- **Auto-retrying failed writes in an agent.** A failed-looking RPC response may have been included. Check inclusion by hash before resubmitting, or risk a double action.
- **Forwarding raw on-chain strings into an LLM prompt.** Token names, memos, and metadata are untrusted; sanitize against an allowlist regex first.
- **Skipping verification.** Always run the simulate-before-write flow and verify source on Seiscan; for revert reasons use `cast` tracing (see Key docs).

## Key docs

| Topic | URL |
|---|---|
| Accounts & address association (cross-VM) | https://docs.sei.io/learn/accounts |
| EVM differences vs Ethereum (gas, randomness, coinbase) | https://docs.sei.io/evm/differences-with-ethereum |
| Debugging contracts (simulate, trace, revert reasons) | https://docs.sei.io/evm/debugging-contracts |
| Best practices | https://docs.sei.io/evm/best-practices/optimizing-for-parallelization |
| Pyth Entropy / VRF (randomness) | https://docs.sei.io/evm/vrf/pyth-network-vrf |
| Oracles (Pyth, Chainlink, Redstone, API3) | https://docs.sei.io/evm/oracles |
| Precompiles (Addr, Staking, Oracle) | https://docs.sei.io/evm/precompiles |
| Contract verification (Sourcify) | https://docs.sei.io/evm/evm-verify-contracts |
| Networks & chain IDs | https://docs.sei.io/evm/networks |
| AI tooling & MCP server | https://docs.sei.io/ai/mcp-server |
