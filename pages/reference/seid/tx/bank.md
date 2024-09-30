### `seid tx bank`
```ansi
Bank transaction subcommands

Usage:
  seid tx bank [flags]
  seid tx bank [command]

Available Commands:
  send        Send funds from one account to another.
		Note, the '--from' flag is ignored as it is implied from [from_key_or_address].
		When using '--dry-run' a key name cannot be used, only a bech32 address.

Flags:
  -h, --help   help for bank

Global Flags:
      --chain-id string     The network chain ID
      --home string         directory for config and data (default "~/.sei")
      --log_format string   The logging format (json|plain)
      --log_level string    The logging level (trace|debug|info|warn|error|fatal|panic)
      --trace               print out full stack trace on errors

Use "seid tx bank [command] --help" for more information about a command.

```