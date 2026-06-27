---
name: sei-nodes
description: >
  Use when "run a Sei full node", "set up a Sei RPC node", "become a Sei validator", "state sync my Sei node", "restore a Sei snapshot", "configure app.toml / config.toml for seid", "what hardware does a Sei node need", "enable SeiDB / RocksDB backend", "migrate to Giga storage", or "my node won't sync past genesis". Covers running and operating Sei full nodes, RPC/archive nodes, and validators — syncing, configuration, the SeiDB storage backend, and validator lifecycle.
license: MIT
compatibility: Linux server; the seid binary
metadata:
  author: Sei
  version: 1.0.0
  intended-host: docs.sei.io
  domain: infrastructure
---

# Running Sei nodes and validators

This skill makes the agent reliable at operating Sei infrastructure: choosing a node type, bootstrapping fast via state sync or a snapshot, tuning `app.toml` / `config.toml`, understanding the SeiDB two-layer storage backend (and the RocksDB / Giga storage options), and standing up a validator without getting tombstoned. It targets a Linux server running the `seid` binary.

Sei is a Cosmos SDK chain with an integrated EVM execution layer. Nodes run consensus (Tendermint/CometBFT-style) plus the Sei application, and serve both Cosmos RPC and Sei EVM RPC from the same process.

## Critical facts

