### `seid query accesscontrol wasm-dependency-mapping`
```ansi
Get the wasm contract dependency mapping for a specific contract address. E.g.
$ seid q accesscontrol wasm-dependency-mapping [contractAddr] [flags]

Usage:
  seid query accesscontrol wasm-dependency-mapping [contractAddr] [flags]

Flags:
      --height int      Use a specific height to query state at (this can error if the node is pruning state)
  -h, --help            help for wasm-dependency-mapping
      --node string     <host>:<port> to Tendermint RPC interface for this chain (default "tcp://localhost:26657")
  -o, --output string   Output format (text|json) (default "text")

Global Flags:
      --chain-id string     The network chain ID
      --home string         directory for config and data (default "~/.sei")
      --log_format string   The logging format (json|plain)
      --log_level string    The logging level (trace|debug|info|warn|error|fatal|panic)
      --trace               print out full stack trace on errors

```