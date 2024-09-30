### `seid keys`
```ansi
Keyring management commands. These keys may be in any format supported by the
Tendermint crypto library and can be used by light-clients, full nodes, or any other application
that needs to sign with a private key.

The keyring supports the following backends:

    os          Uses the operating system's default credentials store.
    file        Uses encrypted file-based keystore within the app's configuration directory.
                This keyring will request a password each time it is accessed, which may occur
                multiple times in a single command resulting in repeated password prompts.
    kwallet     Uses KDE Wallet Manager as a credentials management application.
    pass        Uses the pass command line utility to store and retrieve keys.
    test        Stores keys insecurely to disk. It does not prompt for a password to be unlocked
                and it should be use only for testing purposes.

kwallet and pass backends depend on external tools. Refer to their respective documentation for more
information:
    KWallet     https://github.com/KDE/kwallet
    pass        https://www.passwordstore.org/

The pass backend requires GnuPG: https://gnupg.org/

Usage:
  seid keys [command]

Available Commands:
  add         Add an encrypted private key (either newly generated or recovered), encrypt it, and save to <name> file
  delete      Delete the given keys
  export      Export private keys
  import      Import private keys into the local keybase
  list        List all keys
  mnemonic    Compute the bip39 mnemonic for some input entropy
  parse       Parse address from hex to bech32 and vice versa
  show        Retrieve key information by name or address

Flags:
  -h, --help                     help for keys
      --home string              The application home directory (default "~/.sei")
      --keyring-backend string   Select keyring's backend (os|file|test) (default "os")
      --keyring-dir string       The client Keyring directory; if omitted, the default 'home' directory will be used
      --output string            Output format (text|json) (default "text")

Global Flags:
      --log_format string   The logging format (json|plain)
      --log_level string    The logging level (trace|debug|info|warn|error|fatal|panic)
      --trace               print out full stack trace on errors

Use "seid keys [command] --help" for more information about a command.

```