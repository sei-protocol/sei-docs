### `seid tx ibc client update`
```ansi
update existing client with a header

Usage:
  seid tx ibc client update [client-id] [path/to/header.json] [flags]

Examples:
<appd> tx ibc client update [client-id] [path/to/header.json] --from node0 --home ../node0/<app>cli --chain-id $CID

Flags:
  -h, --help   help for update

Global Flags:
      --chain-id string     The network chain ID
      --home string         directory for config and data (default "~/.sei")
      --log_format string   The logging format (json|plain)
      --log_level string    The logging level (trace|debug|info|warn|error|fatal|panic)
      --trace               print out full stack trace on errors

```