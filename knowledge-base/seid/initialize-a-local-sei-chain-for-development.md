---
title: 'How do I initialize a local Sei chain for development?'
description: 'How do I initialize a local Sei chain for development?'
---

# How do I initialize a local Sei chain for development?

To initialize a local Sei chain for development:

### Method 1: Using the Initialize Script

```
# Clone the repository if you haven't already
git clone https://github.com/sei-protocol/sei-chain.git
cd sei-chain

# Run the initialization script
./scripts/initialize_local_chain.sh

# Start the chain
seid start

```

### Method 2: Using the Python Node Runner

```
# Clone the repository
git clone https://github.com/sei-protocol/sei-chain.git
cd sei-chain

# Run the node with Python
python3 ./scripts/run-node.py

# If this fails, make sure you've installed requirements:
pip3 install -r scripts/requirements.txt

```

### Method 3: Manual Initialization

```
# Initialize chain with custom chain-id
seid init my-node --chain-id my-sei-chain

# Create a key for testing
seid keys add my-wallet

# Add genesis account
seid add-genesis-account my-wallet 10000000000000usei

# Generate genesis tx
seid gentx my-wallet 1000000usei --chain-id my-sei-chain

# Collect genesis txs
seid collect-gentxs

# Validate genesis
seid validate-genesis

# Start the chain
seid start

```

If you encounter "killed" errors during initialization on macOS, apply the codesign fix mentioned earlier.
