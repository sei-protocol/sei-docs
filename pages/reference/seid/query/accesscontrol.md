### `seid query accesscontrol`
```ansi
Querying commands for the accesscontrol module

Usage:
  seid query accesscontrol [flags]
  seid query accesscontrol [command]

Available Commands:
  list-resource-dependency-mapping List all resource dependency mappings
  list-wasm-dependency-mapping     List all wasm contract dependency mappings
  params                           Get the params for the x/accesscontrol module
  resource-dependency-mapping      Get the resource dependency mapping for a specific message key
  wasm-dependency-mapping          Get the wasm contract dependency mapping for a specific contract address

Flags:
  -h, --help   help for accesscontrol

Global Flags:
      --chain-id string     The network chain ID
      --home string         directory for config and data (default "~/.sei")
      --log_format string   The logging format (json|plain)
      --log_level string    The logging level (trace|debug|info|warn|error|fatal|panic)
      --trace               print out full stack trace on errors

Use "seid query accesscontrol [command] --help" for more information about a command.

```