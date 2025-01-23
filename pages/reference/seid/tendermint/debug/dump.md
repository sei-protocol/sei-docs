### `seid tendermint debug dump`
```ansi
Continuously poll a Tendermint process and dump debugging data into a single
location at a specified frequency. At each frequency interval, an archived and compressed
file will contain node debugging information including the goroutine and heap profiles
if enabled.

Usage:
  seid tendermint debug dump [output-directory] [flags]

Flags:
      --frequency uint       the frequency (seconds) in which to poll, aggregate and dump Tendermint debug data (default 30)
  -h, --help                 help for dump
      --pprof-laddr string   the profiling server address (<host>:<port>)

Global Flags:
      --home string         directory for config and data (default "~/.sei")
      --log_format string   The logging format (json|plain)
      --log_level string    The logging level (trace|debug|info|warn|error|fatal|panic)
      --rpc-laddr string    the Tendermint node's RPC address <host>:<port>) (default "tcp://localhost:26657")
      --trace               print out full stack trace on errors

```