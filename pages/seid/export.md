### `seid export`
```ansi
Export state to JSON

Usage:
  seid export [flags]

Flags:
      --chain-id string              Chain ID
      --for-zero-height              Export state to start at height zero (perform preproccessing)
      --height int                   Export state from a particular height (-1 means latest height) (default -1)
  -h, --help                         help for export
      --home string                  The application home directory (default "~/.sei")
      --jail-allowed-addrs strings   Comma-separated list of operator addresses of jailed validators to unjail

Global Flags:
      --log_format string   The logging format (json|plain)
      --log_level string    The logging level (trace|debug|info|warn|error|fatal|panic)
      --trace               print out full stack trace on errors

```