---
name: sei-nodes
description: >
  Use when "run a Sei full node", "set up a Sei RPC node", "become a Sei validator",
  "state sync my Sei node", "restore a Sei snapshot", "configure app.toml / config.toml
  for seid", "what hardware does a Sei node need", "enable the RocksDB backend",
  "migrate to Giga storage / evm-ss-split", "my validator got jailed", or "my node
  won't sync past genesis". Covers running and operating Sei full nodes, RPC/archive
  nodes, and validators — bootstrapping, configuration, the SeiDB storage backend
  (including RocksDB and Giga options), and the validator lifecycle: keys, monitoring,
  and security.
license: MIT
compatibility: Linux server (Ubuntu 22.04 recommended); the seid binary
metadata:
  author: Sei
  version: 1.1.0
  intended-host: docs.sei.io
  domain: infrastructure
---
<!-- GENERATED FROM sei-protocol/sei-skill@0ce5ace — DO NOT EDIT BY HAND.
     Edit the source in sei-skill, then regenerate via scripts/build-mintlify-skills.mjs (see .github/workflows/sync-skills.yml). -->

# Running Sei nodes and validators

This skill makes the agent reliable at operating Sei infrastructure: choosing a node type, bootstrapping fast via state sync, tuning `app.toml` / `config.toml`, understanding the SeiDB two-layer storage backend (plus the RocksDB and Giga storage options), and standing up a validator without double-signing. It targets a Linux server running the `seid` binary.

Sei is a high-performance EVM-compatible chain built from three integrated components: Twin Turbo Consensus (optimized Tendermint BFT — it accelerates Tendermint, it does not replace it), an Optimistic Concurrency Control (OCC) parallel execution engine, and the SeiDB storage layer — together delivering ~400ms block times, instant finality, and ~100 MegaGas/s throughput. One `seid` process serves Tendermint RPC, the Cosmos REST API, gRPC, and EVM JSON-RPC. OCC parallelism is automatic; operators do not declare write locks. The upcoming Sei Giga upgrade (Autobahn multi-proposer consensus, 5 gigagas/s target) changes internals but leaves the EVM API unchanged.

## Critical facts

- **Networks**: mainnet is `pacific-1`; testnet is `atlantic-2`. Blocks are ~400ms with instant finality — one confirmation suffices; deterministic finality is ~2 blocks (~800ms).
- **Genesis is automatic.** `seid init` writes the correct `genesis.json` for known networks (mainnet/testnets) — do **not** hand-download or overwrite it.
- **Never start from genesis on a live network** — it panics with `integer divide by zero`. Bootstrap via state sync or a snapshot.
- **Validators init with `--mode validator`**, which binds RPC/P2P to localhost. Never expose a validator's RPC publicly; use sentry nodes.
- **SeiDB has two layers**: State Commit (SC) — a memiavl Merkle tree holding Cosmos module state and computing the app hash — and State Store (SS) — versioned raw key/values for historical queries. `ss-enable = true` is required for any RPC node.
- **Minimum gas price**: set `minimum-gas-prices` at or above the mainnet-enforced floor (e.g. `0.02usei`); `0usei` is local-dev only. Minimum gas price, block gas limit, and SSTORE/storage gas are all governance-adjustable — confirm live values at https://docs.sei.io/evm/differences-with-ethereum rather than hardcoding them.
- **No slashing of funds on Sei.** Jailing (exclusion from block signing and rewards) punishes downtime; delegator tokens are safe. Double-signing, however, is catastrophic — guard `priv_validator_key.json` and `priv_validator_state.json`.
- **Validator set is bounded** by the `MaxValidators` governance parameter (default 100); entering the active set requires sufficient bonded stake (own + delegated).
- **Go 1.24.x** is required to build `seid` v6.3+.

## Node types and hardware

