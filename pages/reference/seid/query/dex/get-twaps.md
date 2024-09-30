### `seid query dex get-twaps`
```ansi
Get the TWAPs (Time weighted average prices) for all registered dex pairs for a specific orderbook by [contract-address] with a specific lookback duration over which to compute the weighted average.

Usage:
  seid query dex get-twaps [contract-address] [lookback] [flags]

Flags:
      --height int      Use a specific height to query state at (this can error if the node is pruning state)
  -h, --help            help for get-twaps
      --node string     <host>:<port> to Tendermint RPC interface for this chain (default "tcp://localhost:26657")
  -o, --output string   Output format (text|json) (default "text")

Global Flags:
      --chain-id string     The network chain ID
      --home string         directory for config and data (default "~/.sei")
      --log_format string   The logging format (json|plain)
      --log_level string    The logging level (trace|debug|info|warn|error|fatal|panic)
      --trace               print out full stack trace on errors

```