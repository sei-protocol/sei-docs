### `seid query oracle`
```ansi
Querying commands for the oracle module

Usage:
  seid query oracle [flags]
  seid query oracle [command]

Available Commands:
  actives                Query the active list of Sei assets recognized by the oracle
  exchange-rates         Query the current Sei exchange rate w.r.t an asset
  feeder                 Query the oracle feeder delegate account
  params                 Query the current Oracle params
  price-snapshot-history Query the history for oracle price snapshots
  twaps                  Query the time weighted average prices for denoms with price snapshot data
  vote-penalty-counter   Query the # of the miss count and abstain count
  vote-targets           Query the current Oracle vote targets

Flags:
  -h, --help   help for oracle

Global Flags:
      --chain-id string     The network chain ID
      --home string         directory for config and data (default "~/.sei")
      --log_format string   The logging format (json|plain)
      --log_level string    The logging level (trace|debug|info|warn|error|fatal|panic)
      --trace               print out full stack trace on errors

Use "seid query oracle [command] --help" for more information about a command.

```