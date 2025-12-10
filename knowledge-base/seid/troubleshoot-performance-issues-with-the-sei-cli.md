---
title: 'How can I troubleshoot performance issues with the Sei CLI tools?'
description: 'How can I troubleshoot performance issues with the Sei CLI tools?'
---

# How can I troubleshoot performance issues with the Sei CLI tools?

If you're experiencing performance issues with Sei CLI tools:

### 1. Check System Resources

```
# Check memory usage
free -m

# Check disk space
df -h

# Check CPU usage
top

```

### 2. Enable Debug Logging

```
# Set log level to debug
RUST_LOG=debug seid start

# For Go-based tools
GODEBUG=madvdontneed=1,gctrace=1 seid start

```

### 3. Network Performance Issues

```
# Test network latency to RPC
ping -c 5 sei-rpc.polkachu.com

# Use a closer RPC endpoint
seid config node https://sei-rpc.polkachu.com:443

```

### 4. Database Corruption

If you suspect database corruption:

```
# Stop seid
pkill seid

# Reset the database (warning: this deletes chain data)
seid tendermint unsafe-reset-all

# Restart and sync from scratch (or from snapshot)
seid start

```

### 5. Memory Optimization for macOS

On macOS, memory handling can cause issues:

```
# Run with memory optimizations
GODEBUG=madvdontneed=1 seid start
```
