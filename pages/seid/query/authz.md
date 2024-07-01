### `seid query authz`
```ansi
Querying commands for the authz module

Usage:
  seid query authz [flags]
  seid query authz [command]

Available Commands:
  grants            query grants for a granter-grantee pair and optionally a msg-type-url
  grants-by-grantee query authorization grants granted to a grantee
  grants-by-granter query authorization grants granted by granter

Flags:
  -h, --help   help for authz

Global Flags:
      --chain-id string     The network chain ID
      --home string         directory for config and data (default "~/.sei")
      --log_format string   The logging format (json|plain)
      --log_level string    The logging level (trace|debug|info|warn|error|fatal|panic)
      --trace               print out full stack trace on errors

Use "seid query authz [command] --help" for more information about a command.

```