- **Networks**: mainnet is `pacific-1` (EVM chain ID 1329 / 0x531); testnet is `atlantic-2` (EVM chain ID 1328 / 0x530). Block time is ~400ms with fast finality.
- **Genesis is automatic**. `seid init` writes the correct `genesis.json` for known networks (mainnet and testnets) — do **not** hand-download a genesis file.
- **Never start from genesis on a live network.** Doing so panics with `panic: recovered: runtime error: integer divide by zero`. You must bootstrap via [state sync](https://docs.sei.io/node/statesync) or a [snapshot](https://docs.sei.io/node/snapshot).
- **Init mode binds ports.** Default `--mode full` binds RPC and P2P to all interfaces (`0.0.0.0`). For validators (and seed nodes) use `--mode validator` / `--mode seed` so RPC and P2P listen on localhost only.
- **SeiDB is the storage backend**, not the legacy IAVL store. It has two layers: State Commit (SC, hot state on memiavl, computes the app hash) and State Store (SS, historical key/values for queries). Legacy IAVL (`sc-enable = false`) is deprecated and slated for removal — run SeiDB.
- **SS is required for any node that serves RPC** (`ss-enable = true`). Validators that serve no queries can disable it to save disk.
- **Minimum gas price is governance-set and chain-enforced.** mainnet enforces a chain-wide floor (set `minimum-gas-prices` at or above it, e.g. `0.02usei`); `0usei` is only valid for local/private dev. The exact floor, block gas limit, and SSTORE/storage gas cost are governance-adjustable — confirm the live values at [docs.sei.io](https://docs.sei.io) rather than hardcoding them.
- **Double-signing = permanent tombstoning.** Never run the same `priv_validator_key.json` on two machines at once. Always preserve `priv_validator_state.json` across any resync.
- **`occ-enabled = true`** turns on Optimistic Concurrency Control for parallel transaction execution — keep it on.
- **Go 1.24.x** is required to build `seid` v6.3+. Official Docker images: `ghcr.io/sei-protocol/sei` (linux/amd64 and linux/arm64).

## Node types

| Type | Purpose | Key config |
|---|---|---|
| Full / RPC | Serve Cosmos + EVM RPC, relay txs | `ss-enable = true`; bootstrap via state sync or snapshot |
| Archive | Full history for deep queries / tracing | `ss-keep-recent = 0` (keep everything); disable `[statesync]`; sync from a long-history snapshot or genesis |
| Seed | P2P peer discovery only | `seid init --mode seed` |
| Validator | Sign blocks, secure the network | `seid init --mode validator`; protect the consensus key |

Recommended hardware (from the docs): 16 cores, 256 GB DDR5 RAM, 2 TB NVMe SSD (high IOPS), 2 Gbps low-latency network.

## Install and initialize

```bash
# Build from source (pick the recommended tag from the Network Versions table on docs.sei.io)
git clone https://github.com/sei-protocol/sei-chain.git
cd sei-chain
git checkout <version-tag>
make install
seid version

# Initialize. Default mode is full; use --mode validator for a validator.
seid init <your-moniker> --chain-id pacific-1
# genesis.json is written automatically — do NOT download one.

# Set persistent peers (grab a current list from docs.sei.io/node)
PEERS="<comma-separated-peer-list>"
sed -i 's/persistent-peers = .*/persistent-peers = "'$PEERS'"/' ~/.sei/config/config.toml
```

## State sync (fastest bootstrap)

State sync fetches a recent app-state snapshot from peers instead of replaying history (days → minutes). It only runs if the node has no local state (`LastBlockHeight = 0`); the resulting node has a truncated block history starting at the snapshot height.

```bash
#!/bin/bash
# mainnet RPC, e.g. https://rpc.sei-apis.com:443 or https://sei-rpc.polkachu.com:443
STATE_SYNC_RPC="https://rpc.sei-apis.com:443"
# mainnet pacific-1 state-sync peers (set as persistent-peers):
STATE_SYNC_PEER="3be6b24cf86a5938cce7d48f44fb6598465a9924@p2p.state-sync-0.pacific-1.seinetwork.io:26656,b21279d7092fde2e41770832a1cacc7d0051e9dc@p2p.state-sync-1.pacific-1.seinetwork.io:26656,616c05e9ba24acc89c0de630b5e3adbedaebb478@p2p.state-sync-2.pacific-1.seinetwork.io:26656"

# Existing node only: back up validator key + state, then reset.
mkdir -p $HOME/key_backup
cp $HOME/.sei/config/priv_validator_key.json $HOME/key_backup/ 2>/dev/null
cp $HOME/.sei/data/priv_validator_state.json $HOME/key_backup/ 2>/dev/null
seid tendermint unsafe-reset-all --home $HOME/.sei
rm -rf $HOME/.sei/data/* $HOME/.sei/wasm
# Restore validator state AFTER the reset/clear, BEFORE starting seid.
cp $HOME/key_backup/priv_validator_state.json $HOME/.sei/data/priv_validator_state.json 2>/dev/null

# Round the trust height down (e.g. to the nearest 100,000) so it lands safely below
# the latest snapshot height and avoids backward light-client verification.
LATEST_HEIGHT=$(curl -s $STATE_SYNC_RPC/block | jq -r .block.header.height)
BLOCK_HEIGHT=$(( (LATEST_HEIGHT / 100000) * 100000 ))
TRUST_HASH=$(curl -s "$STATE_SYNC_RPC/block?height=$BLOCK_HEIGHT" | jq -r .block_id.hash)

sed -i.bak -E "s|^(enable[[:space:]]+=[[:space:]]+).*$|\1true| ; \
s|^(rpc-servers[[:space:]]+=[[:space:]]+).*$|\1\"$STATE_SYNC_RPC,$STATE_SYNC_RPC\"| ; \
s|^(trust-height[[:space:]]+=[[:space:]]+).*$|\1$BLOCK_HEIGHT| ; \
s|^(trust-hash[[:space:]]+=[[:space:]]+).*$|\1\"$TRUST_HASH\"|" $HOME/.sei/config/config.toml
sed -i.bak -e "s|^persistent-peers *=.*|persistent-peers = \"$STATE_SYNC_PEER\"|" $HOME/.sei/config/config.toml

sudo systemctl start seid
```

State sync can be flaky — if it stalls, just retry (4-5 attempts is normal). RocksDB-configured RPC nodes **must** bootstrap via state sync, not from existing data. Testnet (atlantic-2) uses `https://rpc-testnet.sei-apis.com:443` with its own peer set — see [docs.sei.io/node/statesync](https://docs.sei.io/node/statesync).

## Snapshot restore (alternative bootstrap)

Snapshots are a compressed copy of `data/` (+ `wasm/`) you extract straight into `$HOME/.sei`. Providers: Polkachu, Imperator, Stakeme, kjnodes.

```bash
sudo systemctl stop seid
# Existing node only: preserve validator state, reset, clear data + wasm
cp $HOME/.sei/data/priv_validator_state.json $HOME/priv_validator_state.json
seid tendermint unsafe-reset-all --home $HOME/.sei
rm -rf $HOME/.sei/data $HOME/.sei/wasm

SNAPSHOT_URL="<PASTE_PROVIDER_URL>"
curl -L $SNAPSHOT_URL | lz4 -c -d | tar -x -C $HOME/.sei   # adjust per provider (.tar.gz, --strip-components, etc.)

cp $HOME/priv_validator_state.json $HOME/.sei/data/priv_validator_state.json   # restore AFTER extract
sudo systemctl start seid
```

The `wasm/` folder is part of the snapshot and is required — the node will not sync without it. After restore, ensure `sc-enable = true` and `ss-enable = true` in `app.toml`.

## Essential app.toml tuning

These are the knobs operators actually touch (defaults are sensible; the full reference is on docs.sei.io).

```toml
# Spam floor — set at or above the mainnet-enforced minimum.
minimum-gas-prices = "0.02usei"

# Parallel execution — keep on.
occ-enabled = true

[state-commit]
sc-enable = true              # SeiDB hot layer (app hash). Disabling = deprecated IAVL.
sc-async-commit-buffer = 100  # larger = faster catch-up; 0 = synchronous
sc-keep-recent = 1            # set 1 if serving IBC light-client / relayer proofs

[state-store]
ss-enable = true              # REQUIRED for any RPC-serving node
ss-backend = "pebbledb"       # or "rocksdb" (see below)
ss-keep-recent = 100000       # ~28h of pacific-1 history; 0 = keep everything (archive)

[receipt-store]
rs-backend = "pebbledb"       # EVM receipts; pruned with min-retain-blocks
```

For an **archive node**: set `ss-keep-recent = 0`, disable `[statesync]` (`enable = false`), and source a long-history snapshot or sync from genesis.

## SeiDB, RocksDB, and Giga storage

- **SeiDB layers**: SC = memiavl Merkle tree for Cosmos modules (and the app hash); EVM state can optionally route through **FlatKV** (an EVM-tuned PebbleDB) but defaults to memiavl-only. SS = historical raw KV for queries.
- **RocksDB SS backend** (optional): native MVCC + column families make iteration-heavy work (`debug_trace*`, large archive queries) up to ~10-30× faster than PebbleDB as history grows. Build once, then set the backend:

  ```bash
  make build-rocksdb   # one-time; needs build deps (cmake, libzstd-dev, liburing-dev, etc.)
  make install-rocksdb # seid version then includes the "rocksdbBackend" build tag
  ```

  ```toml
  # ~/.sei/config/app.toml
  ss-backend = "rocksdb"
  ```

  RocksDB RPC nodes must state-sync on first start; archive nodes currently must sync from genesis (a PebbleDB→RocksDB migration is in progress).
- **Giga Storage** (optional, RPC nodes only today): repartitions SeiDB so EVM state lives in its own SC/SS databases, freeing non-EVM modules from EVM write amplification. It requires a **fresh state sync** — flipping the EVM SS modes on a node with existing data fails startup safety checks. Follow the [Giga SS Store Migration Guide](https://docs.sei.io/node/giga-storage-migration); the resulting shape is `sc-write-mode = "dual_write"`, `sc-read-mode = "split_read"`, `sc-enable-lattice-hash = true`, plus split EVM SS modes.
- **Giga Executor** is a *separate* feature (`[giga_executor] enabled`) that swaps the EVM interpreter to an evmone-based engine for throughput. Don't conflate it with Giga Storage.

## Run as a service

```bash
sudo tee /etc/systemd/system/seid.service > /dev/null << EOF
[Unit]
Description=Sei Node
After=network-online.target
[Service]
User=$USER
ExecStart=$(which seid) start
Restart=always
RestartSec=3
LimitNOFILE=65535
[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload && sudo systemctl enable --now seid

# Monitor
seid status                       # sync status (catching_up should be false)
journalctl -fu seid -o cat        # live logs
```

## Becoming a validator

```bash
# 1. Init in validator mode (RPC/P2P bind to localhost)
seid init <moniker> --chain-id pacific-1 --mode validator

# 2. Fully sync first (state sync / snapshot), then create the validator
seid keys add operator
seid tx staking create-validator \
    --amount=1000000usei \
    --pubkey=$(seid tendermint show-validator) \
    --moniker="choose_moniker" \
    --chain-id=pacific-1 \
    --commission-rate="0.10" \
    --commission-max-rate="0.20" \
    --commission-max-change-rate="0.01" \
    --min-self-delegation="1" \
    --gas="auto" --gas-adjustment="1.5" --gas-prices="0.02usei" \
    --from=operator

# Verify signing
seid query slashing signing-info $(seid tendermint show-validator)
```

Use `atlantic-2` for testnet. Protect the consensus key (`priv_validator_key.json`) with offline backups or an HSM; consider a sentry-node architecture (`pex = false` on the validator, private peer IDs on the sentries) to shield it from DDoS.

## Common pitfalls

- **Starting from genesis on a live network** → `integer divide by zero` panic. Always state-sync or snapshot.
- **Hand-downloading a genesis file.** `seid init` already wrote the right one for known networks; overwriting it causes mismatches.
- **Forgetting `wasm/` in a snapshot restore** — the node silently fails to sync. The folder is bundled in the snapshot; restore it too.
- **Skipping the `priv_validator_state.json` restore after a reset/resync** — `seid tendermint unsafe-reset-all` plus `rm -rf data/*` wipes it, so always copy your backup back to `$HOME/.sei/data/priv_validator_state.json` before starting. On a snapshot restore, copy it back *after* extraction since the extract overwrites it.
- **Running validator keys on two machines** → permanent tombstoning. The same applies after any resync: verify the old instance is fully offline.
- **Validator with RPC/P2P on `0.0.0.0`** — happens when you forget `--mode validator`. Re-init or rebind to localhost and use sentries.
- **Hardcoding gas / SSTORE numbers.** Minimum gas price and block gas limit are governance-adjustable (and the gas-price floor differs between mainnet and testnet); SSTORE/storage gas is governance-adjustable too, currently 72,000 — the same on both networks. Read live values from [docs.sei.io](https://docs.sei.io); do not assume Ethereum's 20,000 SSTORE.
- **Stale binary after a snapshot/state-sync** → `AppHash` errors. Use the `seid` version that matches the snapshot/network height.
- **Disabling SS on an RPC node** — historical queries break. `ss-enable = true` is mandatory wherever you serve RPC.
- **Treating SeiDB like Ethereum geth.** This is a Cosmos+EVM node; storage, pruning, and the app hash live in SeiDB (memiavl + PebbleDB/RocksDB), not a single geth-style DB.
- **Pruning interval too small** collides with snapshot creation; too large delays pruning and risks missed blocks. Leave `ss-prune-interval` near its default (600s) unless you have a reason.

## Key docs

| Topic | Link |
|---|---|
| Node operations home (hardware, install steps) | https://docs.sei.io/node |
| Node operations guide (config reference, SeiDB, maintenance) | https://docs.sei.io/node/node-operators |
| State sync | https://docs.sei.io/node/statesync |
| Snapshot sync | https://docs.sei.io/node/snapshot |
| Validator operations guide | https://docs.sei.io/node/validators |
| RocksDB backend | https://docs.sei.io/node/rocksdb-backend |
| Giga SS Store migration | https://docs.sei.io/node/giga-storage-migration |
| Advanced config & monitoring | https://docs.sei.io/node/advanced-config-monitoring |
| Technical reference (versions, genesis, peers) | https://docs.sei.io/node/technical-reference |
