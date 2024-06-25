### `seid init`
```ansi
Initialize validators's and node's configuration files.

Usage:
  seid init [moniker] [flags]

Flags:
      --chain-id string   genesis file chain-id, if left blank will use sei
  -h, --help              help for init
      --home string       node's home directory (default "~/.sei")
  -o, --overwrite         overwrite the genesis.json file
      --recover           provide seed phrase to recover existing key instead of creating

Global Flags:
      --log_format string   The logging format (json|plain)
      --log_level string    The logging level (trace|debug|info|warn|error|fatal|panic)
      --trace               print out full stack trace on errors

```