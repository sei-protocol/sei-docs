---
title: 'How do I configure seid for different networks?'
description: 'How do I configure seid for different networks?'
---

# How do I configure seid for different networks?

You can configure `seid` to work with different networks (mainnet, testnet, local):

### For Mainnet

```
# Set the configuration
seid config chain-id pacific-1
seid config node https://sei-rpc.polkachu.com:443

# Test the connection
seid status

```

### For Testnet (Atlantic)

```
# Set the configuration
seid config chain-id atlantic-2
seid config node https://sei-testnet-rpc.polkachu.com:443

# Test the connection
seid status

```

### For Local Development

```
# Set the configuration
seid config chain-id my-sei-chain
seid config node tcp://localhost:26657
seid config keyring-backend test # For easier testing

# Test the connection
seid status

```

### Chain ID Reference

- Mainnet: `pacific-1`

- Current Testnet: `atlantic-2`

- EVM Chain IDs: 1329 (mainnet), 1328 (testnet)
