### `seid keys parse`
```ansi
Convert and print to stdout key addresses and fingerprints from
hexadecimal into bech32 cosmos prefixed format and vice versa.

Usage:
  seid keys parse <hex-or-bech32-address> [flags]

Flags:
  -h, --help   help for parse

Global Flags:
      --home string              The application home directory (default "~/.sei")
      --keyring-backend string   Select keyring's backend (os|file|test) (default "os")
      --keyring-dir string       The client Keyring directory; if omitted, the default 'home' directory will be used
      --log_format string        The logging format (json|plain)
      --log_level string         The logging level (trace|debug|info|warn|error|fatal|panic)
      --output string            Output format (text|json) (default "text")
      --trace                    print out full stack trace on errors

```