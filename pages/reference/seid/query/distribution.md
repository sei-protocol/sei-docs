### `seid query distribution`
```ansi
Querying commands for the distribution module

Usage:
  seid query distribution [flags]
  seid query distribution [command]

Available Commands:
  commission                    Query distribution validator commission
  community-pool                Query the amount of coins in the community pool
  params                        Query distribution params
  rewards                       Query all distribution delegator rewards or rewards from a particular validator
  slashes                       Query distribution validator slashes
  validator-outstanding-rewards Query distribution outstanding (un-withdrawn) rewards for a validator and all their delegations

Flags:
  -h, --help   help for distribution

Global Flags:
      --chain-id string     The network chain ID
      --home string         directory for config and data (default "~/.sei")
      --log_format string   The logging format (json|plain)
      --log_level string    The logging level (trace|debug|info|warn|error|fatal|panic)
      --trace               print out full stack trace on errors

Use "seid query distribution [command] --help" for more information about a command.

```