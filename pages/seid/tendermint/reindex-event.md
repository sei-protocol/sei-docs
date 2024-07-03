### `seid tendermint reindex-event`
```ansi

reindex-event is an offline tooling to re-index block and tx events to the eventsinks,
you can run this command when the event store backend dropped/disconnected or you want to
replace the backend. The default start-height is 0, meaning the tooling will start
reindex from the base block height(inclusive); and the default end-height is 0, meaning
the tooling will reindex until the latest block height(inclusive). User can omit
either or both arguments.

Usage:
  seid tendermint reindex-event [flags]

Examples:

	tendermint reindex-event
	tendermint reindex-event --start-height 2
	tendermint reindex-event --end-height 10
	tendermint reindex-event --start-height 2 --end-height 10
	

Flags:
      --end-height int     the block height would like to finish for re-index
  -h, --help               help for reindex-event
      --start-height int   the block height would like to start for re-index

Global Flags:
      --home string         directory for config and data (default "~/.sei")
      --log_format string   The logging format (json|plain)
      --log_level string    The logging level (trace|debug|info|warn|error|fatal|panic)
      --trace               print out full stack trace on errors

```