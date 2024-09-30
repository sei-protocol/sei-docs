### `seid tools scan-tx`
```ansi
A tool to scan missing transactions

Usage:
  seid tools scan-tx [flags]

Flags:
      --batch-size int     Batch size to query (default 100)
      --bps-limit int      Blocks per second limit (default 400)
      --endpoint string    GRPC server endpoint (default "127.0.0.1")
  -h, --help               help for scan-tx
      --port int           GRPC server port (default 9090)
      --start-height int   Start height
      --state-dir string   State file directory, the scanner will record the last scanned offset and scan results

Global Flags:
      --home string         directory for config and data (default "~/.sei")
      --log_format string   The logging format (json|plain)
      --log_level string    The logging level (trace|debug|info|warn|error|fatal|panic)
      --trace               print out full stack trace on errors

```