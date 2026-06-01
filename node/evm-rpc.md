## Block Tracing and Historical Transactions

As of the **v6.5 upgrade**, EVM RPC trace endpoints (`debug_traceBlockByNumber`, `debug_traceTransaction`, etc.) use a version-aware transaction decoder:

- **Blocks before the v6.5 upgrade height** — decoded with a lenient decoder that accepts non-canonical (body-bloated) Cosmos transactions that were valid before v6.5.
- **Blocks at or after the v6.5 upgrade height** — decoded with the strict decoder; body-bloat is rejected.

Before this change, trace calls against historical pre-v6.5 blocks containing non-canonical Cosmos txs would return decode errors. Those calls now succeed.

> **Node operators**: no configuration change is required. The correct decoder is selected automatically based on block height relative to the v6.5 upgrade height stored on-chain.

<!-- TODO: expand with full list of affected RPC methods and any relevant error codes -->