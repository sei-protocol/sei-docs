### `seid add-wasm-genesis-message store`
```ansi
Upload a wasm binary

Usage:
  seid add-wasm-genesis-message store [wasm file] --run-as [owner_address_or_key_name]", [flags]

Flags:
      --height int                        Use a specific height to query state at (this can error if the node is pruning state)
  -h, --help                              help for store
      --home string                       The application home directory (default "~/.sei")
      --instantiate-everybody string      Everybody can instantiate a contract from the code, optional
      --instantiate-nobody string         Nobody except the governance process can instantiate a contract from the code, optional
      --instantiate-only-address string   Only this address can instantiate a contract instance from the code, optional
      --keyring-backend string            Select keyring's backend (os|file|kwallet|pass|test) (default "os")
      --node string                       <host>:<port> to Tendermint RPC interface for this chain (default "tcp://localhost:26657")
  -o, --output string                     Output format (text|json) (default "text")
      --run-as string                     The address that is stored as code creator

Global Flags:
      --log_format string   The logging format (json|plain)
      --log_level string    The logging level (trace|debug|info|warn|error|fatal|panic)
      --trace               print out full stack trace on errors

```