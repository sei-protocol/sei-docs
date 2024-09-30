### `seid keys mnemonic`
```ansi
Create a bip39 mnemonic, sometimes called a seed phrase, by reading from the system entropy. To pass your own entropy, use --unsafe-entropy

Usage:
  seid keys mnemonic [flags]

Flags:
  -h, --help             help for mnemonic
      --unsafe-entropy   Prompt the user to supply their own entropy, instead of relying on the system

Global Flags:
      --home string              The application home directory (default "~/.sei")
      --keyring-backend string   Select keyring's backend (os|file|test) (default "os")
      --keyring-dir string       The client Keyring directory; if omitted, the default 'home' directory will be used
      --log_format string        The logging format (json|plain)
      --log_level string         The logging level (trace|debug|info|warn|error|fatal|panic)
      --output string            Output format (text|json) (default "text")
      --trace                    print out full stack trace on errors

```