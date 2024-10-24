### `seid tx evm`
```ansi
evm transactions subcommands

Usage:
  seid tx evm [flags]
  seid tx evm [command]

Available Commands:
  add-erc-cw20-pointer       Submit an add ERC-CW20 pointer proposal
  add-erc-cw721-pointer      Submit an add ERC-CW721 pointer proposal
  add-erc-native-pointer     Submit an add ERC-native pointer proposal
  associate-address          associate EVM and Sei address for the sender
  associate-contract-address Set address association for a CosmWasm contract.
  call-contract              Call EVM contract with a bytes payload in hex
  call-precompile            call method on precompile
  deploy                     Deploy an EVM contract for binary at specified path
  deploy-wsei                Deploy ERC20 contract for a native Sei token
  erc20-send                 send recipient <amount> (in smallest unit) ERC20 tokens
  native-send                Send funds from one account to an EVM address (e.g. 0x....).
		Note, the '--from' flag is ignored as it is implied from [from_key_or_address].
		When using '--dry-run' a key name cannot be used, only a bech32 address.
  register-cw-pointer        Register a CosmWasm pointer for an ERC20/721 contract. Pointer type is either ERC20 or ERC721.
  register-evm-pointer       Register an EVM pointer for a CosmWasm contract. Pointer type is either CW20, CW721, or NATIVE.
  send                       send usei to EVM address

Flags:
  -h, --help   help for evm

Global Flags:
      --chain-id string     The network chain ID
      --home string         directory for config and data (default "~/.sei")
      --log_format string   The logging format (json|plain)
      --log_level string    The logging level (trace|debug|info|warn|error|fatal|panic)
      --trace               print out full stack trace on errors

Use "seid tx evm [command] --help" for more information about a command.

```