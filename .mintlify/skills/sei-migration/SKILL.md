---
name: sei-migration
description: >
  Use when "port an Ethereum dapp to Sei", "migrate an EVM contract to Sei", "migrate
  from Solana to Sei", "convert an Anchor program to Solidity for Sei", "why does my
  contract behave differently on Sei", "what breaks when I redeploy my Ethereum
  contract on Sei", or "translate Solana concepts like PDAs, CPI, SPL tokens, or rent
  to Sei EVM". Covers both migration paths: the Sei EVM behavioral deltas that break
  naive Ethereum ports (fee model, finality, opcode semantics, SSTORE cost, block
  tags) plus the frontend and deployment updates they require, and the Solana-to-Sei
  concept map with Anchor-to-Solidity translations, toolchain swaps, and OCC
  parallelization guidance.
license: MIT
compatibility: Requires Node.js 18+; Foundry or Hardhat; ethers.js v6, viem, or wagmi for frontends; solc 0.8.x
metadata:
  author: Sei
  version: 1.0.0
  intended-host: docs.sei.io
  domain: migration
---
<!-- GENERATED FROM sei-protocol/sei-skill@0ce5ace — DO NOT EDIT BY HAND.
     Edit the source in sei-skill, then regenerate via scripts/build-mintlify-skills.mjs (see .github/workflows/sync-skills.yml). -->

# Sei migration

This skill makes an agent fluent in migrating existing dApps to Sei along the two common paths. From Ethereum (and other EVM chains): Sei is fully EVM bytecode-compatible, so most contracts deploy unchanged — the work is in the behavioral differences (fee model, finality, opcode semantics, storage costs) that will break a naive port, plus tooling and frontend updates. From Solana: the work is conceptual translation — programs/accounts/PDAs/CPI become contracts, storage, CREATE2, and plain external calls, while the execution profile (parallel, 400 ms blocks) stays familiar. Code examples default to the `atlantic-2` testnet (chain ID `1328`); `pacific-1` mainnet (chain ID `1329`) is the production target.

## Critical facts

