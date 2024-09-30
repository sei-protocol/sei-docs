### `seid keys list`
```ansi
Return a list of all public keys stored by this key manager
along with their associated name and address.

Usage:
  seid keys list [flags]

Flags:
  -h, --help         help for list
  -n, --list-names   List names only

Global Flags:
      --home string              The application home directory (default "~/.sei")
      --keyring-backend string   Select keyring's backend (os|file|test) (default "os")
      --keyring-dir string       The client Keyring directory; if omitted, the default 'home' directory will be used
      --log_format string        The logging format (json|plain)
      --log_level string         The logging level (trace|debug|info|warn|error|fatal|panic)
      --output string            Output format (text|json) (default "text")
      --trace                    print out full stack trace on errors

```