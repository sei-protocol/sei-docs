---
title: 'How do I install a specific version of seid?'
description: 'How do I install a specific version of seid?'
---

# How do I install a specific version of seid?

To install a specific version of `seid`:

### Method 1: Using Git Tags

```
# Clone the repository
git clone https://github.com/sei-protocol/sei-chain.git
cd sei-chain

# List available tags/versions
git tag

# Checkout specific version
git checkout v3.5.0 # Replace with your desired version

# Build the binary
make install

# Verify version
seid version

```

### Method 2: Using Release Binaries

```
# For macOS (replace version as needed)
wget https://github.com/sei-protocol/sei-chain/releases/download/v3.5.0/sei-chain_3.5.0_Darwin_arm64.tar.gz
tar -xzf sei-chain_3.5.0_Darwin_arm64.tar.gz
sudo mv build/seid /usr/local/bin/

# For Linux
wget https://github.com/sei-protocol/sei-chain/releases/download/v3.5.0/sei-chain_3.5.0_Linux_amd64.tar.gz
tar -xzf sei-chain_3.5.0_Linux_amd64.tar.gz
sudo mv build/seid /usr/local/bin/

```

### Upgrading Between Versions

```
# Save your node key/config if needed
cp -r ~/.sei/config/priv_validator_key.json ~/backup/
cp -r ~/.sei/config/node_key.json ~/backup/

# Install new version (using either method above)

# Restore config if needed
cp ~/backup/priv_validator_key.json ~/.sei/config/
cp ~/backup/node_key.json ~/.sei/config/

```

After installation, remember to apply the codesign fix on macOS if needed:

```
codesign --sign - --force $(which seid)

```

## How do I debug Sei chain synchronization issues?

If your node is having synchronization issues:

### Check Sync Status

```
# Check if node is still catching up
seid status | grep catching_up

# See current block height
seid status | grep latest_block_height

# Compare with network block height (via public RPC)
curl -s https://sei-rpc.polkachu.com/status | jq '.result.sync_info.latest_block_height'

```

### Diagnose Sync Problems

```
# Check logs for errors
tail -f ~/.sei/log/app.log

# Get more detailed sync status
seid status

# Check connected peers
curl -s http://localhost:26657/net_info | jq '.result.peers | length'

```

### Solutions for Sync Issues

- **Use State Sync for Quick Catch-up**:

```
# Stop node
pkill seid

# Reset data (not config)
seid tendermint unsafe-reset-all

# Configure state sync in ~/.sei/config/config.toml
# [statesync]
# enable = true
# rpc_servers = "https://sei-rpc.polkachu.com:443,https://sei-rpc.theamsolutions.info:443"
# trust_height =
# trust_hash = ""

# Restart node
seid start

```

- **Use Snapshot**:

```
# Stop node
pkill seid

# Reset data
seid tendermint unsafe-reset-all

# Download and extract snapshot
wget https://snapshots.polkachu.com/snapshots/sei/sei_latest.tar.lz4
lz4 -dc sei_latest.tar.lz4 | tar -xf - -C ~/.sei

# Restart node
seid start

```

- **Update Configuration for Better Sync**:

```
# Edit ~/.sei/config/config.toml
# Set these values:
# [p2p]
# persistent_peers = ""
# seeds = ""
# max_num_inbound_peers = 50
# max_num_outbound_peers = 50
```
