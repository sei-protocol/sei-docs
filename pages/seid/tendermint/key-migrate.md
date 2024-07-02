### `seid tendermint key-migrate`
```ansi
Run Database key migration

Usage:
  seid tendermint key-migrate [flags]

Flags:
      --db-backend string   database backend: goleveldb | cleveldb | boltdb | rocksdb | badgerdb (default "goleveldb")
      --db-dir string       database directory (default "data")
  -h, --help                help for key-migrate

Global Flags:
      --home string         directory for config and data (default "~/.sei")
      --log_format string   The logging format (json|plain)
      --log_level string    The logging level (trace|debug|info|warn|error|fatal|panic)
      --trace               print out full stack trace on errors

```