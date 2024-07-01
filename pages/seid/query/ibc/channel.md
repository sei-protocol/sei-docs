### `seid query ibc channel`
```ansi
IBC channel query subcommands

Usage:
  seid query ibc channel [flags]
  seid query ibc channel [command]

Available Commands:
  channels              Query all channels
  client-state          Query the client state associated with a channel
  connections           Query all channels associated with a connection
  end                   Query a channel end
  next-sequence-receive Query a next receive sequence
  packet-ack            Query a packet acknowledgement
  packet-commitment     Query a packet commitment
  packet-commitments    Query all packet commitments associated with a channel
  packet-receipt        Query a packet receipt
  unreceived-acks       Query all the unreceived acks associated with a channel
  unreceived-packets    Query all the unreceived packets associated with a channel

Flags:
  -h, --help   help for channel

Global Flags:
      --chain-id string     The network chain ID
      --home string         directory for config and data (default "~/.sei")
      --log_format string   The logging format (json|plain)
      --log_level string    The logging level (trace|debug|info|warn|error|fatal|panic)
      --trace               print out full stack trace on errors

Use "seid query ibc channel [command] --help" for more information about a command.

```