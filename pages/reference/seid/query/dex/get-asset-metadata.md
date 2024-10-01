### `seid query dex get-asset-metadata`
```ansi
Returns the metadata for a specific asset based on the passed in denom. Dex asset metadata includes information such as IBC info (for IBC assets), the asset type, and standard token metadata from the bank module.

Usage:
  seid query dex get-asset-metadata [denom] [flags]

Flags:
      --height int      Use a specific height to query state at (this can error if the node is pruning state)
  -h, --help            help for get-asset-metadata
      --node string     <host>:<port> to Tendermint RPC interface for this chain (default "tcp://localhost:26657")
  -o, --output string   Output format (text|json) (default "text")

Global Flags:
      --chain-id string     The network chain ID
      --home string         directory for config and data (default "~/.sei")
      --log_format string   The logging format (json|plain)
      --log_level string    The logging level (trace|debug|info|warn|error|fatal|panic)
      --trace               print out full stack trace on errors

```