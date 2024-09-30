### `seid tx dex`
```ansi
dex transactions subcommands

Usage:
  seid tx dex [flags]
  seid tx dex [command]

Available Commands:
  add-asset-proposal        Submit an add asset proposal
  cancel-orders             Bulk cancel orders
  contract-deposit-rent     Contract deposit rent
  place-orders              Bulk place orders
  register-contract         Register exchange contract
  register-pairs            Register pairs for a contract
  unregister-contract       Unregister exchange contract
  unsuspend-contract        Unsuspend exchange contract
  update-price-tick-size    Update price tick size for a market
  update-quantity-tick-size Update quantity tick size for a market

Flags:
  -h, --help   help for dex

Global Flags:
      --chain-id string     The network chain ID
      --home string         directory for config and data (default "~/.sei")
      --log_format string   The logging format (json|plain)
      --log_level string    The logging level (trace|debug|info|warn|error|fatal|panic)
      --trace               print out full stack trace on errors

Use "seid tx dex [command] --help" for more information about a command.

```