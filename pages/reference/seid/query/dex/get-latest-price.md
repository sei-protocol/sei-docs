### `seid query dex get-latest-price`
```ansi
Get the latest price from a dex specified by the contract-address. The price and asset denom are used to specify the dex pair for which to return the latest price. For the price at a specific timestamp use get-price instead or for all prices use get-prices.

Usage:
  seid query dex get-latest-price [contract-address] [price-denom] [asset-denom] [flags]

Flags:
      --height int      Use a specific height to query state at (this can error if the node is pruning state)
  -h, --help            help for get-latest-price
      --node string     <host>:<port> to Tendermint RPC interface for this chain (default "tcp://localhost:26657")
  -o, --output string   Output format (text|json) (default "text")

Global Flags:
      --chain-id string     The network chain ID
      --home string         directory for config and data (default "~/.sei")
      --log_format string   The logging format (json|plain)
      --log_level string    The logging level (trace|debug|info|warn|error|fatal|panic)
      --trace               print out full stack trace on errors

```