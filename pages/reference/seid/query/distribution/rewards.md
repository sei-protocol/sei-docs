### `seid query distribution rewards`
```ansi
Query all rewards earned by a delegator, optionally restrict to rewards from a single validator.

Example:
$ <appd> query distribution rewards sei1gghjut3ccd8ay0zduzj64hwre2fxs9ld75ru9p
$ <appd> query distribution rewards sei1gghjut3ccd8ay0zduzj64hwre2fxs9ld75ru9p seivaloper1gghjut3ccd8ay0zduzj64hwre2fxs9ldmqhffj

Usage:
  seid query distribution rewards [delegator-addr] [validator-addr] [flags]

Flags:
      --height int      Use a specific height to query state at (this can error if the node is pruning state)
  -h, --help            help for rewards
      --node string     <host>:<port> to Tendermint RPC interface for this chain (default "tcp://localhost:26657")
  -o, --output string   Output format (text|json) (default "text")

Global Flags:
      --chain-id string     The network chain ID
      --home string         directory for config and data (default "~/.sei")
      --log_format string   The logging format (json|plain)
      --log_level string    The logging level (trace|debug|info|warn|error|fatal|panic)
      --trace               print out full stack trace on errors

```