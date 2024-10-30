### `seid query evm pointer`
```ansi
get pointer address of the specified type (one of [NATIVE, CW20, CW721, ERC20, ERC721]) and pointee

Usage:
  seid query evm pointer [type] [pointee] [flags]

Flags:
      --height int      Use a specific height to query state at (this can error if the node is pruning state)
  -h, --help            help for pointer
      --node string     <host>:<port> to Tendermint RPC interface for this chain (default "tcp://localhost:26657")
  -o, --output string   Output format (text|json) (default "text")

Global Flags:
      --chain-id string     The network chain ID
      --home string         directory for config and data (default "~/.sei")
      --log_format string   The logging format (json|plain)
      --log_level string    The logging level (trace|debug|info|warn|error|fatal|panic)
      --trace               print out full stack trace on errors

```