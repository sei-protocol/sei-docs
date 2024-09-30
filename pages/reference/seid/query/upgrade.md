### `seid query upgrade`
```ansi
Querying commands for the upgrade module

Usage:
  seid query upgrade [command]

Available Commands:
  applied         block header for height at which a completed upgrade was applied
  module_versions get the list of module versions
  plan            get upgrade plan (if one exists)

Flags:
  -h, --help   help for upgrade

Global Flags:
      --chain-id string     The network chain ID
      --home string         directory for config and data (default "~/.sei")
      --log_format string   The logging format (json|plain)
      --log_level string    The logging level (trace|debug|info|warn|error|fatal|panic)
      --trace               print out full stack trace on errors

Use "seid query upgrade [command] --help" for more information about a command.

```