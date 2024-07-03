### `seid query oracle vote-penalty-counter`
```ansi
Query the # of vote periods missed and abstained in this oracle slash window.

$ seid query oracle miss seivaloper...

Usage:
  seid query oracle vote-penalty-counter [validator] [flags]

Flags:
      --height int      Use a specific height to query state at (this can error if the node is pruning state)
  -h, --help            help for vote-penalty-counter
      --node string     <host>:<port> to Tendermint RPC interface for this chain (default "tcp://localhost:26657")
  -o, --output string   Output format (text|json) (default "text")

Global Flags:
      --chain-id string     The network chain ID
      --home string         directory for config and data (default "~/.sei")
      --log_format string   The logging format (json|plain)
      --log_level string    The logging level (trace|debug|info|warn|error|fatal|panic)
      --trace               print out full stack trace on errors

```