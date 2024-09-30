### `seid tx ibc client misbehaviour`
```ansi
submit a client misbehaviour to prevent future updates

Usage:
  seid tx ibc client misbehaviour [path/to/misbehaviour.json] [flags]

Examples:
<appd> tx ibc client misbehaviour [path/to/misbehaviour.json] --from node0 --home ../node0/<app>cli --chain-id $CID

Flags:
  -h, --help   help for misbehaviour

Global Flags:
      --chain-id string     The network chain ID
      --home string         directory for config and data (default "~/.sei")
      --log_format string   The logging format (json|plain)
      --log_level string    The logging level (trace|debug|info|warn|error|fatal|panic)
      --trace               print out full stack trace on errors

```