### `seid debug dump-iavl`
```ansi
Dump iavl data for a specific height

Example:
$ <appd> debug dump-iavl 12345

Usage:
  seid debug dump-iavl [height] [flags]

Flags:
  -d, --db-path string      The path to the db, default is $HOME/.sei/data/application.db
  -h, --help                help for dump-iavl
  -m, --module string       The specific module to dump IAVL for, if none specified, all modules will be dumped
      --output-dir string   The output directory for the iavl dump, if none specified, the home directory will be used

Global Flags:
      --home string         directory for config and data (default "~/.sei")
      --log_format string   The logging format (json|plain)
      --log_level string    The logging level (trace|debug|info|warn|error|fatal|panic)
      --trace               print out full stack trace on errors

```