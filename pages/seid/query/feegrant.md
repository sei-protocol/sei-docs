### `seid query feegrant`
```ansi
Querying commands for the feegrant module

Usage:
  seid query feegrant [flags]
  seid query feegrant [command]

Available Commands:
  grant             Query details of a single grant
  grants-by-grantee Query all grants of a grantee
  grants-by-granter Query all grants by a granter

Flags:
  -h, --help   help for feegrant

Global Flags:
      --chain-id string     The network chain ID
      --home string         directory for config and data (default "~/.sei")
      --log_format string   The logging format (json|plain)
      --log_level string    The logging level (trace|debug|info|warn|error|fatal|panic)
      --trace               print out full stack trace on errors

Use "seid query feegrant [command] --help" for more information about a command.

```