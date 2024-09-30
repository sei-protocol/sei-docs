### `seid query ibc-transfer`
```ansi
IBC fungible token transfer query subcommands

Usage:
  seid query ibc-transfer [command]

Available Commands:
  denom-hash     Query the denom hash info from a given denom trace
  denom-trace    Query the denom trace info from a given trace hash or ibc denom
  denom-traces   Query the trace info for all token denominations
  escrow-address Get the escrow address for a channel
  params         Query the current ibc-transfer parameters

Flags:
  -h, --help   help for ibc-transfer

Global Flags:
      --chain-id string     The network chain ID
      --home string         directory for config and data (default "~/.sei")
      --log_format string   The logging format (json|plain)
      --log_level string    The logging level (trace|debug|info|warn|error|fatal|panic)
      --trace               print out full stack trace on errors

Use "seid query ibc-transfer [command] --help" for more information about a command.

```