### `seid query tokenfactory`
```ansi
Querying commands for the tokenfactory module

Usage:
  seid query tokenfactory [flags]
  seid query tokenfactory [command]

Available Commands:
  denom-authority-metadata Get the authority metadata for a specific denom
  denoms-from-creator      Returns a list of all tokens created by a specific creator address
  params                   Get the params for the x/tokenfactory module

Flags:
  -h, --help   help for tokenfactory

Global Flags:
      --chain-id string     The network chain ID
      --home string         directory for config and data (default "~/.sei")
      --log_format string   The logging format (json|plain)
      --log_level string    The logging level (trace|debug|info|warn|error|fatal|panic)
      --trace               print out full stack trace on errors

Use "seid query tokenfactory [command] --help" for more information about a command.

```