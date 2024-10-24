### `seid query gov`
```ansi
Querying commands for the governance module

Usage:
  seid query gov [flags]
  seid query gov [command]

Available Commands:
  deposit     Query details of a deposit
  deposits    Query deposits on a proposal
  param       Query the parameters (voting|tallying|deposit) of the governance process
  params      Query the parameters of the governance process
  proposal    Query details of a single proposal
  proposals   Query proposals with optional filters
  proposer    Query the proposer of a governance proposal
  tally       Get the tally of a proposal vote
  vote        Query details of a single vote
  votes       Query votes on a proposal

Flags:
  -h, --help   help for gov

Global Flags:
      --chain-id string     The network chain ID
      --home string         directory for config and data (default "~/.sei")
      --log_format string   The logging format (json|plain)
      --log_level string    The logging level (trace|debug|info|warn|error|fatal|panic)
      --trace               print out full stack trace on errors

Use "seid query gov [command] --help" for more information about a command.

```