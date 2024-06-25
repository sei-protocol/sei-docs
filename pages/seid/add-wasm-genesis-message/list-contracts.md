### `seid add-wasm-genesis-message list-contracts`
```ansi
Lists all contracts from genesis contract dump and queued messages

Usage:
  seid add-wasm-genesis-message list-contracts  [flags]

Flags:
      --height int      Use a specific height to query state at (this can error if the node is pruning state)
  -h, --help            help for list-contracts
      --home string     The application home directory (default "~/.sei")
      --node string     <host>:<port> to Tendermint RPC interface for this chain (default "tcp://localhost:26657")
  -o, --output string   Output format (text|json) (default "text")

Global Flags:
      --log_format string   The logging format (json|plain)
      --log_level string    The logging level (trace|debug|info|warn|error|fatal|panic)
      --trace               print out full stack trace on errors

```