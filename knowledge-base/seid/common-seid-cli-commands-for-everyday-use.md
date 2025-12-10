---
title: 'What are common seid CLI commands for everyday use?'
description: 'What are common seid CLI commands for everyday use?'
---

# What are common seid CLI commands for everyday use?

Here are some essential `seid` commands for everyday use:

### Account Management

```
# Create new key/wallet
seid keys add mykey

# Recover existing wallet
seid keys add mykey --recover

# List all keys
seid keys list

# Export key (for backup)
seid keys export mykey

```

### Transaction Commands

```
# Send tokens
seid tx bank send mykey sei1recipient123... 1000000usei --chain-id pacific-1

# Delegate tokens to validator
seid tx staking delegate seivaloper1... 1000000usei --from mykey --chain-id pacific-1

# Withdraw all staking rewards
seid tx distribution withdraw-all-rewards --from mykey --chain-id pacific-1

# Vote on governance proposal
seid tx gov vote 1 yes --from mykey --chain-id pacific-1

```

### Query Commands

```
# Check account balance
seid query bank balances sei1myaddress...

# Check transaction by hash
seid query tx AABBCCDDEEFF00112233

# Get validator list
seid query staking validators

# Get governance proposals
seid query gov proposals

# Check staking rewards
seid query distribution rewards sei1myaddress...

```

### Node Management

```
# Check node status
seid status

# Show node info
seid tendermint show-node-id

# Export genesis file
seid export > genesis.json

# Check validator consensus state
seid query tendermint-validator-set
```
