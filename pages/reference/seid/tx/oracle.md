### `seid tx oracle`
```ansi
Oracle transaction subcommands

Usage:
  seid tx oracle [flags]
  seid tx oracle [command]

Available Commands:
  aggregate-vote Submit an oracle aggregate vote for the exchange_rates of the base denom
  set-feeder     Delegate the permission to vote for the oracle to an address

Flags:
  -h, --help   help for oracle

Global Flags:
      --chain-id string     The network chain ID
      --home string         directory for config and data (default "~/.sei")
      --log_format string   The logging format (json|plain)
      --log_level string    The logging level (trace|debug|info|warn|error|fatal|panic)
      --trace               print out full stack trace on errors

Use "seid tx oracle [command] --help" for more information about a command.

```