| Type | Purpose | Config |
|---|---|---|
| Full / RPC | Query data, relay txs | Default settings |
| Archive | Full history from genesis (10 TB+) | `min-retain-blocks=0`, `pruning="nothing"` |
| State sync provider | Provide snapshots to bootstrap peers | `enable=true` under `[statesync]` in `config.toml` |
| Validator | Sign blocks, secure network | `mode=validator` in `config.toml` + sufficient delegation |

Hardware baseline: 16+ CPU cores, 256 GB DDR5 RAM, 2 TB NVMe SSD. OS: Ubuntu 22.04 (recommended) or macOS.

## Install and initialize

```bash
git clone https://github.com/sei-protocol/sei-chain.git
cd sei-chain
git checkout <version-tag>   # recommended tag: Network Versions table on docs.sei.io
make install
seid version

# genesis.json is written automatically for known networks — do NOT download one.
seid init <YOUR_MONIKER> --chain-id pacific-1
# Validator (binds RPC/P2P to localhost):
# seid init <YOUR_MONIKER> --chain-id pacific-1 --mode validator
```

Key files under `$HOME/.sei/config/`: `app.toml` (gas prices, API, pruning), `config.toml` (P2P, RPC, consensus, statesync), `client.toml` (CLI), `genesis.json`, `node_key.json` (P2P identity), `priv_validator_key.json` (validator signing key).

## State sync (fastest bootstrap)

State sync fetches a recent snapshot from peers instead of replaying history — sync time drops from days to minutes.

```bash
#!/bin/bash
STATE_SYNC_RPC="https://rpc.sei-apis.com:443"   # or https://sei-rpc.polkachu.com:443

# Existing nodes: back up validator key + signing state FIRST
cp $HOME/.sei/config/priv_validator_key.json $HOME/priv_validator_key.json.bak
cp $HOME/.sei/data/priv_validator_state.json $HOME/priv_validator_state.json.bak

# Reset state (existing nodes only) — this wipe preserves priv_validator_state.json
seid tendermint unsafe-reset-all --home $HOME/.sei
find $HOME/.sei/data/ -mindepth 1 ! -name 'priv_validator_state.json' -delete
rm -rf $HOME/.sei/wasm

# Fetch a trusted height (rounded down) and its hash
LATEST_HEIGHT=$(curl -s $STATE_SYNC_RPC/block | jq -r .block.header.height)
BLOCK_HEIGHT=$(( (LATEST_HEIGHT / 100000) * 100000 ))
TRUST_HASH=$(curl -s "$STATE_SYNC_RPC/block?height=$BLOCK_HEIGHT" | jq -r .block_id.hash)

sed -i.bak -E "
s|^(enable[[:space:]]+=[[:space:]]+).*$|\1true|
s|^(rpc-servers[[:space:]]+=[[:space:]]+).*$|\1\"$STATE_SYNC_RPC,$STATE_SYNC_RPC\"|
s|^(trust-height[[:space:]]+=[[:space:]]+).*$|\1$BLOCK_HEIGHT|
s|^(trust-hash[[:space:]]+=[[:space:]]+).*$|\1\"$TRUST_HASH\"|
" $HOME/.sei/config/config.toml

# Mainnet (pacific-1) state-sync peers
PEERS="3be6b24cf86a5938cce7d48f44fb6598465a9924@p2p.state-sync-0.pacific-1.seinetwork.io:26656,b21279d7092fde2e41770832a1cacc7d0051e9dc@p2p.state-sync-1.pacific-1.seinetwork.io:26656"
sed -i "s|^persistent-peers *=.*|persistent-peers = \"$PEERS\"|" $HOME/.sei/config/config.toml

sudo systemctl start seid
```

Endpoints: mainnet `https://rpc.sei-apis.com:443` or `https://sei-rpc.polkachu.com:443`; testnet (`atlantic-2`) `https://rpc-testnet.sei-apis.com:443` with its own peer set — see https://docs.sei.io/node/statesync.

Alternative bootstrap: restore a provider snapshot into `$HOME/.sei` — see https://docs.sei.io/node/snapshot. Back up `priv_validator_state.json` before touching `data/`, exactly as above.

## Essential configuration

