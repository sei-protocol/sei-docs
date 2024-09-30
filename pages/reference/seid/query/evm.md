### `seid query evm`
```ansi
Querying commands for the evm module

Usage:
  seid query evm [flags]
  seid query evm [command]

Available Commands:
  erc20           get hex payload for the given inputs
  erc20-payload   get hex payload for the given inputs
  erc721-payload  get hex payload for the given inputs
  evm-addr        gets evm address (0x...) by Sei address (sei...) if account has association set
  payload         get hex payload for the given inputs
  pointer         get pointer address of the specified type (one of [NATIVE, CW20, CW721, ERC20, ERC721]) and pointee
  pointer-version Query for the current pointer version and stored code ID (if applicable)
  sei-addr        gets sei address (sei...) by EVM address (0x...) if account has association set

Flags:
  -h, --help   help for evm

Global Flags:
      --chain-id string     The network chain ID
      --home string         directory for config and data (default "~/.sei")
      --log_format string   The logging format (json|plain)
      --log_level string    The logging level (trace|debug|info|warn|error|fatal|panic)
      --trace               print out full stack trace on errors

Use "seid query evm [command] --help" for more information about a command.

```