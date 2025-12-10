---
title: "How to debug "Connection Refused" when using my private RPC?"
description: "How to debug "Connection Refused" when using my private RPC?"
---

# How to debug "Connection Refused" when using my private RPC?

If you're encountering "Connection Refused" errors when using your private Sei RPC:

- **Check Network Connectivity**:

```
# Test basic network connectivity
ping your-rpc-host.com

# Test TCP connectivity to the RPC port (usually 8545)
nc -vz your-rpc-host.com 8545

```

- **Verify Firewall Settings**:

```
# Check if firewall is blocking connections
sudo ufw status

# Allow RPC port if using ufw
sudo ufw allow 8545/tcp

```

- **Check RPC Configuration**:

```
# Ensure RPC is configured to accept external connections
# In your Sei node config, check:
# - RPC address should be 0.0.0.0:8545 (not 127.0.0.1)
# - CORS settings should allow your origin

```

- **Verify RPC Service Status**:

```
# Check if the RPC service is running
sudo systemctl status seid

# View logs for errors
sudo journalctl -u seid -n 100

```

- **Test Locally First**:

```
# Test RPC locally on the server
curl -X POST -H "Content-Type: application/json" \
 --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
 http://localhost:8545

```

If you're still experiencing issues after these steps:

- Check for server resource limitations (CPU, memory, disk)

- Ensure you're not exceeding request rate limits

- Consider restarting your RPC node: `sudo systemctl restart seid`
