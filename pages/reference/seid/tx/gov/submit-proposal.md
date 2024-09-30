### `seid tx gov submit-proposal`
```ansi
Submit a proposal along with an initial deposit.
Proposal title, description, type and deposit can be given directly or through a proposal JSON file.

Example:
$ <appd> tx gov submit-proposal --proposal="path/to/proposal.json" --from mykey

Where proposal.json contains:

{
  "title": "Test Proposal",
  "description": "My awesome proposal",
  "is_expedited": false,
  "type": "Text",
  "deposit": "10test"
}

Which is equivalent to:

$ <appd> tx gov submit-proposal --title="Test Proposal" --description="My awesome proposal" --type="Text" --deposit="10test" --is-expedited=false --from mykey

Usage:
  seid tx gov submit-proposal [flags]
  seid tx gov submit-proposal [command]

Available Commands:
  cancel-software-upgrade            Cancel the current software upgrade proposal
  clear-contract-admin               Submit a clear admin for a contract to prevent further migrations proposal
  community-pool-spend               Submit a community pool spend proposal
  execute-contract                   Submit a execute wasm contract proposal (run by any address)
  ibc-upgrade                        Submit an IBC upgrade proposal
  instantiate-contract               Submit an instantiate wasm contract proposal
  migrate-contract                   Submit a migrate wasm contract to a new code version proposal
  param-change                       Submit a parameter change proposal
  pin-codes                          Submit a pin code proposal for pinning a code to cache
  set-contract-admin                 Submit a new admin for a contract proposal
  software-upgrade                   Submit a software upgrade proposal
  sudo-contract                      Submit a sudo wasm contract proposal (to call privileged commands)
  unpin-codes                        Submit a unpin code proposal for unpinning a code to cache
  update-client                      Submit an update IBC client proposal
  update-instantiate-config          Submit an update instantiate config proposal.
  update-minter                      Submit an UpdateMinter proposal
  update-resource-dependency-mapping Submit an UpdateResourceDependencyMapping proposal
  wasm-store                         Submit a wasm binary proposal

Flags:
  -a, --account-number uint      The account number of the signing account (offline mode only)
  -b, --broadcast-mode string    Transaction broadcasting mode (sync|async|block) (default "sync")
      --deposit string           The proposal deposit
      --description string       The proposal description
      --dry-run                  ignore the --gas flag and perform a simulation of a transaction, but don't broadcast it (when enabled, the local Keybase is not accessible)
      --fee-account string       Fee account pays fees for the transaction instead of deducting from the signer
      --fees string              Fees to pay along with transaction; eg: 10uatom
      --from string              Name or address of private key with which to sign
      --gas string               gas limit to set per-transaction; set to "auto" to calculate sufficient gas automatically (default 200000)
      --gas-adjustment float     adjustment factor to be multiplied against the estimate returned by the tx simulation; if the gas limit is set manually this flag is ignored  (default 1)
      --gas-prices string        Gas prices in decimal format to determine the transaction fee (e.g. 0.1uatom)
      --generate-only            Build an unsigned transaction and write it to STDOUT (when enabled, the local Keybase only accessed when providing a key name)
  -h, --help                     help for submit-proposal
      --keyring-backend string   Select keyring's backend (os|file|kwallet|pass|test|memory) (default "os")
      --keyring-dir string       The client Keyring directory; if omitted, the default 'home' directory will be used
      --ledger                   Use a connected Ledger device
      --node string              <host>:<port> to tendermint rpc interface for this chain (default "tcp://localhost:26657")
      --note string              Note to add a description to the transaction (previously --memo)
      --offline                  Offline mode (does not allow any online functionality
  -o, --output string            Output format (text|json) (default "json")
      --proposal string          Proposal file path (if this path is given, other proposal flags are ignored)
  -s, --sequence uint            The sequence number of the signing account (offline mode only)
      --sign-mode string         Choose sign mode (direct|amino-json), this is an advanced feature
      --timeout-height uint      Set a block timeout height to prevent the tx from being committed past a certain height
      --title string             The proposal title
      --type string              The proposal Type
  -y, --yes                      Skip tx broadcasting prompt confirmation

Global Flags:
      --chain-id string     The network chain ID
      --home string         directory for config and data (default "~/.sei")
      --log_format string   The logging format (json|plain)
      --log_level string    The logging level (trace|debug|info|warn|error|fatal|panic)
      --trace               print out full stack trace on errors

Use "seid tx gov submit-proposal [command] --help" for more information about a command.

```