---
title: "How to monitor my Sei EVM node's health?"
description: "How to monitor my Sei EVM node's health?"
---

# How to monitor my Sei EVM node's health?

To effectively monitor your Sei EVM node's health:

### 1. Basic System Monitoring

```
# Check system resources
htop
df -h
free -m

# Check node process
ps aux | grep seid

```

### 2. Node-Specific Metrics

```
# Check sync status via RPC
curl -s -X POST -H "Content-Type: application/json" \
 --data '{"jsonrpc":"2.0","method":"eth_syncing","params":[],"id":1}' \
 http://localhost:8545

# Get current block height
curl -s -X POST -H "Content-Type: application/json" \
 --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
 http://localhost:8545

# Check peer count
curl -s -X POST -H "Content-Type: application/json" \
 --data '{"jsonrpc":"2.0","method":"net_peerCount","params":[],"id":1}' \
 http://localhost:8545

```

### 3. Set Up Prometheus Monitoring

```
# Install Prometheus and Grafana

# Configure Prometheus in /etc/prometheus/prometheus.yml
scrape_configs:
 - job_name: 'sei_node'
 scrape_interval: 15s
 static_configs:
 - targets: ['localhost:26660'] # Default Tendermint metrics port

```

### 4. Create Alert Rules

```
# Example Prometheus alert rule
groups:
- name: sei-node-alerts
 rules:
 - alert: NodeBehind
 expr: (max(sei_latest_block_height) - sei_latest_block_height) > 10
 for: 5m
 labels:
 severity: warning
 annotations:
 summary: "Node falling behind"
 description: "Node is more than 10 blocks behind the network"

```

### 5. Health Check Script

```
#!/bin/bash
# health_check.sh - Run periodically via cron

# Check if node is syncing
SYNCING=$(curl -s -X POST -H "Content-Type: application/json" \
 --data '{"jsonrpc":"2.0","method":"eth_syncing","params":[],"id":1}' \
 http://localhost:8545 | jq '.result')

# Check block height
BLOCK_HEIGHT=$(curl -s -X POST -H "Content-Type: application/json" \
 --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
 http://localhost:8545 | jq '.result')

# Check peer count
PEER_COUNT=$(curl -s -X POST -H "Content-Type: application/json" \
 --data '{"jsonrpc":"2.0","method":"net_peerCount","params":[],"id":1}' \
 http://localhost:8545 | jq '.result')

# Send alerts if issues detected
if [ "$SYNCING" != "false" ]; then
 echo "Node is still syncing" | mail -s "Sei Node Alert: Syncing" admin@example.com
fi

if [ "$PEER_COUNT" -lt "3" ]; then
 echo "Low peer count: $PEER_COUNT" | mail -s "Sei Node Alert: Low Peers" admin@example.com
fi

# Log health status
echo "$(date) - Block: $BLOCK_HEIGHT, Peers: $PEER_COUNT, Syncing: $SYNCING" >> /var/log/sei_health.log

```

### 6. Common Health Metrics to Monitor

- **Block Height**: Compare against network block height

- **Sync Status**: Whether node is fully synced

- **Peer Count**: Should maintain healthy number of peers

- **Request Latency**: Average response time for RPC requests

- **Error Rate**: Percentage of RPC requests returning errors

- **Disk Usage**: Blockchain data grows over time

- **Memory Usage**: Watch for memory leaks

- **CPU Usage**: Spikes during high transaction periods
