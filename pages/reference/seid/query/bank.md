### `seid query bank`
```ansi
Querying commands for the bank module

Usage:
  seid query bank [flags]
  seid query bank [command]

Available Commands:
  balances       Query for account balances by address
  denom-metadata Query the client metadata for coin denominations
  total          Query the total supply of coins of the chain

Flags:
  -h, --help   help for bank

Global Flags:
      --chain-id string     The network chain ID
      --home string         directory for config and data (default "~/.sei")
      --log_format string   The logging format (json|plain)
      --log_level string    The logging level (trace|debug|info|warn|error|fatal|panic)
      --trace               print out full stack trace on errors

Use "seid query bank [command] --help" for more information about a command.

```