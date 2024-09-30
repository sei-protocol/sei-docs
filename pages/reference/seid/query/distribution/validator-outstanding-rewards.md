### `seid query distribution validator-outstanding-rewards`
```ansi
Query distribution outstanding (un-withdrawn) rewards for a validator and all their delegations.

Example:
$ <appd> query distribution validator-outstanding-rewards seivaloper1lwjmdnks33xwnmfayc64ycprww49n33mtm92ne

Usage:
  seid query distribution validator-outstanding-rewards [validator] [flags]

Flags:
      --height int      Use a specific height to query state at (this can error if the node is pruning state)
  -h, --help            help for validator-outstanding-rewards
      --node string     <host>:<port> to Tendermint RPC interface for this chain (default "tcp://localhost:26657")
  -o, --output string   Output format (text|json) (default "text")

Global Flags:
      --chain-id string     The network chain ID
      --home string         directory for config and data (default "~/.sei")
      --log_format string   The logging format (json|plain)
      --log_level string    The logging level (trace|debug|info|warn|error|fatal|panic)
      --trace               print out full stack trace on errors

```