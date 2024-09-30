### `seid query staking redelegation`
```ansi
Query a redelegation record for an individual delegator between a source and destination validator.

Example:
$ <appd> query staking redelegation sei1gghjut3ccd8ay0zduzj64hwre2fxs9ld75ru9p seivaloper1l2rsakp388kuv9k8qzq6lrm9taddae7fpx59wm seivaloper1gghjut3ccd8ay0zduzj64hwre2fxs9ldmqhffj

Usage:
  seid query staking redelegation [delegator-addr] [src-validator-addr] [dst-validator-addr] [flags]

Flags:
      --height int      Use a specific height to query state at (this can error if the node is pruning state)
  -h, --help            help for redelegation
      --node string     <host>:<port> to Tendermint RPC interface for this chain (default "tcp://localhost:26657")
  -o, --output string   Output format (text|json) (default "text")

Global Flags:
      --chain-id string     The network chain ID
      --home string         directory for config and data (default "~/.sei")
      --log_format string   The logging format (json|plain)
      --log_level string    The logging level (trace|debug|info|warn|error|fatal|panic)
      --trace               print out full stack trace on errors

```