### `seid tendermint reset`
```ansi
Set of commands to conveniently reset tendermint related data

Usage:
  seid tendermint reset [command]

Available Commands:
  blockchain    Removes all blocks, state, transactions and evidence stored by the tendermint node
  peers         Removes all peer addresses
  unsafe-all    Removes all tendermint data including signing state
  unsafe-signer esets private validator signer state

Flags:
  -h, --help   help for reset

Global Flags:
      --home string         directory for config and data (default "~/.sei")
      --log_format string   The logging format (json|plain)
      --log_level string    The logging level (trace|debug|info|warn|error|fatal|panic)
      --trace               print out full stack trace on errors

Use "seid tendermint reset [command] --help" for more information about a command.

```