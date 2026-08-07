---
# GENERATED FROM sei-protocol/sei-skill@0ce5ace — DO NOT EDIT BY HAND.
# Edit the source in sei-skill, then regenerate via scripts/build-mintlify-skills.mjs
# (see .github/workflows/sync-skills.yml).
name: sei-bridges
description: >
  Use when "bridge assets to Sei", "bridge assets from Sei", "launch an omnichain token on Sei",
  "deploy a LayerZero OFT on Sei", "send a cross-chain message with LayerZero", "get native USDC
  onto Sei", "use CCTP with Sei", "bridge with Wormhole on Sei", "IBC transfer to Sei", "why is
  inbound IBC disabled on Sei", or "move legacy ibc/ assets off Sei". Covers choosing and
  integrating Sei's documented EVM bridges — LayerZero V2 (OFT/OApp) and Circle CCTP v2 (native
  USDC) — plus the verify-first status of Wormhole, end-user bridge UIs, and the SIP-3
  legacy/exit-only state of IBC and Cosmos-side assets.
license: MIT
compatibility: Requires Node.js 18+; ethers v6 and/or viem; Foundry or Hardhat with solc 0.8.22+ for OFT contracts; seid CLI only for legacy IBC exit flows
metadata:
  author: Sei
  version: 1.0.0
  intended-host: docs.sei.io
  domain: bridges
---

# Sei bridges

This skill makes an agent fluent in moving assets and messages between Sei and other chains: picking the right bridge per asset, deploying LayerZero V2 OFTs, moving native USDC with Circle CCTP v2, handling Wormhole's verify-first status, pointing end users at the official bridge UI, and exiting legacy IBC-era assets under SIP-3. The EVM bridges Sei documents and recommends are **LayerZero V2** (Sei is a full LayerZero V2 endpoint) and **Circle CCTP v2** (native USDC); the official UI is the Sei bridge dashboard / Thirdweb. Pick the bridge by the asset, not by habit.

## Critical facts

