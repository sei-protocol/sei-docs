### `seid tendermint debug kill`
```ansi
Kill a Tendermint process while also aggregating Tendermint process data
such as the latest node state, including consensus and networking state,
go-routine state, and the node's WAL and config information. This aggregated data
is packaged into a compressed archive.

Example:
$ tendermint debug kill 34255 /path/to/tm-debug.zip

Usage:
  seid tendermint debug kill [pid] [compressed-output-file] [flags]

Flags:
  -h, --help   help for kill

Global Flags:
      --home string         directory for config and data (default "~/.sei")
      --log_format string   The logging format (json|plain)
      --log_level string    The logging level (trace|debug|info|warn|error|fatal|panic)
      --rpc-laddr string    the Tendermint node's RPC address <host>:<port>) (default "tcp://localhost:26657")
      --trace               print out full stack trace on errors

```