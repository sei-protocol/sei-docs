### `seid query feegrant grant`
```ansi
Query details for a grant. 
You can find the fee-grant of a granter and grantee.

Example:
$ <appd> query feegrant grant [granter] [grantee]

Usage:
  seid query feegrant grant [granter] [grantee] [flags]

Flags:
      --height int      Use a specific height to query state at (this can error if the node is pruning state)
  -h, --help            help for grant
      --node string     <host>:<port> to Tendermint RPC interface for this chain (default "tcp://localhost:26657")
  -o, --output string   Output format (text|json) (default "text")

Global Flags:
      --chain-id string     The network chain ID
      --home string         directory for config and data (default "~/.sei")
      --log_format string   The logging format (json|plain)
      --log_level string    The logging level (trace|debug|info|warn|error|fatal|panic)
      --trace               print out full stack trace on errors

```