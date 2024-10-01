### `seid query auth`
```ansi
Querying commands for the auth module

Usage:
  seid query auth [flags]
  seid query auth [command]

Available Commands:
  account             Query for account by address
  accounts            Query all the accounts
  next-account-number Query the next account number
  params              Query the current auth parameters

Flags:
  -h, --help   help for auth

Global Flags:
      --chain-id string     The network chain ID
      --home string         directory for config and data (default "~/.sei")
      --log_format string   The logging format (json|plain)
      --log_level string    The logging level (trace|debug|info|warn|error|fatal|panic)
      --trace               print out full stack trace on errors

Use "seid query auth [command] --help" for more information about a command.

```