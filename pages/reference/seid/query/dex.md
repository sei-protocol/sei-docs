### `seid query dex`
```ansi
Querying commands for the dex module

Usage:
  seid query dex [flags]
  seid query dex [command]

Available Commands:
  get-asset-list          Query Asset List
  get-asset-metadata      Query Asset Metadata
  get-latest-price        Query getLatestPrice
  get-match-result        Query get match result by contract
  get-order-count         get number of orders at a price leve
  get-orders              Query get orders for account
  get-orders-by-id        Query get order by ID
  get-price               Query getPrice
  get-prices              Query getPrices
  get-registered-contract Query Registered Contract
  get-registered-pairs    Query Registered Pairs
  get-twaps               Query getPrice
  list-long-book          list all longBook
  list-short-book         list all shortBook
  params                  shows the parameters of the module
  show-long-book          shows a longBook
  show-short-book         shows a shortBook

Flags:
  -h, --help   help for dex

Global Flags:
      --chain-id string     The network chain ID
      --home string         directory for config and data (default "~/.sei")
      --log_format string   The logging format (json|plain)
      --log_level string    The logging level (trace|debug|info|warn|error|fatal|panic)
      --trace               print out full stack trace on errors

Use "seid query dex [command] --help" for more information about a command.

```