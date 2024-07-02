### `seid tendermint reset unsafe-signer`
```ansi
Resets private validator signer state.
Only use in testing. This can cause the node to double sign

Usage:
  seid tendermint reset unsafe-signer [flags]

Flags:
  -h, --help         help for unsafe-signer
      --key string   Signer key type. Options: ed25519, secp256k1 (default "ed25519")

Global Flags:
      --home string         directory for config and data (default "~/.sei")
      --log_format string   The logging format (json|plain)
      --log_level string    The logging level (trace|debug|info|warn|error|fatal|panic)
      --trace               print out full stack trace on errors

```