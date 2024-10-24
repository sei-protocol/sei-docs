### `seid tendermint light`
```ansi
Run a light client proxy server, verifying Tendermint rpc.

All calls that can be tracked back to a block header by a proof
will be verified before passing them back to the caller. Other than
that, it will present the same interface as a full Tendermint node.

Furthermore to the chainID, a fresh instance of a light client will
need a primary RPC address and a trusted hash and height. It is also highly
recommended to provide additional witness RPC addresses, especially if
not using sequential verification.

To restart the node, thereafter only the chainID is required.

When /abci_query is called, the Merkle key path format is:

	/{store name}/{key}

Please verify with your application that this Merkle key format is used (true
for applications built w/ Cosmos SDK).

Usage:
  seid tendermint light [chainID] [flags]

Examples:
light cosmoshub-3 -p http://52.57.29.196:26657 -w http://public-seed-node.cosmoshub.certus.one:26657
	--height 962118 --hash 28B97BE9F6DE51AC69F70E0B7BFD7E5C9CD1A595B7DC31AFF27C50D4948020CD

Flags:
  -d, --dir string                 specify the directory (default "~/.tendermint-light")
      --hash bytesHex              Trusted header's hash
      --height int                 Trusted header's height (default 1)
  -h, --help                       help for light
      --laddr string               serve the proxy on the given address (default "tcp://localhost:8888")
      --log-format string          The logging format (text|json) (default "plain")
      --log-level string           The logging level (debug|info|warn|error|fatal) (default "info")
      --max-open-connections int   maximum number of simultaneous connections (including WebSocket). (default 900)
  -p, --primary string             connect to a Tendermint node at this address
      --sequential                 sequential verification. Verify all headers sequentially as opposed to using skipping verification
      --trust-level string         trust level. Must be between 1/3 and 3/3 (default "1/3")
      --trusting-period duration   trusting period that headers can be verified within. Should be significantly less than the unbonding period (default 168h0m0s)
  -w, --witnesses string           tendermint nodes to cross-check the primary node, comma-separated

Global Flags:
      --home string         directory for config and data (default "~/.sei")
      --log_format string   The logging format (json|plain)
      --log_level string    The logging level (trace|debug|info|warn|error|fatal|panic)
      --trace               print out full stack trace on errors

```