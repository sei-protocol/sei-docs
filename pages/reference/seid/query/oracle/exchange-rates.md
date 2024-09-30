### `seid query oracle exchange-rates`
```ansi
Query the current exchange rate of Sei with an asset.
You can find the current list of active denoms by running

$ seid query oracle exchange-rates

Or, can filter with denom

$ seid query oracle exchange-rates ukrw

Usage:
  seid query oracle exchange-rates [denom] [flags]

Flags:
      --height int      Use a specific height to query state at (this can error if the node is pruning state)
  -h, --help            help for exchange-rates
      --node string     <host>:<port> to Tendermint RPC interface for this chain (default "tcp://localhost:26657")
  -o, --output string   Output format (text|json) (default "text")

Global Flags:
      --chain-id string     The network chain ID
      --home string         directory for config and data (default "~/.sei")
      --log_format string   The logging format (json|plain)
      --log_level string    The logging level (trace|debug|info|warn|error|fatal|panic)
      --trace               print out full stack trace on errors

```