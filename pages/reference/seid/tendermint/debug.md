### `seid tendermint debug`
```ansi
A utility to kill or watch a Tendermint process while aggregating debugging data

Usage:
  seid tendermint debug [command]

Available Commands:
  dump        Continuously poll a Tendermint process and dump debugging data into a single location
  kill        Kill a Tendermint process while aggregating and packaging debugging data

Flags:
  -h, --help               help for debug
      --rpc-laddr string   the Tendermint node's RPC address <host>:<port>) (default "tcp://localhost:26657")

Global Flags:
      --home string         directory for config and data (default "~/.sei")
      --log_format string   The logging format (json|plain)
      --log_level string    The logging level (trace|debug|info|warn|error|fatal|panic)
      --trace               print out full stack trace on errors

Use "seid tendermint debug [command] --help" for more information about a command.

```