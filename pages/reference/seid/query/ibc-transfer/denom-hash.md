### `seid query ibc-transfer denom-hash`
```ansi
Query the denom hash info from a given denom trace

Usage:
  seid query ibc-transfer denom-hash [trace] [flags]

Examples:
<appd> query ibc-transfer denom-hash transfer/channel-0/uatom

Flags:
      --height int      Use a specific height to query state at (this can error if the node is pruning state)
  -h, --help            help for denom-hash
      --node string     <host>:<port> to Tendermint RPC interface for this chain (default "tcp://localhost:26657")
  -o, --output string   Output format (text|json) (default "text")

Global Flags:
      --chain-id string     The network chain ID
      --home string         directory for config and data (default "~/.sei")
      --log_format string   The logging format (json|plain)
      --log_level string    The logging level (trace|debug|info|warn|error|fatal|panic)
      --trace               print out full stack trace on errors

```