```toml
# config.toml — P2P + RPC
[p2p]
external-address = "YOUR_PUBLIC_IP:26656"
laddr = "tcp://0.0.0.0:26656"
max-num-inbound-peers = 40
max-num-outbound-peers = 20
send-rate = 204800000   # 200 MB/s
recv-rate = 204800000

[rpc]
laddr = "tcp://0.0.0.0:26657"
max-open-connections = 900
timeout-broadcast-tx-commit = "10s"
```

```toml
# app.toml — gas floor, API, SeiDB
minimum-gas-prices = "0.02usei"   # at or above the mainnet-enforced floor; 0usei = local dev only

[api]
enable = true
max-open-connections = 1000

[state-commit]
sc-enable = true                  # SeiDB (recommended)
sc-async-commit-buffer = 100
sc-keep-recent = 1
sc-snapshot-interval = 10000

[state-store]
ss-enable = true                  # REQUIRED for any RPC-serving node
ss-backend = "pebbledb"
ss-keep-recent = 100000           # keep last 100k blocks
ss-prune-interval = 600
```

Commonly used ports (all TCP):

| Port | Purpose |
|---|---|
| `26656` | P2P — must be open to join the network |
| `26657` | Tendermint RPC |
| `1317` | Cosmos REST API |
| `9090` | gRPC |
| `8545` | EVM JSON-RPC (HTTP) |
| `8546` | EVM JSON-RPC (WebSocket) |
| `26660` | Prometheus metrics (disabled by default) |

## SeiDB, RocksDB, and Giga

- **SeiDB layers**: SC = memiavl Merkle tree for Cosmos module state and the app hash; SS = versioned raw key/values for historical queries. During parallel execution SeiDB uses MVCC — transactions read state snapshots and write isolated buffers, committed only after conflict resolution.
- **RocksDB SS backend** (optional): faster for iteration-heavy work (`debug_trace*`, large archive queries).

  ```bash
  make build-rocksdb && make install-rocksdb
  ```

  ```toml
  ss-backend = "rocksdb"
  ```

  RocksDB RPC nodes must bootstrap via state sync on first start. See https://docs.sei.io/node/rocksdb-backend.
- **Giga SS Store split** (optional, RPC nodes): splits the State Store so EVM state lives in its own SS database. Controlled by a single bool — `evm-ss-split = true` (Sei v6.5+; older releases used per-key `evm-ss-write-mode` / `evm-ss-read-mode`). Requires a **fresh state sync** — flipping it on a node with existing data fails startup safety checks. SC config is left untouched. Follow the migration guide: https://docs.sei.io/node/giga-storage-migration.
- **Giga Storage (SC FlatKV routing)** is a *separate*, broader option that routes EVM State Commit data through FlatKV, controlled by the single `sc-write-mode` key:

  ```toml
  [state-commit]
  # Valid: memiavl_only (default), migrate_evm, evm_migrated, migrate_all_but_bank,
  # all_migrated_but_bank, migrate_bank, flatkv_only.  (test_only_dual_write is
  # test-only — never in production.) There is NO sc-read-mode and NO
  # sc-enable-lattice-hash key; the evm_lattice app-hash handling is internal.
  sc-write-mode = "memiavl_only"
  # Keys drained memiavl→FlatKV per block while migrating (migrate_* modes):
  sc-keys-to-migrate-per-block = 1024
  ```

  The migration is staged: `migrate_evm` drains EVM data in the background and settles at `evm_migrated`; later modes migrate the remaining modules.
- **Giga Executor** (`[giga_executor] enabled`) is a *separate* feature — an evmone-based EVM interpreter for throughput. Don't conflate it with Giga Storage.

## Run as a service

```ini
# /etc/systemd/system/seid.service
[Unit]
Description=Sei Node
After=network.target

[Service]
User=<USER>
Type=simple
ExecStart=<PATH_TO_SEID>/seid start --chain-id pacific-1
Restart=always
RestartSec=30
TimeoutStopSec=30
KillSignal=SIGINT
LimitNOFILE=65535

[Install]
WantedBy=multi-user.target
```

