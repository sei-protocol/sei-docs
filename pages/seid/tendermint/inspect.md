### `seid tendermint inspect`
```ansi

	inspect runs a subset of Tendermint's RPC endpoints that are useful for debugging
	issues with Tendermint.

	When the Tendermint consensus engine detects inconsistent state, it will crash the
	tendermint process. Tendermint will not start up while in this inconsistent state. 
	The inspect command can be used to query the block and state store using Tendermint
	RPC calls to debug issues of inconsistent state.

Usage:
  seid tendermint inspect [flags]

Flags:
      --db-backend string   database backend: goleveldb | cleveldb | boltdb | rocksdb | badgerdb (default "goleveldb")
      --db-dir string       database directory (default "data")
  -h, --help                help for inspect
      --rpc.laddr string    RPC listenener address. Port required (default "tcp://127.0.0.1:26657")

Global Flags:
      --home string         directory for config and data (default "~/.sei")
      --log_format string   The logging format (json|plain)
      --log_level string    The logging level (trace|debug|info|warn|error|fatal|panic)
      --trace               print out full stack trace on errors

```