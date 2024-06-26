### `seid rollback`
```ansi

A state rollback is performed to recover from an incorrect application state transition,
when Tendermint has persisted an incorrect app hash and is thus unable to make
progress. Rollback overwrites a state at height n with the state at height n - 1.
The application also roll back to height n - 1. No blocks are removed, so upon
restarting Tendermint the transactions in block n will be re-executed against the
application.

Usage:
  seid rollback [flags]

Flags:
      --chain-id string   genesis file chain-id, if left blank will use sei (default "sei-chain")
      --hard              remove last block as well as state
  -h, --help              help for rollback
      --home string       The application home directory (default "~/.sei")

Global Flags:
      --log_format string   The logging format (json|plain)
      --log_level string    The logging level (trace|debug|info|warn|error|fatal|panic)
      --trace               print out full stack trace on errors

```