```bash
systemctl status seid              # sync/service state
journalctl -fu seid -o cat         # live logs
du -sh $HOME/.sei/data/            # watch disk growth; full backups only with the node stopped
```

**Updates.** Non-consensus-breaking: stop `seid`, `git checkout <new-version> && make install`, restart. Governance (consensus-breaking) upgrades: the node halts automatically at the upgrade height in the proposal's `plan` field — build the new binary **before** the halt height, replace, restart.

**Performance tuning** (high-throughput hosts):

```bash
# /etc/sysctl.conf, then sysctl -p
vm.swappiness = 1
vm.dirty_background_ratio = 3
vm.dirty_ratio = 10
net.core.somaxconn = 32768
net.core.netdev_max_backlog = 32768
net.ipv4.tcp_max_syn_backlog = 16384
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216

echo "none" > /sys/block/nvme0n1/queue/scheduler   # disable I/O scheduler on NVMe
blockdev --setra 4096 /dev/nvme0n1                 # optimize sequential reads
```

## Validator operations

Sei uses delegated proof-of-stake (dPoS). Key files and their blast radius:

| File | Purpose | Risk if lost |
|---|---|---|
| `node_key.json` | P2P identity | Low — node loses its peer identity |
| `priv_validator_key.json` | Consensus signing | Cannot sign blocks; if stolen → double-sign risk |
| `priv_validator_state.json` | Last signed height | If reset to zero → double-sign risk |

```bash
seid keys add validator-key             # operator key (OS keyring by default)
seid keys add validator-key --recover   # or restore from mnemonic
seid keys show validator-key --bech val

# Before ANY maintenance — offline, encrypted backups:
cp $HOME/.sei/config/priv_validator_key.json /secure-offline-backup/
cp $HOME/.sei/data/priv_validator_state.json /secure-offline-backup/
```

Production validators should sign via a remote signer/HSM — TMKMS (battle-tested; YubiHSM2/Ledger) or Horcrux (threshold signing, no single point of failure):

```toml
# config.toml — remote signer
[priv-validator]
key-type = "socket"
laddr = "tcp://127.0.0.1:1234"
server-address = "tcp://HSM_HOST:1234"
```

### Create and operate

```bash
seid status | jq .SyncInfo    # wait until catching_up is false before creating

# Fund the operator account with at least self-delegation + gas, then:
seid tx staking create-validator \
  --amount 1000000usei \
  --pubkey $(seid tendermint show-validator) \
  --moniker "My Validator" \
  --chain-id pacific-1 \
  --commission-rate 0.10 \
  --commission-max-rate 0.20 \
  --commission-max-change-rate 0.01 \
  --min-self-delegation 1 \
  --from validator-key \
  --node https://rpc.sei-apis.com \
  --fees 20000usei
```

`--amount 1000000usei` is a 1 SEI self-delegation. Commission changes are bounded by `--commission-max-change-rate` per day.

```bash
# Signing / jail status
seid q slashing signing-info $(seid tendermint show-validator) --node https://rpc.sei-apis.com
seid q staking validator $(seid keys show validator-key --bech val -a) --node https://rpc.sei-apis.com | grep jailed

# Unjail after downtime (funds were never slashed)
seid tx slashing unjail --from validator-key --chain-id pacific-1 --node https://rpc.sei-apis.com --fees 20000usei

# Commission and rewards
seid tx staking edit-validator --commission-rate 0.08 --from validator-key --chain-id pacific-1 --node https://rpc.sei-apis.com --fees 20000usei
seid tx distribution withdraw-validator-commission $(seid keys show validator-key --bech val -a) --from validator-key --chain-id pacific-1 --node https://rpc.sei-apis.com --fees 20000usei

# Network-wide parameters
seid q staking validators --status bonded --node https://rpc.sei-apis.com
seid q slashing params --node https://rpc.sei-apis.com   # downtime thresholds
```

