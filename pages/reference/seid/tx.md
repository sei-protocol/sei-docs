### `seid tx`
```ansi
Transactions subcommands

Usage:
  seid tx [flags]
  seid tx [command]

Available Commands:
                      
  accesscontrol       accesscontrol transactions subcommands
  authz               Authorization transactions subcommands
  bank                Bank transaction subcommands
  broadcast           Broadcast transactions generated offline
  crisis              Crisis transactions subcommands
  decode              Decode a binary encoded transaction string
  dex                 dex transactions subcommands
  distribution        Distribution transactions subcommands
  encode              Encode transactions generated offline
  epoch               epoch transactions subcommands
  evidence            Evidence transaction subcommands
  evm                 evm transactions subcommands
  feegrant            Feegrant transactions subcommands
  gov                 Governance transactions subcommands
  ibc                 IBC transaction subcommands
  ibc-transfer        IBC fungible token transfer transaction subcommands
  multisign           Generate multisig signatures for transactions generated offline
  oracle              Oracle transaction subcommands
  sign                Sign a transaction generated offline
  sign-batch          Sign transaction batch files
  slashing            Slashing transaction subcommands
  staking             Staking transaction subcommands
  tokenfactory        tokenfactory transactions subcommands
  validate-signatures validate transactions signatures
  vesting             Vesting transaction subcommands
  wasm                Wasm transaction subcommands

Flags:
      --chain-id string   The network chain ID
  -h, --help              help for tx

Global Flags:
      --home string         directory for config and data (default "~/.sei")
      --log_format string   The logging format (json|plain)
      --log_level string    The logging level (trace|debug|info|warn|error|fatal|panic)
      --trace               print out full stack trace on errors

Additional help topics:
  seid tx upgrade        Upgrade transaction subcommands

Use "seid tx [command] --help" for more information about a command.

```