### `seid query staking redelegations-from`
```ansi
Query delegations that are redelegating _from_ a validator.

Example:
$ <appd> query staking redelegations-from seivaloper1gghjut3ccd8ay0zduzj64hwre2fxs9ldmqhffj

Usage:
  seid query staking redelegations-from [validator-addr] [flags]

Flags:
      --count-total       count total number of records in validator redelegations to query for
      --height int        Use a specific height to query state at (this can error if the node is pruning state)
  -h, --help              help for redelegations-from
      --limit uint        pagination limit of validator redelegations to query for (default 100)
      --node string       <host>:<port> to Tendermint RPC interface for this chain (default "tcp://localhost:26657")
      --offset uint       pagination offset of validator redelegations to query for
  -o, --output string     Output format (text|json) (default "text")
      --page uint         pagination page of validator redelegations to query for. This sets offset to a multiple of limit (default 1)
      --page-key string   pagination page-key of validator redelegations to query for
      --reverse           results are sorted in descending order

Global Flags:
      --chain-id string     The network chain ID
      --home string         directory for config and data (default "~/.sei")
      --log_format string   The logging format (json|plain)
      --log_level string    The logging level (trace|debug|info|warn|error|fatal|panic)
      --trace               print out full stack trace on errors

```