### Monitoring

```toml
# config.toml
[instrumentation]
prometheus = true
prometheus-listen-addr = ":26660"
```

| Metric | Alert threshold |
|---|---|
| `tendermint_consensus_height` | Stalled (no increment) |
| `tendermint_consensus_validators_power` | Drop in total power |
| `tendermint_p2p_peers` | < 5 peers |
| `process_resident_memory_bytes` | > 80% available RAM |

```bash
journalctl -fu seid -o cat | grep -E "ERROR|WARN|panic|missed"
```

### Security and sentries

```bash
ufw default deny incoming
ufw allow 22/tcp        # SSH (key-only; disable password auth and root login)
ufw allow 26656/tcp     # P2P (required)
# Only open 26657, 8545, 8546 if running a public RPC node
ufw enable
```

Keep the validator separate from any public RPC node and shield it behind sentries: the sentries face the internet; the validator peers only with them.

```toml
# Validator node config.toml — only connect to sentries
persistent-peers = "SENTRY_1_ID@sentry1-private-ip:26656,SENTRY_2_ID@sentry2-private-ip:26656"
private-peer-ids = ""   # validator has no public peers
pex = false             # disable peer exchange
```

## Common pitfalls

- **Starting from genesis on a live network** → `integer divide by zero` panic. Always bootstrap via state sync or a snapshot.
- **Hand-downloading a genesis file.** `seid init` already wrote the right one for known networks; overwriting it causes mismatches.
- **Wiping `priv_validator_state.json` during a resync** — a signing state reset to zero risks double-signing. Use the `find ... ! -name 'priv_validator_state.json' -delete` wipe, and back up both validator files before any maintenance.
- **Running the same `priv_validator_key.json` in two places** — double-signing is catastrophic and unrecoverable. After any migration, confirm the old instance is fully offline before the new one signs.
- **Forgetting `--mode validator` at init** — RPC/P2P bind publicly. Never expose a validator's RPC; front it with sentries (`pex = false`).
- **Disabling SS on an RPC node** — `ss-enable = true` is required for any RPC node; historical queries break without it.
- **Flipping `evm-ss-split` on a node with existing data** — startup safety checks fail. The Giga SS split requires a fresh state sync.
- **Inventing SeiDB keys.** There is no `sc-read-mode` and no `sc-enable-lattice-hash`; SC migration is driven by `sc-write-mode` alone, and `test_only_dual_write` must never run in production.
- **Conflating the Giga knobs**: `evm-ss-split` (SS split), `sc-write-mode` (SC FlatKV routing), and `[giga_executor] enabled` (evmone interpreter) are three independent features.
- **Starting a RocksDB-backed RPC node from existing data** — RocksDB RPC nodes must state-sync on first start.
- **Hardcoding gas constants.** The gas-price floor, block gas limit, and SSTORE/storage gas are governance-adjustable — read live values from https://docs.sei.io/evm/differences-with-ethereum. `0usei` belongs only on local/private networks.
- **Missing a governance upgrade.** The node halts at the upgrade height; build the new binary before the halt to minimize downtime.

## Key docs

| Topic | Link |
|---|---|
| Node operations (setup, config reference, maintenance) | https://docs.sei.io/node/node-operators |
| Node types | https://docs.sei.io/node/node-types |
| State sync | https://docs.sei.io/node/statesync |
| Snapshot sync | https://docs.sei.io/node/snapshot |
| Validator operations | https://docs.sei.io/node/validators |
| RocksDB backend | https://docs.sei.io/node/rocksdb-backend |
| Giga SS Store migration | https://docs.sei.io/node/giga-storage-migration |
| Advanced config & monitoring | https://docs.sei.io/node/advanced-config-monitoring |
| Technical reference (versions, genesis, peers) | https://docs.sei.io/node/technical-reference |
| Troubleshooting | https://docs.sei.io/node/troubleshooting |
| Live gas parameters (EVM differences) | https://docs.sei.io/evm/differences-with-ethereum |
