### `seid query slashing`
```ansi
Querying commands for the slashing module

Usage:
  seid query slashing [flags]
  seid query slashing [command]

Available Commands:
  params        Query the current slashing parameters
  signing-info  Query a validator's signing information
  signing-infos Query signing information of all validators

Flags:
  -h, --help   help for slashing

Global Flags:
      --chain-id string     The network chain ID
      --home string         directory for config and data (default "~/.sei")
      --log_format string   The logging format (json|plain)
      --log_level string    The logging level (trace|debug|info|warn|error|fatal|panic)
      --trace               print out full stack trace on errors

Use "seid query slashing [command] --help" for more information about a command.

```