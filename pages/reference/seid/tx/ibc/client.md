### `seid tx ibc client`
```ansi
IBC client transaction subcommands

Usage:
  seid tx ibc client [flags]
  seid tx ibc client [command]

Available Commands:
  create       create new IBC client
  misbehaviour submit a client misbehaviour
  update       update existing client with a header
  upgrade      upgrade an IBC client

Flags:
  -h, --help   help for client

Global Flags:
      --chain-id string     The network chain ID
      --home string         directory for config and data (default "~/.sei")
      --log_format string   The logging format (json|plain)
      --log_level string    The logging level (trace|debug|info|warn|error|fatal|panic)
      --trace               print out full stack trace on errors

Use "seid tx ibc client [command] --help" for more information about a command.

```