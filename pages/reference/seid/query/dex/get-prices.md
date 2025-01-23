### `seid query dex get-prices`
```ansi
Get all the prices for a pair from a dex specified by the contract-address. The price and asset denom are used to specify the dex pair for which to return the latest price. For the latest price use get-latest-price instead or for a specific timestamp use get-price.

Usage:
  seid query dex get-prices [contract-address] [price-denom] [asset-denom] [flags]

Flags:
      --height int      Use a specific height to query state at (this can error if the node is pruning state)
  -h, --help            help for get-prices
      --node string     <host>:<port> to Tendermint RPC interface for this chain (default "tcp://localhost:26657")
  -o, --output string   Output format (text|json) (default "text")

Global Flags:
      --chain-id string     The network chain ID
      --home string         directory for config and data (default "~/.sei")
      --log_format string   The logging format (json|plain)
      --log_level string    The logging level (trace|debug|info|warn|error|fatal|panic)
      --trace               print out full stack trace on errors

```