- **Networks:** mainnet `pacific-1` = chain ID `1329`, RPC `https://evm-rpc.sei-apis.com`; testnet `atlantic-2` = chain ID `1328`, RPC `https://evm-rpc-testnet.sei-apis.com`. Get testnet SEI at https://docs.sei.io/learn/faucet.
- **400 ms blocks, instant finality:** one block confirmation is final — use `tx.wait(1)`, never `wait(12)` (12 blocks is ~2.5 min on Ethereum but ~4.8 s of pointless waiting on Sei).
- **Block tags:** `safe` and `finalized` are accepted but resolve to the same instantly-final block as `latest`; there is no `pending` tag — use `latest`.
- **Fee model:** no EIP-1559 base-fee burn — 100% of fees go to validators. Prefer legacy `gasPrice`; `maxFeePerGas`/`maxPriorityFeePerGas` can be omitted. The minimum gas price is a governance-set, adjustable value (currently ~50 gwei on mainnet, set by pacific-1 [Proposal #112](https://www.mintscan.io/sei/proposals/112) / atlantic-2 #244; it has changed before — 100 → 10 → 50). Query the live floor with `eth_gasPrice`; never hardcode it.
- **Block gas limit is 12.5 M** (Ethereum: 60 M) — split storage-heavy migration scripts into pageable batches.
- **EVM version is Pectra, without EIP-4844 blobs:** `BLOBHASH`/`BLOBBASEFEE` are unavailable — blob-dependent contracts need refactoring.
- **Cold SSTORE costs 72,000 gas** vs Ethereum's 20,000 — same on mainnet and testnet, set by pacific-1 governance [Proposal #109](https://www.mintscan.io/sei/proposals/109), and governance-adjustable. A `forge --gas-report --fork-url` run applies revm's standard EVM schedule and shows ~22,100, **not** Sei's cost — use a live `eth_estimateGas` against a Sei RPC.
- **`block.prevrandao` is NOT random** on Sei — it is derived from block time. Use [Pyth VRF](https://docs.sei.io/evm/vrf/pyth-network-vrf) or Chainlink VRF.
- **`block.coinbase` is the global fee collector**, not the block proposer.
- **`SELFDESTRUCT` is neutered (EIP-6780):** it only forwards remaining ETH unless it runs in the same transaction that created the contract — replace destroy-based cleanup/upgrade logic with a soft close.
- **Parallel execution (OCC):** Sei runs non-conflicting transactions in parallel automatically and re-runs conflicts — no Solana-style account declarations. Avoid hot global storage keys.
- **Units:** 1 SEI = 1e18 wei (`1 ether`) — not Solana's 1 SOL = 1e9 lamports. There is no rent; storage is permanent.
- **Oracles:** use third-party feeds — Pyth / Chainlink / API3 / RedStone (https://docs.sei.io/learn/oracles). The native Oracle precompile is shut off.
- **Dual addresses:** every account has a `sei1...` (Cosmos) and a `0x...` (EVM) representation — see https://docs.sei.io/learn/accounts.

## Ethereum to Sei: behavioral deltas

| Feature | Sei | Ethereum |
|---|---|---|
| Block time | 400 ms | ~12 s |
| Finality | Instant | ~15 min |
| Gas limit | 12.5 M | 60 M |
| Parallel execution | Yes (OCC) | No |
| Base fee burn | No (100% to validators) | Yes (EIP-1559) |
| EVM version | Pectra (no blobs) | Fusaka |
| Chain ID | 1329 mainnet / 1328 testnet | 1 |

### Fees: use legacy gasPrice

```typescript
// EIP-1559 style — may not behave as expected on Sei (no base fee burn)
const bad = await contract.myFunction({
  maxFeePerGas: parseUnits("20", "gwei"),
  maxPriorityFeePerGas: parseUnits("1", "gwei"),
});

// Preferred: legacy gasPrice — read the live floor, don't bake in a number
const tx = await contract.myFunction({
  gasPrice: await provider.send("eth_gasPrice", []), // >= governance floor (~50 gwei mainnet)
});
```

### Finality and block tags

```typescript
const receipt = await tx.wait(1);               // 1 block ~= 400ms — fully final
const head = await provider.getBlock("latest"); // "safe"/"finalized" resolve to this same block; no "pending"
```

### Opcode semantics

```solidity
// DANGEROUS — PREVRANDAO on Sei is derived from block time, not random.
uint256 rand = uint256(block.prevrandao) % 100;  // use Pyth VRF or Chainlink VRF instead

// Wrong — block.coinbase on Sei is the global fee collector, not the block proposer.
address proposer = block.coinbase;

// Don't rely on SELFDESTRUCT to remove a contract — it won't (EIP-6780). Soft close instead:
bool public closed;
modifier notClosed() { require(!closed, "closed"); _; }
```

### SSTORE: batch in memory, write once

```solidity
// Bad: cold SSTORE per iteration — 72,000 gas each on Sei
function updateAll(address[] calldata users, uint256[] calldata amounts) external {
    for (uint i = 0; i < users.length; i++) {
        balances[users[i]] = amounts[i];
    }
}

// Good: accumulate in memory, single storage write
function processAndStore(uint256[] calldata items) external {
    uint256 total = 0;
    for (uint i = 0; i < items.length; i++) {
        total += items[i];
    }
    storedTotal = total;
}
```

Check the live parameter values at https://docs.sei.io/evm/differences-with-ethereum and estimate real per-transaction costs with `eth_estimateGas`.

### Contract migration checklist

```
[ ] Remove maxFeePerGas / maxPriorityFeePerGas usage -> legacy gasPrice
[ ] Remove PREVRANDAO randomness -> integrate a VRF oracle
[ ] Check COINBASE usage — it does not return the block proposer
[ ] Check for blob opcodes (BLOBHASH, BLOBBASEFEE) — not available
[ ] Refactor SELFDESTRUCT cleanup -> soft-close pattern (EIP-6780)
[ ] Audit SSTORE patterns — cache in memory before writing (72k gas per cold write)
[ ] Drop waits on "safe"/"finalized" -> tx.wait(1)
[ ] Test on atlantic-2 testnet before mainnet
```

## Frontend migration (Ethereum dApps)

```typescript
// Wagmi/viem chain config — registers both Sei networks
import { sei, seiTestnet } from 'viem/chains';

export const config = createConfig({
  chains: [sei, seiTestnet],
  transports: {
    [sei.id]: http('https://evm-rpc.sei-apis.com'),
    [seiTestnet.id]: http('https://evm-rpc-testnet.sei-apis.com'),
  },
});
```

```typescript
// Submissions — always pin chainId to prevent wrong-network submissions
const gasPrice = await publicClient.getGasPrice(); // eth_gasPrice — live governance floor
const txHash = await writeContractAsync({
  ...contractArgs,
  gasPrice,
  chainId: 1328, // atlantic-2 testnet; 1329 = pacific-1 mainnet
});
```

```typescript
// Multi-confirmation spinner UX is obsolete
await tx.wait(1);
setStatus("Success!"); // ~400ms after broadcast

// "block" events fire every 400ms on Sei (vs every 12s on Ethereum) — throttle handlers
let lastProcessed = 0;
provider.on("block", (blockNumber) => {
  if (blockNumber - lastProcessed < 5) return;
  lastProcessed = blockNumber;
  handler(blockNumber);
});
```

## Deploy, verify, test (both paths)

```bash
# Foundry — deploy to atlantic-2 testnet
forge create \
  --rpc-url https://evm-rpc-testnet.sei-apis.com \
  --private-key $PRIVATE_KEY \
  src/MyContract.sol:MyContract

# Verify on Seiscan via Sourcify — no API key required
forge verify-contract \
  --chain-id 1328 \
  --verifier sourcify \
  $CONTRACT_ADDRESS \
  src/MyContract.sol:MyContract

# Hardhat — deploy to Sei testnet
npx hardhat run scripts/deploy.ts --network seiTestnet

# Run your existing test suite against a testnet fork
forge test --fork-url https://evm-rpc-testnet.sei-apis.com -vvv
```

For production, repeat against `pacific-1` (chain ID `1329`, `https://evm-rpc.sei-apis.com`). Setup guides: https://docs.sei.io/evm/evm-foundry, https://docs.sei.io/evm/evm-hardhat, https://docs.sei.io/evm/evm-verify-contracts.

## Solana to Sei: concept map

Sei gives Solana developers a familiar execution profile — optimistic parallel execution (OCC, analogous to Sealevel), 400 ms blocks, and instant single-block finality (vs Solana's ~2.5-4.5 second finality) — plus the EVM ecosystem: Foundry, Hardhat, OpenZeppelin, audited contracts, liquidity.

| Solana | Sei EVM | Key difference |
|---|---|---|
| Program (stateless executable) | Smart contract | Contract holds both code and state |
| Account (external data store) | Contract storage | State lives inside the contract |
| PDA | CREATE2 deterministic address | Derived with keccak256, not SHA256 |
| CPI | External contract call | Just `Contract(addr).method()` |
| SPL Token | ERC-20 | No Associated Token Accounts |
| NFT (Metaplex) | ERC-721 / ERC-1155 | Standard OpenZeppelin implementations |
| Sysvars (clock, rent, ...) | `block.timestamp`, `block.number` | Built-in globals, no imports |
| Compute Units | Gas | Both measure computational work |
| Lamports (1 SOL = 1e9) | Wei (1 SEI = 1e18) | Use `1 ether`, not 1e9 |
| Rent / rent exemption | None | No rent — storage is permanent |
| Priority fee | Gas price | Higher gasPrice = faster inclusion |
| Anchor | Foundry / Hardhat | Foundry feels most similar |
| Solana CLI | seid CLI | — |
| `solana-test-validator` | `anvil --fork-url https://evm-rpc-testnet.sei-apis.com` | Local dev node |
| `@solana/web3.js` | ethers.js v6 / viem | Core SDK |
| `@coral-xyz/anchor` | TypeChain | Type-safe contract bindings |
| `@solana/wallet-adapter` | Wagmi + `@sei-js/sei-global-wallet` | Wallet connection |
| Phantom / Solflare | MetaMask / Compass / Sei Global Wallet | Wallets |
| Solana Explorer | Seiscan (https://seiscan.io) | Explorer |

### Program to contract

```solidity
// Anchor state accounts move inside the contract; constructor replaces initialize
pragma solidity ^0.8.28;

contract Counter {
    uint256 public count;
    address public authority;

    constructor() {
        count = 0;
        authority = msg.sender; // Signer validation is implicit — msg.sender is always authenticated
    }

    function increment() external {
        count += 1;
    }
}
```

No account space allocation (storage grows dynamically), no explicit `Signer` checks, no system program imports.

### CPI to interface call; SPL to ERC-20

```solidity
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Replaces a CPI to the token program — no account plumbing
IERC20(tokenAddress).transferFrom(msg.sender, recipient, amount);
```

```solidity
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyToken is ERC20 {
    constructor() ERC20("MyToken", "MTK") {
        _mint(msg.sender, 1_000_000 * 10**18);
    }
}
```

No Associated Token Accounts, no mint authority keys; approvals via `approve()` / `transferFrom()`.

### PDA to mapping or CREATE2

```solidity
// Usually a mapping replaces the PDA pattern entirely:
mapping(address => Vault) public vaults;

// For deterministic deployment addresses (the PDA analog), use CREATE2:
bytes32 salt = keccak256(abi.encodePacked("vault", user));
address vaultAddr = address(uint160(uint256(keccak256(abi.encodePacked(
    bytes1(0xff), factory, salt, keccak256(bytecode)
)))));
```

### Errors, events, access control

```solidity
// Anchor #[error_code] -> Solidity custom errors (gas efficient)
error InsufficientBalance(uint256 available, uint256 required);
error Unauthorized();

// Anchor #[event] / emit! -> Solidity events; up to 3 params can be indexed
event Trade(address indexed trader, uint256 amount);

// Stored-authority checks -> OpenZeppelin Ownable
import "@openzeppelin/contracts/access/Ownable.sol";
contract MyContract is Ownable {
    constructor() Ownable(msg.sender) {}
    function adminAction() external onlyOwner { }
}
```

### Frontend swap

```typescript
// @solana/web3.js + Anchor -> ethers.js v6 (atlantic-2 testnet)
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider('https://evm-rpc-testnet.sei-apis.com');
const contract = new ethers.Contract(contractAddress, abi, signer);
const value = await contract.value();
const tx = await contract.increment({ gasPrice: await provider.send("eth_gasPrice", []) });
await tx.wait(1); // instant finality
```

Fee estimation drops the rent component entirely:

```typescript
const gasLimit = 200_000n;
const gasPrice = parseUnits("50", "gwei"); // ~50 gwei floor on mainnet; query eth_gasPrice for the live value
const fee = gasLimit * gasPrice;           // no rent, no minimum balance, no account closure
```

### Solana migration checklist

```
[ ] Install Foundry (curl -L https://foundry.paradigm.xyz | bash && foundryup)
[ ] Translate program accounts -> Solidity storage variables
[ ] Replace explicit Signer checks -> msg.sender; CPI -> external calls; SPL -> ERC-20 (OpenZeppelin)
[ ] Remove rent-exemption checks and account declarations — not needed on Sei
[ ] Replace Anchor error codes -> Solidity custom errors
[ ] Frontend: @solana/web3.js -> ethers.js or viem; wallet-adapter -> wagmi + @sei-js/sei-global-wallet
[ ] Use gasPrice via eth_gasPrice (not EIP-1559 fields); use tx.wait(1)
[ ] Test on atlantic-2 first (faucet: https://docs.sei.io/learn/faucet)
```

## Parallelization: explicit vs automatic

On Solana you declare every account a transaction will touch so the runtime can schedule it. On Sei you write normal Solidity — the OCC engine detects which storage slots are touched, runs non-conflicting transactions in parallel, and re-runs conflicts.

```solidity
// No account declarations — OCC parallelizes non-conflicting swaps automatically
function swap(address tokenIn, address tokenOut, uint256 amountIn) external {
    IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);
    uint256 amountOut = calculateOutput(amountIn);
    IERC20(tokenOut).transfer(msg.sender, amountOut);
}
```

To maximize parallel throughput, avoid shared global counters — partition state by user or position ID. Playbook: https://docs.sei.io/evm/best-practices/optimizing-for-parallelization; engine internals: https://docs.sei.io/learn/parallelization-engine.

## Ecosystem contracts on Sei

| Contract | Address |
|---|---|
| Multicall3 | `0xcA11bde05977b3631167028862bE2a173976CA11` |
| Permit2 | `0xB952578f3520EE8Ea45b7914994dcf4702cEe578` |
| CREATE2 Factory | `0x0000000000FFe8B47B3e2130213B802212439497` |
| USDC (mainnet) | `0xe15fC38F6D8c56aF07bbCBe3BAf5708A2Bf42392` |
| USDC (testnet) | `0x4fCF1784B31630811181f670Aea7A7bEF803eaED` |

Once migrated, optional Sei-native upgrades: precompiles expose staking, governance, and IBC to Solidity (https://docs.sei.io/evm/precompiles/example-usage), and pointer contracts make your ERC-20 usable from Cosmos wallets (https://docs.sei.io/learn/pointers).

## Common pitfalls

- **Waiting for 12 confirmations.** Sei is final in one block (~400 ms); `tx.wait(12)` and "waiting for confirmations..." UX just stall. Use `tx.wait(1)`.
- **Expecting `safe`/`finalized`/`pending` to behave like Ethereum's.** `safe` and `finalized` resolve to the same block as `latest`, and there is no `pending` tag.
- **Hardcoding a gas price or relying on EIP-1559 priority mechanics.** There is no base-fee burn, and the governance floor has already changed (100 → 10 → 50 gwei) — query `eth_gasPrice`.
- **Trusting `block.prevrandao` for randomness.** It is derived from block time on Sei — use Pyth VRF or Chainlink VRF.
- **Reading the proposer from `block.coinbase`.** It returns the global fee collector.
- **Shipping blob-dependent code.** `BLOBHASH`/`BLOBBASEFEE` are unavailable (Pectra without EIP-4844 blobs).
- **Relying on SELFDESTRUCT cleanup.** EIP-6780 semantics: it only forwards remaining ETH unless run in the creating transaction — use a soft-close flag.
- **Budgeting 20,000 gas per storage write.** A cold SSTORE is 72,000 gas on Sei (both networks), and a `forge --gas-report --fork-url` report shows ~22,100 because revm applies the standard schedule — estimate with `eth_estimateGas` or storage-heavy designs will surprise you in production.
- **Single-transaction mega-migrations.** A loop that fits Ethereum's 60 M-gas block exceeds Sei's 12.5 M limit — paginate.
- **Sizing amounts in lamports.** 1 SEI = 1e18 wei (`1 ether`), not 1e9.
- **Re-implementing Solana ownership checks or `accounts[]` parameters.** `msg.sender` is always authenticated, and OCC needs no declared account lists — write normal Solidity.
- **Keeping rent-exemption logic.** There is no rent on Sei; storage is permanent, with no minimum balance or account closure.
- **Hot global counters.** A `totalVolume += amount` on every call makes all callers conflict under OCC and serialize — partition state per user/position.
- **Calling the native Oracle precompile.** It is shut off — integrate Pyth, Chainlink, API3, or RedStone instead.

## Key docs

| Topic | Link |
| --- | --- |
| Migrating from other EVMs | https://docs.sei.io/evm/migrate-from-other-evms |
| Migrating from Solana | https://docs.sei.io/evm/migrate-from-solana |
| Differences from Ethereum (live chain params) | https://docs.sei.io/evm/differences-with-ethereum |
| Networks, chain IDs, RPC endpoints | https://docs.sei.io/evm/networks |
| Foundry on Sei | https://docs.sei.io/evm/evm-foundry |
| Hardhat on Sei | https://docs.sei.io/evm/evm-hardhat |
| Verify contracts (Sourcify/Seiscan) | https://docs.sei.io/evm/evm-verify-contracts |
| Optimizing for parallelization | https://docs.sei.io/evm/best-practices/optimizing-for-parallelization |
| Oracles (Pyth/Chainlink/API3/RedStone) | https://docs.sei.io/learn/oracles |
| Pyth VRF (randomness) | https://docs.sei.io/evm/vrf/pyth-network-vrf |
| Accounts and dual addresses | https://docs.sei.io/learn/accounts |
| Pointer contracts | https://docs.sei.io/learn/pointers |
| Testnet faucet | https://docs.sei.io/learn/faucet |
