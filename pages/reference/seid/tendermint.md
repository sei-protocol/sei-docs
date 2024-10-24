### `seid tendermint`
```ansi
Tendermint subcommands

Usage:
  seid tendermint [command]

Available Commands:
  debug            A utility to kill or watch a Tendermint process while aggregating debugging data
  gen-node-key     Generate a new node key
  gen-validator    Generate new validator keypair
  inspect          Run an inspect server for investigating Tendermint state
  key-migrate      Run Database key migration
  light            Run a light client proxy server, verifying Tendermint rpc
  reindex-event    reindex events to the event store backends
  replay           Replay messages from WAL
  replay-console   Replay messages from WAL in a console
  reset            Set of commands to conveniently reset tendermint related data
  show-address     Shows this node's tendermint validator consensus address
  show-node-id     Show this node's ID
  show-validator   Show this node's tendermint validator info
  snapshot         Take DBSync snapshot for given height
  unsafe-reset-all Removes all tendermint data including signing state
  version          Print tendermint libraries' version

Flags:
  -h, --help   help for tendermint

Global Flags:
      --home string         directory for config and data (default "~/.sei")
      --log_format string   The logging format (json|plain)
      --log_level string    The logging level (trace|debug|info|warn|error|fatal|panic)
      --trace               print out full stack trace on errors

Use "seid tendermint [command] --help" for more information about a command.

```