- **Networks:** test the full round trip on testnet `atlantic-2` (chainId `1328`) first; mainnet is `pacific-1` (chainId `1329`), the production target.
- **Documented EVM bridges:** LayerZero V2 (OFT for tokens, OApp for arbitrary messaging) and Circle CCTP v2 (native USDC). End-user UI: https://dashboard.sei.io/bridge.
- **Sei LayerZero Endpoint IDs (EIDs): mainnet `30280`, testnet `40455`.** Read the EndpointV2 address and all protocol contracts from https://docs.layerzero.network/v2/deployments/deployed-contracts?chains=sei — do not hardcode them from memory.
- **Inbound IBC is disabled under SIP-3:** pacific-1 [Proposal 116](https://www.mintscan.io/sei/proposals/116) disables inbound IBC transfers and [Proposal 115](https://www.mintscan.io/sei/proposals/115) freezes new CosmWasm; the atlantic-2 equivalents are **#247** (Disable IBC Inbound) and **#246** (Disable CosmWasm Uploads). IBC assets from Cosmos chains can no longer arrive on Sei — treat IBC as legacy/exit-only.
- **Wormhole is verify-first, not documented by Sei.** Wormhole's supported-networks list shows a SeiEVM entry (chain id 1329) with NTT, WTT, and CCTP routing on mainnet, but Sei's own docs provide no Wormhole EVM integration guide. The Wormhole *CosmWasm* side on Sei is legacy/exit-only.
- **USDC is 6 decimals on Sei** (`parseUnits(value, 6)`); CCTP's `mintRecipient` is the `0x...` Sei address left-padded to bytes32; Sei's Circle domain ID comes from Circle's supported-chains table — verify, do not hardcode.
- **EVM bridges take `0x...` addresses on the Sei side.** Never pass `sei1...` addresses to LayerZero or CCTP.
- **Use legacy `gasPrice` for Sei-side claim/redeem/mint transactions.** Sei has no EIP-1559 base-fee burn — set a single `gasPrice`, not `maxFeePerGas`/`maxPriorityFeePerGas`. The minimum gas price is governance-adjustable (currently ~50 gwei on mainnet — query `eth_gasPrice` for the live floor); an under-priced redemption just sits in the mempool. See https://docs.sei.io/evm/differences-with-ethereum.
- **Sei's destination-side finality is ~1 block** — use `tx.wait(1)`. End-to-end bridge time is dominated by the source chain's finality plus the bridge's attestation, not by Sei.
- **CosmWasm is deprecated for new development (SIP-3).** Deploy ERC-20 / OFT contracts directly; pointer contracts and the IBC precompile are legacy migration tooling.
- **Always verify bridge contract addresses, EIDs, and CCTP domain IDs** against each bridge's official docs and on [Seiscan](https://seiscan.io) before sending real value. Bridges are high-value targets and addresses change across version upgrades.

## Which bridge? (decision matrix)

| You have / want | Use | Mechanism |
|---|---|---|
| A **new token** native on Sei + other chains | **LayerZero V2 OFT** | burn-and-mint, one canonical supply, no wrapped IOU |
| **Native USDC** moved onto/off Sei | **Circle CCTP v2** | burn-and-mint native USDC, fewest trust assumptions |
| An **existing asset** only Wormhole covers (some Solana-native tokens) | **Wormhole** NTT/WTT — *verify first* | wrapped / native-token transfer |
| **Arbitrary cross-chain messages** / calls + transfers | **LayerZero** (OApp) | GMP via Sei's LayerZero V2 endpoint |
| **End users** bridging in a UI, no integration | **Sei bridge dashboard** / Thirdweb | aggregated routing |
| Assets **from a Cosmos chain via IBC** | **Not available inbound** (SIP-3) | bridge via an EVM route instead |

## LayerZero V2 (OFT + messaging)

Live on Sei mainnet and testnet — Sei is fully integrated as a LayerZero V2 endpoint. An OFT exists natively on Sei + other chains; cross-chain sends burn on the source and mint on the destination. Scaffold with `npx create-lz-oapp@latest` (choose the OFT example), deploy the same contract on each chain pointing at that chain's endpoint, then wire the peers.

```solidity
// MyOFT.sol — same contract deploys on Sei and every other chain.
pragma solidity ^0.8.22;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { OFT } from "@layerzerolabs/oft-evm/contracts/OFT.sol";

contract MyOFT is OFT {
    // `endpoint` is the LayerZero EndpointV2 address for the chain you deploy on
    // (Sei testnet EID 40455 / mainnet EID 30280) — read it from the deployments page.
    constructor(string memory name, string memory symbol, address endpoint, address owner)
        OFT(name, symbol, endpoint, owner) Ownable(owner) {}
}
```

Wire peers, quote the fee, then send — the cross-chain fee is paid in native gas and must be quoted first:

```ts
import { Options, addressToBytes32 } from "@layerzerolabs/lz-v2-utilities";
import { parseUnits } from "ethers";

// Tell Sei's OFT about the peer on the other chain (and vice versa on that chain).
await seiOft.setPeer(DST_EID, addressToBytes32(remoteOftAddress));

const options = Options.newOptions().addExecutorLzReceiveOption(80_000n, 0n).toHex();
const sendParam = {
  dstEid: DST_EID,
  to: addressToBytes32(recipient0x),   // 0x recipient on the destination chain
  amountLD: parseUnits("100", 18),
  minAmountLD: parseUnits("99", 18),   // slippage floor
  extraOptions: options,
  composeMsg: "0x",
  oftCmd: "0x",
};

const { nativeFee } = await seiOft.quoteSend(sendParam, false); // quote BEFORE sending
const tx = await seiOft.send(sendParam, { nativeFee, lzTokenFee: 0n }, refund0x, { value: nativeFee });
await tx.wait(1); // one confirmation — Sei finalizes fast
```

For an *already-deployed* ERC-20 you can't reissue, use an **OFT Adapter** (locks the existing token instead of minting) rather than `OFT`. If `quoteSend` reverts, the pathway/DVNs aren't wired; review the DVN set your pathway uses before mainnet. Full walkthrough, EIDs, and deployed contracts: https://docs.sei.io/evm/bridging/layerzero and https://docs.layerzero.network/v2.

## Native USDC via Circle CCTP v2

CCTP moves *native* USDC (no wrapper): burn on the source chain, Circle attests off-chain, mint on Sei.

```ts
import { parseUnits, pad } from "viem";

// 1) Approve + burn on the SOURCE chain. SEI_DOMAIN comes from Circle's CCTP
//    supported-chains/domain table — verify, do not hardcode.
const amount = parseUnits("100", 6); // 100 USDC, 6 decimals
await sourceUsdc.write.approve([TOKEN_MESSENGER, amount]);
await sourceTokenMessenger.write.depositForBurn([
  amount,
  SEI_DOMAIN,                            // Circle domain id for Sei
  pad(seiRecipient0x, { size: 32 }),     // mintRecipient as bytes32
  sourceUsdcAddress,
]);

// 2) Poll Circle's attestation API, then mint on Sei — confirms in ~one Sei block.
const hash = await seiMessageTransmitter.write.receiveMessage([message, attestation]);
await seiClient.waitForTransactionReceipt({ hash, confirmations: 1 });
```

End-to-end time is dominated by **source-chain** finality + Circle's attestation (often 15+ min), independent of Sei's sub-second finality. Test on atlantic-2 first — get testnet USDC from the Circle Faucet (https://faucet.circle.com). Contract addresses and domain IDs: https://developers.circle.com/cctp. USDC on Sei: https://docs.sei.io/evm/usdc-on-sei.

## Wormhole (verify first — not documented by Sei)

- Wormhole's supported-networks list (https://wormhole.com/docs/products/reference/supported-networks/) shows a **SeiEVM** entry (chain id 1329) with NTT, WTT (wrapped token transfers), and CCTP routing on mainnet. Sei's docs provide no Wormhole EVM integration guide — if you specifically need Wormhole (coverage LayerZero/CCTP lack), verify the current SeiEVM contract addresses and the exact SDK chain handle on Wormhole's docs before integrating. Wormhole lists Sei twice: a CosmWasm `Sei` side and an EVM `SeiEVM` side — confirm which handle you are using.
- **The Wormhole CosmWasm side on Sei is legacy/exit-only.** Wrapped assets that arrived on the Cosmos side (e.g. `USDCso`, Wormhole-bridged `WETH`, `USDCet`) must be **bridged out** via the legacy Portal Bridge (https://legacy.portalbridge.com) under SIP-3 — see https://docs.sei.io/learn/sip-03-migration. Do not route new inbound transfers through it.
- For your own multichain token, Wormhole **NTT** is the analogue of LayerZero's OFT; **WTT** is the lock/mint wrapped path. Wormhole's guardian set has historically been targeted — check current guardian status. When LayerZero V2 (OFT / messaging) or CCTP (USDC) cover your case, prefer them: they have first-class Sei documentation and deployed-contract tables.

## End-user bridging (no contract work)

Point users at the official **Sei bridge dashboard**, https://dashboard.sei.io/bridge — it aggregates routes onto Sei. To embed bridging in your own dApp, use Thirdweb Payments (onramp/swap/bridge widget): https://docs.sei.io/evm/bridging/thirdweb. The dashboard's transfer tool also handles native↔EVM asset movement during SIP-3 migration: https://dashboard.sei.io/evm-upgrade.

## IBC (legacy / exit-only)

Inbound IBC is disabled (SIP-3) — never present IBC as a way to bring assets onto Sei. The one IBC action that still matters is **exiting** legacy `ibc/...` assets from the Cosmos side, a mainnet (pacific-1) concern: holders of e.g. USDC.n (bridged via Noble) should swap to native USDC and bridge out via CCTP before the upgrade fully activates.

```bash
# Exit flow: send a Cosmos-side asset out of Sei to another Cosmos chain.
# Positional args: port ("transfer"), channel (channel-0 = Sei→Osmosis),
# recipient, amount+denom.
seid tx ibc-transfer transfer transfer channel-0 <RECIPIENT_ADDRESS> 1000000usei \
  --from <YOUR_KEY> \
  --chain-id pacific-1 \
  --node https://rpc.sei-apis.com \
  --fees 20000usei \
  --timeout-timestamp $(date -d "+1 hour" +%s)000000000

# Resolve what an ibc/... denom represents
seid q ibc-transfer denom-trace <IBC_HASH> --node https://rpc.sei-apis.com
```

Check current channels at https://www.mintscan.io/sei/relayers. The IBC precompile (`0x0000000000000000000000000000000000001009`) exposed IBC transfers to the EVM for CosmWasm-adjacent workflows; it is **legacy** — CosmWasm is deprecated and inbound IBC is disabled, so it is not a path for new builds. Migration routes and the affected-asset table: https://docs.sei.io/learn/sip-03-migration.

## Finality timing and trust

| Bridge | Source → Sei time | Notes |
|---|---|---|
| LayerZero V2 | ~2-5 min | Depends on DVN config + source-chain finality |
| Wormhole | ~10-15 min | Guardian set attestation + source finality |
| CCTP (native USDC) | ~15-30 min | Source-chain finality is the bottleneck |

For high-value transfers prefer, in order: (1) **CCTP** for USDC — fewest trust assumptions; (2) a self-controlled **LayerZero V2 OFT** if you control both ends of the token. Every bridge holds locked or burnable value — audit history matters.

## Common pitfalls

- **Passing `sei1...` addresses to LayerZero or CCTP.** EVM bridges expect `0x...` format on the Sei side.
- **Hardcoding endpoint addresses, EIDs, or CCTP domain IDs from memory.** They change across version upgrades — read them from the official deployment tables and confirm on Seiscan.
- **Sending an OFT transfer without `quoteSend`.** The cross-chain fee is paid in native gas and must be quoted first; if `quoteSend` reverts, the pathway/DVNs aren't wired.
- **Using `OFT` for an already-deployed ERC-20 you can't reissue.** Use an OFT Adapter — it locks the existing token instead of minting.
- **EIP-1559 fee fields on Sei-side redemptions.** No base-fee burn on Sei — set a legacy `gasPrice` (floor ~50 gwei on mainnet, governance-adjustable; query `eth_gasPrice`), or the claim sits in the mempool.
- **Planning inbound IBC.** Disabled under SIP-3 (pacific-1 Proposal 116 / atlantic-2 #247) — use an EVM bridge instead.
- **Routing new transfers through Wormhole's Sei CosmWasm side or the Portal Bridge.** Legacy/exit-only: `USDCso`, Wormhole-bridged `WETH`, and `USDCet` must be bridged out, not added to.
- **Wrong USDC units or recipient encoding.** USDC is 6 decimals on Sei (`parseUnits(value, 6)`), and CCTP's `mintRecipient` is the `0x...` address left-padded to bytes32.
- **Expecting Sei's finality to speed up bridging.** Source-chain finality + attestation dominates end-to-end time; the Sei-side confirmation itself is ~1 block — `tx.wait(1)`, never 12.
- **Building new CosmWasm, pointer-contract, or IBC-precompile flows.** Deprecated per SIP-3 — deploy ERC-20 / OFT contracts directly on Sei EVM.
- **Skipping the testnet round trip.** Wire and test the full path on atlantic-2 (1328) before touching mainnet (pacific-1, 1329).

## Key docs

| Topic | Link |
| --- | --- |
| LayerZero on Sei (EIDs, deployed contracts, OFT walkthrough) | https://docs.sei.io/evm/bridging/layerzero |
| Thirdweb bridging / payments widget | https://docs.sei.io/evm/bridging/thirdweb |
| USDC on Sei (native USDC via CCTP) | https://docs.sei.io/evm/usdc-on-sei |
| SIP-3 migration (IBC, CosmWasm, legacy assets) | https://docs.sei.io/learn/sip-03-migration |
| Differences with Ethereum (gas price, fees) | https://docs.sei.io/evm/differences-with-ethereum |
