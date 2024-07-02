### `seid debug`
```ansi
Tool for helping with debugging your application

Usage:
  seid debug [flags]
  seid debug [command]

Available Commands:
  addr        Convert an address between hex and bech32
  dump-iavl   Dump iavl data for a specific height
  pubkey      Decode a pubkey from proto JSON
  raw-bytes   Convert raw bytes output (eg. [10 21 13 255]) to hex

Flags:
  -h, --help   help for debug

Global Flags:
      --home string         directory for config and data (default "~/.sei")
      --log_format string   The logging format (json|plain)
      --log_level string    The logging level (trace|debug|info|warn|error|fatal|panic)
      --trace               print out full stack trace on errors

Use "seid debug [command] --help" for more information about a command.

```