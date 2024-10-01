### `seid query dex list-long-book`
```ansi
Lists all of a long book's information for a given contract address and pair specified by price denom and asset denom.

Usage:
  seid query dex list-long-book [contract address] [price denom] [asset denom] [flags]

Flags:
      --count-total       count total number of records in list-long-book [contract address] [price denom] [asset denom] to query for
      --height int        Use a specific height to query state at (this can error if the node is pruning state)
  -h, --help              help for list-long-book
      --limit uint        pagination limit of list-long-book [contract address] [price denom] [asset denom] to query for (default 100)
      --node string       <host>:<port> to Tendermint RPC interface for this chain (default "tcp://localhost:26657")
      --offset uint       pagination offset of list-long-book [contract address] [price denom] [asset denom] to query for
  -o, --output string     Output format (text|json) (default "text")
      --page uint         pagination page of list-long-book [contract address] [price denom] [asset denom] to query for. This sets offset to a multiple of limit (default 1)
      --page-key string   pagination page-key of list-long-book [contract address] [price denom] [asset denom] to query for
      --reverse           results are sorted in descending order

Global Flags:
      --chain-id string     The network chain ID
      --home string         directory for config and data (default "~/.sei")
      --log_format string   The logging format (json|plain)
      --log_level string    The logging level (trace|debug|info|warn|error|fatal|panic)
      --trace               print out full stack trace on errors

```