### `seid query`
```ansi
Querying subcommands

Usage:
  seid query [flags]
  seid query [command]

Aliases:
  query, q

Available Commands:
  accesscontrol            Querying commands for the accesscontrol module
  account                  Query for account by address
  auth                     Querying commands for the auth module
  authz                    Querying commands for the authz module
  bank                     Querying commands for the bank module
  block                    Get verified data for a the block at given height
  dex                      Querying commands for the dex module
  distribution             Querying commands for the distribution module
  epoch                    Querying commands for the epoch module
  evidence                 Query for evidence by hash or for all (paginated) submitted evidence
  evm                      Querying commands for the evm module
  feegrant                 Querying commands for the feegrant module
  gov                      Querying commands for the governance module
  ibc                      Querying commands for the IBC module
  ibc-transfer             IBC fungible token transfer query subcommands
  mint                     Querying commands for the minting module
  oracle                   Querying commands for the oracle module
  params                   Querying commands for the params module
  slashing                 Querying commands for the slashing module
  staking                  Querying commands for the staking module
  tendermint-validator-set Get the full tendermint validator set at given height
  tokenfactory             Querying commands for the tokenfactory module
  tx                       Query for a transaction by hash, "<addr>/<seq>" combination or comma-separated signatures in a committed block
  txs                      Query for paginated transactions that match a set of events
  upgrade                  Querying commands for the upgrade module
  wasm                     Querying commands for the wasm module

Flags:
      --chain-id string   The network chain ID
  -h, --help              help for query

Global Flags:
      --home string         directory for config and data (default "~/.sei")
      --log_format string   The logging format (json|plain)
      --log_level string    The logging level (trace|debug|info|warn|error|fatal|panic)
      --trace               print out full stack trace on errors

Use "seid query [command] --help" for more information about a command.

```