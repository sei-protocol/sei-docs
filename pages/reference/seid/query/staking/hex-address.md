### `seid query staking hex-address`
```ansi
Query details about matches a hex byte representation of a validator

Example:
$ <appd> query staking hex-address A0F18FCE3DA235FE18845CDD50302A44A5CD9A3C

Usage:
  seid query staking hex-address [flags]

Flags:
      --count-total       count total number of records in hex-address to query for
      --height int        Use a specific height to query state at (this can error if the node is pruning state)
  -h, --help              help for hex-address
      --limit uint        pagination limit of hex-address to query for (default 100)
      --node string       <host>:<port> to Tendermint RPC interface for this chain (default "tcp://localhost:26657")
      --offset uint       pagination offset of hex-address to query for
  -o, --output string     Output format (text|json) (default "text")
      --page uint         pagination page of hex-address to query for. This sets offset to a multiple of limit (default 1)
      --page-key string   pagination page-key of hex-address to query for
      --reverse           results are sorted in descending order

Global Flags:
      --chain-id string     The network chain ID
      --home string         directory for config and data (default "~/.sei")
      --log_format string   The logging format (json|plain)
      --log_level string    The logging level (trace|debug|info|warn|error|fatal|panic)
      --trace               print out full stack trace on errors

```