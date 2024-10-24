### `seid query ibc client status`
```ansi
Query client activity status. Any client without an 'Active' status is considered inactive

Usage:
  seid query ibc client status [client-id] [flags]

Examples:
<appd> query ibc client status [client-id]

Flags:
  -h, --help   help for status

Global Flags:
      --chain-id string     The network chain ID
      --home string         directory for config and data (default "~/.sei")
      --log_format string   The logging format (json|plain)
      --log_level string    The logging level (trace|debug|info|warn|error|fatal|panic)
      --trace               print out full stack trace on errors

```