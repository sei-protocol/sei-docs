/*
 * Sei EVM JSON-RPC Explorer — interactive reference for Sei's EVM RPC methods.
 *
 * Mintlify note: snippets must use arrow-function syntax (no `function` keyword),
 * React hooks are provided in scope by the Mintlify runtime, and ALL declarations
 * (constants, helpers, data) must live INSIDE the component — Mintlify evaluates
 * only the component's own scope, so module-level consts are not visible at runtime.
 */

export const RPCMethodsViewer = () => {
const NETWORKS = {
  mainnet: {
    label: 'Pacific-1 · Mainnet',
    chainId: '1329',
    http: 'https://evm-rpc.sei-apis.com',
    ws: 'wss://evm-ws.sei-apis.com',
  },
  testnet: {
    label: 'Atlantic-2 · Testnet',
    chainId: '1328',
    http: 'https://evm-rpc-testnet.sei-apis.com',
    ws: 'wss://evm-ws-testnet.sei-apis.com',
  },
};

const NAMESPACE_META = {
  eth: { label: 'eth', color: '#b05c6c', blurb: 'Standard Ethereum methods — accounts, balances, blocks, transactions, logs, calls, and filters.' },
  debug: { label: 'debug', color: '#966f22', blurb: 'Transaction and block tracing.' },
  txpool: { label: 'txpool', color: '#3b82f6', blurb: 'Transaction-pool inspection.' },
  net: { label: 'net', color: '#0d9488', blurb: 'Network metadata.' },
  web3: { label: 'web3', color: '#7c3aed', blurb: 'Client metadata.' },
  sei: { label: 'sei', color: '#600014', blurb: 'Legacy Sei extensions for cross-VM lookups and synthetic transactions.', deprecated: true },
  sei2: { label: 'sei2', color: '#34050d', blurb: 'Legacy Sei block queries that include bank transfers.', deprecated: true },
  admin: { label: 'admin', color: '#6b7280', blurb: 'Node administration — not exposed on Sei.', unavailable: true },
  miner: { label: 'miner', color: '#6b7280', blurb: 'Mining control — not applicable (no proof-of-work).', unavailable: true },
  clique: { label: 'clique', color: '#6b7280', blurb: 'Clique proof-of-authority — not applicable (CometBFT consensus).', unavailable: true },
  engine: { label: 'engine', color: '#6b7280', blurb: 'Consensus Engine API — not applicable (CometBFT consensus).', unavailable: true },
  les: { label: 'les', color: '#6b7280', blurb: 'Light Ethereum Subprotocol — not exposed on Sei.', unavailable: true },
  personal: { label: 'personal', color: '#6b7280', blurb: 'Hosted-key account management — not exposed on Sei.', unavailable: true },
};

const NAMESPACE_ORDER = ['eth', 'debug', 'txpool', 'net', 'web3', 'sei', 'sei2', 'admin', 'miner', 'clique', 'engine', 'les', 'personal'];

const STATUS_META = {
  supported: { label: 'Supported', dark: '#22c55e', light: '#16a34a', tip: 'Implemented with standard Ethereum behavior.' },
  limited: { label: 'Limited', dark: '#f59e0b', light: '#b45309', tip: 'Works, but is deprecated, returns a static value, or has a Sei-specific caveat.' },
  unsupported: { label: 'Unavailable', dark: '#9ca3af', light: '#6b7280', tip: 'Not registered on Sei, explicitly errors, or not applicable to Sei’s architecture.' },
};

const LANGUAGES = [
  { id: 'curl', name: 'cURL' },
  { id: 'cast', name: 'cast' },
  { id: 'javascript', name: 'JavaScript' },
  { id: 'typescript', name: 'TypeScript' },
  { id: 'python', name: 'Python' },
  { id: 'go', name: 'Go' },
  { id: 'rust', name: 'Rust' },
  { id: 'java', name: 'Java' },
  { id: 'kotlin', name: 'Kotlin' },
  { id: 'swift', name: 'Swift' },
  { id: 'csharp', name: 'C#' },
];

const SEI_RPC_METHODS = [
  {"namespace":"eth","name":"eth_blockNumber","status":"supported","description":"Returns the number of the most recent committed EVM block as a hex uint64.","seiNote":"Block height comes from CometBFT latest height; the latest committed block is already final on Sei (instant finality, so latest == safe == finalized)."},
  {"namespace":"eth","name":"eth_chainId","status":"supported","description":"Returns the EVM chain ID as a hex big int.","seiNote":"Sourced from the x/evm keeper. Mainnet (pacific-1) = 1329 (0x531); testnet (atlantic-2) = 1328 (0x530)."},
  {"namespace":"eth","name":"eth_coinbase","status":"limited","description":"Returns the block reward beneficiary (coinbase) address.","seiNote":"Sei has no miner; this returns the Cosmos fee-collector module address (GetFeeCollectorAddress), not a validator/miner address. The COINBASE opcode returns the same value."},
  {"namespace":"eth","name":"eth_accounts","status":"limited","description":"Returns the list of addresses for which the node holds hosted keys.","seiNote":"Sourced from the node's local test keyring only; production/public RPC nodes hold no hosted keys, so this returns an empty list. Sign client-side and use eth_sendRawTransaction."},
  {"namespace":"eth","name":"eth_gasPrice","status":"limited","description":"Returns a suggested gas price in wei (hex).","seiNote":"Sei-specific congestion heuristic, not a raw mempool oracle. InfoAPI.GasPrice/GasPriceHelper (info.go): when uncongested it returns baseFee * 110/100 (base fee +10%); when congested it returns medianRewardPrevBlock + baseFee (50th-percentile priority-fee reward from the previous block added to base fee). The base fee comes from the x/evm keeper (GetNextBaseFeePerGas), which is itself floored at the governance-set minimum base fee; the RPC handler applies no additional explicit lower-bound clamp. The mainnet minimum gas price (~50 gwei) is enforced for transaction acceptance at the mempool/ante-handler level, not inside eth_gasPrice."},
  {"namespace":"eth","name":"eth_maxPriorityFeePerGas","status":"limited","description":"Returns a suggested priority fee (tip) per gas in wei (hex).","seiNote":"Sei-specific: returns a hardcoded 1 gwei (defaultPriorityFeePerGas) when the chain is uncongested; only when congested does it derive the tip from the previous block's 50th-percentile reward. Sei docs advise using a single gasPrice and omitting EIP-1559 fee fields."},
  {"namespace":"eth","name":"eth_feeHistory","status":"supported","description":"Returns base fees, gas-used ratios, and reward percentile data over a range of blocks.","seiNote":"Base fees and rewards reflect Sei's x/evm fee market (GetNextBaseFee), not an Ethereum EIP-1559 mempool, and Sei does not burn the base fee. Watermark-aware: pruned/historical blocks may not be available as far back as on Ethereum archive nodes.","params":[{"name":"blockCount","type":"QUANTITY","description":"Number of blocks in the requested range.","example":"0x5"},{"name":"newestBlock","type":"BLOCKNUMBER","description":"Highest block of the range (number or tag).","example":"latest"},{"name":"rewardPercentiles","type":"array of float","description":"Monotonically increasing percentiles to sample for priority-fee rewards.","example":"[25,50,75]"}]},
  {"namespace":"eth","name":"eth_blobBaseFee","status":"unsupported","description":"EIP-4844 blob base fee. Registered but always returns an unsupported error.","seiNote":"Always returns JSON-RPC error -32000 with message 'blobs not supported on this chain'. Sei does not implement EIP-4844 blob transactions."},
  {"namespace":"eth","name":"eth_syncing","status":"unsupported","description":"Sync status. Registered but always returns an unsupported error instead of false/a sync object.","seiNote":"InfoAPI.Syncing returns a JSON-RPC error with the exact message 'eth_syncing is not supported on Sei EVM RPC' (via ErrEVMNotSupported, code -32000, not -32601). Sei does not expose Ethereum sync semantics here; query CometBFT status endpoints instead."},
  {"namespace":"eth","name":"eth_getBalance","status":"supported","description":"Returns the wei balance of an account at a given block.","seiNote":"Balance reflects the account's SEI bank balance (18-decimal wei representation) and can change from both EVM and non-EVM (Cosmos bank send / wasm) transactions. Height is resolved via the watermark manager with a state-version guard.","params":[{"name":"address","type":"DATA, 20 bytes","description":"Account address.","example":"0xDa52B9E673d1f48FcD9916b3F606A136a8eA5e55"},{"name":"blockNrOrHash","type":"BLOCKNUMBER or DATA","description":"Block number, tag (latest/earliest/pending/safe/finalized), or hash.","example":"latest"}]},
  {"namespace":"eth","name":"eth_getCode","status":"supported","description":"Returns the contract bytecode at an address for a given block.","params":[{"name":"address","type":"DATA, 20 bytes","description":"Contract address.","example":"0xE30feDd158A2e3b13e9badaeABaFc5516e95e8C7"},{"name":"blockNrOrHash","type":"BLOCKNUMBER or DATA","description":"Block number, tag, or hash.","example":"latest"}]},
  {"namespace":"eth","name":"eth_getStorageAt","status":"supported","description":"Returns the value stored at a storage slot of an address at a given block.","seiNote":"Reads the EVM keeper's slot value directly rather than from an MPT trie. The slot key must decode to at most 32 bytes.","params":[{"name":"address","type":"DATA, 20 bytes","description":"Contract address.","example":"0xE30feDd158A2e3b13e9badaeABaFc5516e95e8C7"},{"name":"key","type":"DATA, 32 bytes","description":"Storage slot key (hex, up to 32 bytes).","example":"0x0"},{"name":"blockNrOrHash","type":"BLOCKNUMBER or DATA","description":"Block number, tag, or hash.","example":"latest"}]},
  {"namespace":"eth","name":"eth_getProof","status":"limited","description":"Returns a Merkle proof for an account and the requested storage slots.","seiNote":"Sei stores state in an IAVL tree, not an Ethereum Merkle-Patricia trie. The result is a Sei-specific ProofResult{address, hexValues, storageProof} where storageProof entries are CometBFT/IAVL crypto.ProofOps, NOT eth-style MPT proof nodes. There is no accountProof, balance, codeHash, nonce, or storageHash field (Sei has no per-account state root); standard eth_getProof verifiers will not work.","params":[{"name":"address","type":"DATA, 20 bytes","description":"Account address.","example":"0xE30feDd158A2e3b13e9badaeABaFc5516e95e8C7"},{"name":"storageKeys","type":"array of DATA, 32 bytes","description":"Storage slot keys to prove (bounded by MaxStorageKeysPerProof).","example":"[\"0x0\"]"},{"name":"blockNrOrHash","type":"BLOCKNUMBER or DATA","description":"Block number, tag, or hash.","example":"latest"}]},
  {"namespace":"eth","name":"eth_getNonce","status":"limited","description":"Sei-specific helper that returns the current EVM nonce for an address (latest state only).","seiNote":"Non-standard Sei extension exposed as eth_getNonce, implemented as StateAPI.GetNonce in state.go (NOT on TransactionAPI). Unlike eth_getTransactionCount it takes no block tag (latest-only via ctxProvider(LatestCtxHeight)) and returns a bare uint64 with no block-tag argument. Prefer eth_getTransactionCount for standard nonce queries.","params":[{"name":"address","type":"DATA, 20 bytes","description":"Account address.","example":"0xDa52B9E673d1f48FcD9916b3F606A136a8eA5e55"}]},
  {"namespace":"eth","name":"eth_call","status":"supported","description":"Executes a read-only message call against state without creating a transaction; supports state and block overrides.","seiNote":"Gas is capped by RPCGasCap and execution time by RPCEVMTimeout; a fail-fast limiter may reject with 'eth_call rejected due to rate limit: server busy'. Canonical EVM<->Sei address resolution uses eth_call to the addr precompile at 0x0000000000000000000000000000000000001004.","params":[{"name":"args","type":"object","description":"Call object (to, from, data/input, gas, gasPrice/maxFeePerGas, value).","example":"{\"to\":\"0x0000000000000000000000000000000000001004\",\"data\":\"0x0c3c20ed000000000000000000000000Da52B9E673d1f48FcD9916b3F606A136a8eA5e55\"}"},{"name":"blockNrOrHash","type":"BLOCKNUMBER or DATA","description":"Block number, tag, or hash. Defaults to latest.","example":"latest"},{"name":"overrides","type":"object","description":"Optional per-account state overrides (balance, code, nonce, state).","example":"{}"},{"name":"blockOverrides","type":"object","description":"Optional block-context overrides (number, time, coinbase).","example":"{}"}]},
  {"namespace":"eth","name":"eth_estimateGas","status":"supported","description":"Estimates the gas needed to execute a transaction.","seiNote":"Bounded by RPCGasCap and protected by a fail-fast limiter. Block gas limit on Sei is 12.5M; parallel execution can cause estimates to vary slightly, so size gasLimit with a modest buffer.","params":[{"name":"args","type":"object","description":"Transaction call object.","example":"{\"to\":\"0xE30feDd158A2e3b13e9badaeABaFc5516e95e8C7\",\"data\":\"0x18160ddd\"}"},{"name":"blockNrOrHash","type":"BLOCKNUMBER or DATA","description":"Optional block number, tag, or hash; defaults to latest.","example":"latest"},{"name":"overrides","type":"object","description":"Optional state overrides.","example":"{}"}]},
  {"namespace":"eth","name":"eth_estimateGasAfterCalls","status":"limited","description":"Estimates gas for a transaction after first applying a sequence of preceding calls against the same simulated state.","seiNote":"Non-standard Sei/geth extension (not part of the standard Ethereum JSON-RPC spec). Same gas-cap and fail-fast-limiter behavior as eth_estimateGas.","params":[{"name":"args","type":"object","description":"The final call to estimate gas for.","example":"{\"to\":\"0xE30feDd158A2e3b13e9badaeABaFc5516e95e8C7\",\"data\":\"0x\"}"},{"name":"calls","type":"array of object","description":"Ordered list of preceding calls applied before the estimate.","example":"[]"},{"name":"blockNrOrHash","type":"BLOCKNUMBER or DATA","description":"Optional block number, tag, or hash; defaults to latest.","example":"latest"},{"name":"overrides","type":"object","description":"Optional state overrides.","example":"{}"}]},
  {"namespace":"eth","name":"eth_createAccessList","status":"supported","description":"Generates an EIP-2930 access list (and gas used) for a transaction.","seiNote":"Defaults to the pending block tag (matching geth). A VM error during simulation is surfaced in the result's 'error' field rather than failing the RPC.","params":[{"name":"args","type":"object","description":"Transaction call object.","example":"{\"to\":\"0xE30feDd158A2e3b13e9badaeABaFc5516e95e8C7\",\"data\":\"0x\"}"},{"name":"blockNrOrHash","type":"BLOCKNUMBER or DATA","description":"Optional block number, tag, or hash; defaults to pending.","example":"pending"}]},
  {"namespace":"eth","name":"eth_sendRawTransaction","status":"supported","description":"Submits a signed, RLP-encoded raw EVM transaction to the network and returns its hash.","seiNote":"Decodes to an ethtypes.Transaction, wraps it in a Cosmos MsgEVMTransaction, and broadcasts via CometBFT (async BroadcastTx by default; slow mode uses BroadcastTxCommit). Non-zero CheckTx codes surface as ABCI errors, not geth mempool errors. Legacy (non-1559) txs must set gasPrice at or above the governance minimum (currently 50 gwei on mainnet); blob (EIP-4844) txs are not enabled. Supports per-sender EvmProxy forwarding.","params":[{"name":"data","type":"DATA","description":"Signed, RLP-encoded transaction bytes (0x-prefixed).","example":"0x02f8b101808459682f00..."}]},
  {"namespace":"eth","name":"eth_sendTransaction","status":"limited","description":"Signs (with a node-hosted key) and submits a transaction in one call.","seiNote":"Requires the 'from' address's private key in the node's local test keyring; production/public RPC nodes hold no hosted keys, so this returns 'from address does not have hosted key'. Always signs as LegacyTxType. Sign client-side and use eth_sendRawTransaction instead.","params":[{"name":"args","type":"object","description":"Transaction object (from, to, value, data, gas, nonce, etc.).","example":"{\"from\":\"0xDa52B9E673d1f48FcD9916b3F606A136a8eA5e55\",\"to\":\"0x7507454444fa193d39f1392076bc784b77a7a8ff\",\"value\":\"0x1\"}"}]},
  {"namespace":"eth","name":"eth_signTransaction","status":"limited","description":"Signs a transaction with a node-hosted key and returns the signed payload without broadcasting.","seiNote":"Requires a node-hosted key for the from address; not usable on public RPC nodes that hold no keys. Returns both the raw RLP bytes and the decoded tx.","params":[{"name":"args","type":"object","description":"SendTxArgs transaction object to sign (from, to, gas, gasPrice, value, nonce, data).","example":"{\"from\":\"0xDa52B9E673d1f48FcD9916b3F606A136a8eA5e55\",\"to\":\"0x7507454444fa193d39f1392076bc784b77a7a8ff\",\"value\":\"0x1\",\"nonce\":\"0x0\",\"gas\":\"0x5208\",\"gasPrice\":\"0x3b9aca00\"}"}]},
  {"namespace":"eth","name":"eth_sign","status":"limited","description":"Signs an EIP-191 personal message with a node-hosted key for the given address.","seiNote":"Only works for addresses in the node's local test keyring; production/public RPC nodes hold no hosted keys, so this returns 'address does not have hosted key'. Applies the EIP-191 personal-message TextHash before signing.","params":[{"name":"address","type":"DATA, 20 bytes","description":"Address whose hosted key signs the data.","example":"0xDa52B9E673d1f48FcD9916b3F606A136a8eA5e55"},{"name":"data","type":"DATA","description":"Message bytes to sign.","example":"0xdeadbeef"}]},
  {"namespace":"eth","name":"eth_getBlockByNumber","status":"supported","description":"Returns block information by number or tag, with full transactions when fullTx is true.","seiNote":"Under the eth namespace only EVM transactions are indexed (synthetic/bank-transfer txs excluded). Block number 0 returns a synthetic genesis block (for The Graph compatibility); future/non-existent numeric blocks return null. Uncle/PoW header fields (sha3Uncles, nonce, mixHash, difficulty) are placeholders and the uncles array is always empty (CometBFT consensus). safe/finalized/latest are equivalent due to instant finality.","params":[{"name":"number","type":"BLOCKNUMBER","description":"Block number (hex) or tag (latest/safe/finalized/pending/earliest).","example":"latest"},{"name":"fullTx","type":"boolean","description":"If true include full transaction objects, else only hashes.","example":"true"}]},
  {"namespace":"eth","name":"eth_getBlockByHash","status":"supported","description":"Returns block information by block hash, with full transactions when fullTx is true.","seiNote":"Block hashes are CometBFT block hashes (computed from the Tendermint header), so they differ from Ethereum block hashes and are not interchangeable across chains. Under the eth namespace synthetic txs and bank transfers are excluded. The genesis hash returns a synthetic genesis block; unknown/zero hash returns null. Uncles array is always empty.","params":[{"name":"blockHash","type":"DATA, 32 bytes","description":"Block hash.","example":"0x5620c15afd9a1d0ab19d7560043df6e038d731c6205974dca7a55900071e3864"},{"name":"fullTx","type":"boolean","description":"If true include full transaction objects, else only hashes.","example":"false"}]},
  {"namespace":"eth","name":"eth_getBlockTransactionCountByNumber","status":"supported","description":"Returns the number of EVM transactions in a block by number, as a hex quantity.","seiNote":"Counts EVM transactions only (via getEvmTxCount); synthetic/bank-transfer txs are excluded. Genesis returns 0x0; non-existent/future blocks return null.","params":[{"name":"number","type":"BLOCKNUMBER","description":"Block number or tag.","example":"latest"}]},
  {"namespace":"eth","name":"eth_getBlockTransactionCountByHash","status":"supported","description":"Returns the number of EVM transactions in a block by hash, as a hex quantity.","seiNote":"Counts EVM transactions only; synthetic/bank-transfer txs are excluded. Genesis hash returns 0x0; unknown hash returns null.","params":[{"name":"blockHash","type":"DATA, 32 bytes","description":"Block hash.","example":"0x5620c15afd9a1d0ab19d7560043df6e038d731c6205974dca7a55900071e3864"}]},
  {"namespace":"eth","name":"eth_getBlockReceipts","status":"supported","description":"Returns all EVM transaction receipts for a given block.","seiNote":"Under the eth namespace synthetic/shell receipts are excluded (includeShellReceipts=false). Genesis returns an empty array; zero hash returns null. transactionIndex is recomputed sequentially over the compacted receipt list.","params":[{"name":"blockNrOrHash","type":"BLOCKNUMBER or DATA","description":"Block number, tag, or hash.","example":"latest"}]},
  {"namespace":"eth","name":"eth_getTransactionByHash","status":"supported","description":"Returns the EVM transaction matching the given hash, or null if not found.","seiNote":"Sees EVM transactions only; if the hash resolves to a non-EVM Cosmos tx it errors. Pending lookups read from the CometBFT mempool, not a geth txpool. Use the legacy sei_getTransactionByHash to also surface Cosmos txs with synthetic representations.","params":[{"name":"hash","type":"DATA, 32 bytes","description":"Transaction hash.","example":"0x828c91592453fe7c5bf743204495a35bf02b67b579b8f59ee7eea8af031d7c14"}]},
  {"namespace":"eth","name":"eth_getTransactionReceipt","status":"supported","description":"Returns the receipt of a transaction by hash, or null if not found.","seiNote":"Receipt is reconstructed from keeper.GetReceipt + CometBFT block data rather than from a native MPT receipt trie; status/logs are standard Ethereum format.","params":[{"name":"hash","type":"DATA, 32 bytes","description":"Transaction hash.","example":"0x828c91592453fe7c5bf743204495a35bf02b67b579b8f59ee7eea8af031d7c14"}]},
  {"namespace":"eth","name":"eth_getTransactionByBlockNumberAndIndex","status":"supported","description":"Returns the EVM transaction at the given index within the block at the specified number.","seiNote":"Index maps over EVM transactions only; an out-of-range index yields a null result rather than an error.","params":[{"name":"blockNr","type":"BLOCKNUMBER","description":"Block number or tag.","example":"latest"},{"name":"index","type":"QUANTITY","description":"Transaction index within the block.","example":"0x0"}]},
  {"namespace":"eth","name":"eth_getTransactionByBlockHashAndIndex","status":"supported","description":"Returns the EVM transaction at the given index within the block identified by hash.","seiNote":"Index maps over EVM transactions only; same null-on-overflow semantics as the block-number variant.","params":[{"name":"blockHash","type":"DATA, 32 bytes","description":"Block hash.","example":"0x5620c15afd9a1d0ab19d7560043df6e038d731c6205974dca7a55900071e3864"},{"name":"index","type":"QUANTITY","description":"Transaction index within the block.","example":"0x0"}]},
  {"namespace":"eth","name":"eth_getTransactionCount","status":"supported","description":"Returns the number of transactions sent from an address (nonce) at a given block.","seiNote":"For the 'pending' tag Sei returns EvmNextPendingNonce from the CometBFT mempool (or redirects to an EvmProxy if the sender is sharded there). safe/finalized/latest are equivalent due to instant finality.","params":[{"name":"address","type":"DATA, 20 bytes","description":"Account address.","example":"0xDa52B9E673d1f48FcD9916b3F606A136a8eA5e55"},{"name":"blockNrOrHash","type":"BLOCKNUMBER or DATA","description":"Block number, tag, or hash; 'pending' returns the next pending nonce.","example":"latest"}]},
  {"namespace":"eth","name":"eth_getVMError","status":"limited","description":"Sei extension that returns the EVM VM error string recorded in a transaction's receipt by hash.","seiNote":"Non-standard Sei extension registered under the eth namespace. Returns the receipt's VmError field and propagates a not-found error (unlike eth_getTransactionErrorByHash, which returns an empty string on not-found).","params":[{"name":"hash","type":"DATA, 32 bytes","description":"Transaction hash.","example":"0x828c91592453fe7c5bf743204495a35bf02b67b579b8f59ee7eea8af031d7c14"}]},
  {"namespace":"eth","name":"eth_getTransactionErrorByHash","status":"limited","description":"Sei extension that returns the recorded VM error string for a transaction by hash (empty string if it succeeded or is not found).","seiNote":"Non-standard Sei extension registered under the eth namespace. Unlike eth_getVMError, a not-found lookup returns an empty string and no error.","params":[{"name":"hash","type":"DATA, 32 bytes","description":"Transaction hash.","example":"0x828c91592453fe7c5bf743204495a35bf02b67b579b8f59ee7eea8af031d7c14"}]},
  {"namespace":"eth","name":"eth_newFilter","status":"supported","description":"Creates a log filter for the given criteria and returns a filter ID for later polling.","seiNote":"Subject to the same range/size caps as eth_getLogs: open-ended ranges return up to 10,000 logs (DefaultMaxLogLimit); close-ended ranges are limited to 2,000 blocks (DefaultMaxBlockRange), with large-query rate limiting.","params":[{"name":"crit","type":"object","description":"Filter criteria: fromBlock, toBlock (or blockHash), address(es), and topics.","example":"{\"fromBlock\":\"latest\",\"address\":\"0xE30feDd158A2e3b13e9badaeABaFc5516e95e8C7\",\"topics\":[]}"}]},
  {"namespace":"eth","name":"eth_newBlockFilter","status":"supported","description":"Creates a filter that tracks newly arrived block hashes and returns its ID."},
  {"namespace":"eth","name":"eth_newPendingTransactionFilter","status":"unsupported","description":"Pending-transaction filter. Registered but always returns an unsupported error.","seiNote":"Always returns JSON-RPC -32000. Sei has no geth-style public pending mempool to filter; the corresponding newPendingTransactions subscription type is likewise unavailable."},
  {"namespace":"eth","name":"eth_getFilterChanges","status":"supported","description":"Polls a filter and returns new logs (log filters) or block hashes (block filters) since the last poll.","params":[{"name":"filterID","type":"QUANTITY/ID","description":"Filter ID from a New*Filter call.","example":"0x1"}]},
  {"namespace":"eth","name":"eth_getFilterLogs","status":"supported","description":"Returns all logs matching a previously created log filter, including historical logs.","seiNote":"Bounded by the same caps as eth_getLogs (2,000-block range, 10,000-log limit) with large-query rate limiting.","params":[{"name":"filterID","type":"QUANTITY/ID","description":"Filter ID from a NewFilter call.","example":"0x1"}]},
  {"namespace":"eth","name":"eth_getLogs","status":"supported","description":"Returns logs matching the given filter criteria.","seiNote":"Returns EVM logs only. Hard limits: max 2,000 blocks per close-ended query and up to 10,000 logs per response; exceeding the range errors with 'block range too large'. Large queries are globally rate-limited. Use the legacy sei_getLogs to include synthetic logs from Cosmos activity.","params":[{"name":"crit","type":"object","description":"Filter criteria: fromBlock, toBlock (or blockHash), address(es), topics.","example":"{\"fromBlock\":\"0x0\",\"toBlock\":\"latest\",\"address\":\"0xE30feDd158A2e3b13e9badaeABaFc5516e95e8C7\",\"topics\":[]}"}]},
  {"namespace":"eth","name":"eth_uninstallFilter","status":"supported","description":"Removes a previously installed filter by ID; returns true if it existed and was removed.","seiNote":"Returns false if the filter did not exist rather than erroring. Filters also expire automatically when not polled.","params":[{"name":"filterID","type":"QUANTITY/ID","description":"Filter ID to remove.","example":"0x1"}]},
  {"namespace":"eth","name":"eth_subscribe","status":"limited","description":"Opens a WebSocket-only push subscription for newHeads or logs notifications.","seiNote":"WebSocket-only (SubscriptionAPI is not registered on the HTTP server; returns rpc.ErrNotificationsUnsupported over HTTP). Only 'newHeads' and 'logs' are implemented in source; there is no 'newPendingTransactions' subscription despite some client docs implying otherwise. newHeads subscriptions are capped by MaxSubscriptionsNewHead.","params":[{"name":"subscriptionType","type":"string","description":"Subscription name: 'newHeads' or 'logs'.","example":"newHeads"},{"name":"filter","type":"object","description":"Optional filter criteria (address/topics) for the 'logs' subscription.","example":"{\"address\":\"0xE30feDd158A2e3b13e9badaeABaFc5516e95e8C7\",\"topics\":[]}"}]},
  {"namespace":"eth","name":"eth_unsubscribe","status":"supported","description":"Cancels an existing WebSocket subscription by ID; returns true on success.","seiNote":"WebSocket only; has no effect over HTTP (notifications unsupported there).","params":[{"name":"subscriptionID","type":"string","description":"The subscription ID returned by a prior eth_subscribe call.","example":"0x9cef478923ff08bf67fde6c64013158d"}]},
  {"namespace":"eth","name":"eth_mining","status":"unsupported","description":"Whether the node is mining. Not registered on Sei.","seiNote":"Sei uses CometBFT proof-of-stake consensus with no PoW mining; the method is not registered and returns -32601 method not found."},
  {"namespace":"eth","name":"eth_hashrate","status":"unsupported","description":"Node mining hashrate. Not registered on Sei.","seiNote":"No PoW mining on Sei (CometBFT consensus); not registered, returns -32601 method not found."},
  {"namespace":"eth","name":"eth_getWork","status":"unsupported","description":"PoW work package (current header hash, seed, target). Not registered on Sei.","seiNote":"The proof-of-work concept does not exist under Sei's CometBFT consensus; not registered."},
  {"namespace":"eth","name":"eth_submitWork","status":"unsupported","description":"Submit a PoW solution. Not registered on Sei.","seiNote":"PoW submission is meaningless on Sei (CometBFT PoS); not registered.","params":[{"name":"nonce","type":"DATA, 8 bytes","description":"Found PoW nonce.","example":"0x0000000000000001"},{"name":"powHash","type":"DATA, 32 bytes","description":"Header pow-hash.","example":"0x0000000000000000000000000000000000000000000000000000000000000000"},{"name":"mixDigest","type":"DATA, 32 bytes","description":"Mix digest.","example":"0x0000000000000000000000000000000000000000000000000000000000000000"}]},
  {"namespace":"eth","name":"eth_submitHashrate","status":"unsupported","description":"Submit a node's mining hashrate. Not registered on Sei.","seiNote":"No PoW mining on Sei; not registered.","params":[{"name":"hashrate","type":"QUANTITY","description":"Hashrate value (hex).","example":"0x500000"},{"name":"id","type":"DATA, 32 bytes","description":"Random hex ID identifying the client.","example":"0x59daa26581d0acd1fce254fb7e85952f4c09d0915afd33d3886cd914bc7d283c"}]},
  {"namespace":"eth","name":"eth_protocolVersion","status":"unsupported","description":"Ethereum (devp2p) protocol version. Not registered on Sei.","seiNote":"Sei does not expose the Ethereum devp2p protocol version; not registered, returns -32601 method not found."},
  {"namespace":"eth","name":"eth_getUncleCountByBlockNumber","status":"unsupported","description":"Uncle count by block number. Not registered; Sei has no uncles.","seiNote":"Sei uses CometBFT (single canonical chain, no uncles/ommers); not registered, returns -32601.","params":[{"name":"number","type":"BLOCKNUMBER","description":"Block number or tag.","example":"latest"}]},
  {"namespace":"eth","name":"eth_getUncleCountByBlockHash","status":"unsupported","description":"Uncle count by block hash. Not registered; Sei has no uncles.","seiNote":"No uncle blocks under CometBFT consensus; not registered, returns -32601.","params":[{"name":"blockHash","type":"DATA, 32 bytes","description":"Block hash.","example":"0x5620c15afd9a1d0ab19d7560043df6e038d731c6205974dca7a55900071e3864"}]},
  {"namespace":"eth","name":"eth_getUncleByBlockNumberAndIndex","status":"unsupported","description":"Uncle block by number and index. Not registered; Sei has no uncles.","seiNote":"No uncle blocks under CometBFT consensus; not registered, returns -32601.","params":[{"name":"number","type":"BLOCKNUMBER","description":"Block number or tag.","example":"latest"},{"name":"index","type":"QUANTITY","description":"Uncle index.","example":"0x0"}]},
  {"namespace":"eth","name":"eth_getUncleByBlockHashAndIndex","status":"unsupported","description":"Uncle block by hash and index. Not registered; Sei has no uncles.","seiNote":"No uncle blocks under CometBFT consensus; not registered, returns -32601.","params":[{"name":"blockHash","type":"DATA, 32 bytes","description":"Block hash.","example":"0x5620c15afd9a1d0ab19d7560043df6e038d731c6205974dca7a55900071e3864"},{"name":"index","type":"QUANTITY","description":"Uncle index.","example":"0x0"}]},
  {"namespace":"eth","name":"eth_pendingTransactions","status":"unsupported","description":"List pending transactions in the node's transaction pool. Not registered on Sei.","seiNote":"Sei exposes no geth-style mempool through this method; pending state is surfaced only via the 'pending' tag on eth_getTransactionCount and via txpool_content. Not registered, returns -32601."},
  {"namespace":"net","name":"net_version","status":"supported","description":"Returns the network/chain ID as a decimal string.","seiNote":"Returns the EVM chain ID in decimal (alias of eth_chainId): '1329' on pacific-1 mainnet, '1328' on atlantic-2 testnet."},
  {"namespace":"net","name":"net_listening","status":"unsupported","description":"Whether the node is listening for connections. Not registered on Sei.","seiNote":"Not registered on Sei's NetAPI; returns -32601 method not found (P2P is handled by CometBFT, not this RPC)."},
  {"namespace":"net","name":"net_peerCount","status":"unsupported","description":"Number of connected peers. Not registered on Sei.","seiNote":"Not registered on Sei's NetAPI; returns -32601. Query CometBFT net_info for peer data instead."},
  {"namespace":"web3","name":"web3_clientVersion","status":"supported","description":"Returns the client version string.","seiNote":"Reports a synthetic 'Geth/<os>-<arch>/<goVersion>' string (Sei's EVM is backed by go-ethereum); it does NOT embed the actual sei-chain/seid version, so it is not a reliable Sei version indicator."},
  {"namespace":"web3","name":"web3_sha3","status":"unsupported","description":"Keccak-256 hash of the input. Not implemented in Sei's Web3API.","seiNote":"Unlike go-ethereum, Sei's Web3API does not implement web3_sha3; it is not registered and returns -32601 method not found.","params":[{"name":"data","type":"DATA","description":"Bytes to hash.","example":"0x68656c6c6f20776f726c64"}]},
  {"namespace":"txpool","name":"txpool_content","status":"limited","description":"Returns the transactions currently in the pool, grouped by sender address and nonce into pending and queued buckets.","seiNote":"Sei-specific simplification: every unconfirmed EVM tx from the CometBFT mempool is reported under 'pending' and 'queued' is always empty (no geth-style pending/queued nonce-gap distinction). The result set is truncated to the node's MaxTxPoolTxs config, so it may not reflect the entire mempool."},
  {"namespace":"txpool","name":"txpool_contentFrom","status":"unsupported","description":"Pending/queued transactions for a single account. Not implemented on Sei.","seiNote":"Not registered; returns -32601 method not found. The only txpool method available on Sei is txpool_content.","params":[{"name":"address","type":"DATA, 20 bytes","description":"The account address to filter by.","example":"0xDa52B9E673d1f48FcD9916b3F606A136a8eA5e55"}]},
  {"namespace":"txpool","name":"txpool_status","status":"unsupported","description":"Counts of pending and queued transactions. Not implemented on Sei.","seiNote":"Not registered; returns -32601 method not found."},
  {"namespace":"txpool","name":"txpool_inspect","status":"unsupported","description":"Human-readable summary of pending/queued transactions. Not implemented on Sei.","seiNote":"Not registered; returns -32601 method not found."},
  {"namespace":"debug","name":"debug_traceTransaction","status":"supported","description":"Replays a transaction by hash and returns an execution trace using the configured tracer.","seiNote":"HTTP-only (the debug namespace is not registered on the WebSocket server). Supports geth tracers (callTracer, prestateTracer, flatCallTracer, struct/opcode logger); callTracer/prestateTracer/flatCallTracer results are pre-baked/cached via TraceBaker. Requires trace-enabled/archive state for the target height.","params":[{"name":"hash","type":"DATA, 32 bytes","description":"Transaction hash to trace.","example":"0x5c504ed432cb51138bcf09aa5e8a410dd4a1e204ef84bfed1be16dfba1b22060"},{"name":"config","type":"object","description":"Optional tracer config (tracer name, tracerConfig, timeout, reexec, disableStorage/Stack/Memory).","example":"{\"tracer\":\"callTracer\"}"}]},
  {"namespace":"debug","name":"debug_traceBlockByNumber","status":"supported","description":"Traces all transactions in a block by number and returns per-transaction execution traces.","seiNote":"HTTP-only. safe/finalized/latest are equivalent due to instant finality.","params":[{"name":"number","type":"BLOCKNUMBER","description":"Block number or tag.","example":"latest"},{"name":"config","type":"object","description":"Optional tracer config.","example":"{\"tracer\":\"callTracer\"}"}]},
  {"namespace":"debug","name":"debug_traceBlockByHash","status":"supported","description":"Traces all transactions in a block by hash and returns per-transaction execution traces.","seiNote":"HTTP-only.","params":[{"name":"hash","type":"DATA, 32 bytes","description":"Block hash.","example":"0x5620c15afd9a1d0ab19d7560043df6e038d731c6205974dca7a55900071e3864"},{"name":"config","type":"object","description":"Optional tracer config.","example":"{\"tracer\":\"callTracer\"}"}]},
  {"namespace":"debug","name":"debug_traceCall","status":"supported","description":"Executes and traces a call against a block's state without creating a transaction.","seiNote":"HTTP-only. Arbitrary geth tracer names pass through. Tracing on the pending block is not supported.","params":[{"name":"args","type":"object","description":"Transaction call object.","example":"{\"to\":\"0xE30feDd158A2e3b13e9badaeABaFc5516e95e8C7\",\"data\":\"0x70a08231\"}"},{"name":"blockNrOrHash","type":"BLOCKNUMBER or DATA","description":"Block number, tag, or hash.","example":"latest"},{"name":"config","type":"object","description":"Optional trace-call config (tracer name, state overrides, block overrides).","example":"{\"tracer\":\"callTracer\"}"}]},
  {"namespace":"debug","name":"debug_traceStateAccess","status":"limited","description":"Sei extension that replays a transaction and returns its app/tendermint/receipt state-access traces.","seiNote":"Sei-specific extension (not part of upstream go-ethereum's debug namespace). HTTP-only and subject to historical-debug-trace availability guards.","params":[{"name":"hash","type":"DATA, 32 bytes","description":"Transaction hash whose state accesses are returned.","example":"0x5c504ed432cb51138bcf09aa5e8a410dd4a1e204ef84bfed1be16dfba1b22060"}]},
  {"namespace":"debug","name":"debug_getRawHeader","status":"unsupported","description":"RLP-encoded block header. Registered but always returns an unsupported error.","seiNote":"Always returns JSON-RPC -32000. Sei block headers are CometBFT headers, not RLP-encoded Ethereum headers.","params":[{"name":"blockNrOrHash","type":"BLOCKNUMBER or DATA","description":"Block number, tag, or hash.","example":"latest"}]},
  {"namespace":"debug","name":"debug_getRawBlock","status":"unsupported","description":"RLP-encoded full block. Registered but always returns an unsupported error.","seiNote":"Always returns JSON-RPC -32000; no canonical RLP-encoded Ethereum block exists on Sei.","params":[{"name":"blockNrOrHash","type":"BLOCKNUMBER or DATA","description":"Block number, tag, or hash.","example":"latest"}]},
  {"namespace":"debug","name":"debug_getRawReceipts","status":"unsupported","description":"RLP-encoded receipts for a block. Registered but always returns an unsupported error.","seiNote":"Always returns JSON-RPC -32000.","params":[{"name":"blockNrOrHash","type":"BLOCKNUMBER or DATA","description":"Block number, tag, or hash.","example":"latest"}]},
  {"namespace":"debug","name":"debug_getRawTransaction","status":"unsupported","description":"RLP-encoded signed transaction by hash. Registered but always returns an unsupported error.","seiNote":"Always returns JSON-RPC -32000.","params":[{"name":"hash","type":"DATA, 32 bytes","description":"Transaction hash.","example":"0x5c504ed432cb51138bcf09aa5e8a410dd4a1e204ef84bfed1be16dfba1b22060"}]},
  {"namespace":"debug","name":"debug_storageRangeAt","status":"unsupported","description":"Range of storage entries for a contract at a block/tx. Not implemented on Sei.","seiNote":"Not registered; returns -32601. Sei uses IAVL state, not an Ethereum MPT, so geth's MPT-based storage-range walk is not provided.","params":[{"name":"blockHash","type":"DATA, 32 bytes","description":"Block hash.","example":"0x5620c15afd9a1d0ab19d7560043df6e038d731c6205974dca7a55900071e3864"},{"name":"txIndex","type":"QUANTITY","description":"Transaction index.","example":"0x0"},{"name":"address","type":"DATA, 20 bytes","description":"Contract address.","example":"0xE30feDd158A2e3b13e9badaeABaFc5516e95e8C7"},{"name":"startKey","type":"DATA","description":"Start storage key.","example":"0x00"},{"name":"maxResult","type":"QUANTITY","description":"Maximum number of entries.","example":"0x64"}]},
  {"namespace":"debug","name":"debug_traceBlock","status":"unsupported","description":"Trace a block supplied as raw RLP bytes. Not implemented on Sei.","seiNote":"Not registered; returns -32601. Sei does not accept RLP-encoded Ethereum blocks; use debug_traceBlockByNumber/ByHash instead.","params":[{"name":"blockRlp","type":"DATA","description":"RLP-encoded block bytes.","example":"0xf90211..."}]},
  {"namespace":"debug","name":"debug_intermediateRoots","status":"unsupported","description":"Intermediate state roots while executing a block. Not implemented on Sei.","seiNote":"Not registered; returns -32601. Sei uses IAVL state, not an Ethereum MPT, so per-transaction MPT intermediate roots are not produced.","params":[{"name":"blockHash","type":"DATA, 32 bytes","description":"Block hash.","example":"0x5620c15afd9a1d0ab19d7560043df6e038d731c6205974dca7a55900071e3864"},{"name":"config","type":"object","description":"Optional trace config.","example":"{}"}]},
  {"namespace":"debug","name":"debug_setHead","status":"unsupported","description":"Rewind the chain head to a given block. Not implemented on Sei.","seiNote":"Not registered; returns -32601. The chain head is controlled by CometBFT consensus, not the EVM RPC layer.","params":[{"name":"number","type":"QUANTITY","description":"Block number to set as head.","example":"0x1a2b3c"}]},
  {"namespace":"sei","name":"sei_getSeiAddress","status":"limited","description":"Returns the native Sei bech32 (sei1...) address associated with a given EVM (0x) address.","seiNote":"Deprecated legacy sei_* method, but ENABLED by default in the enabled_legacy_sei_apis allowlist on seid init. New integrations should call the addr precompile at 0x0000000000000000000000000000000000001004 (getSeiAddr) via eth_call. Errors if the address is not yet associated. HTTP-only.","params":[{"name":"ethAddress","type":"DATA, 20 bytes","description":"The EVM address to resolve.","example":"0xDa52B9E673d1f48FcD9916b3F606A136a8eA5e55"}]},
  {"namespace":"sei","name":"sei_getEVMAddress","status":"limited","description":"Returns the EVM (0x) address associated with a given native Sei bech32 (sei1...) address.","seiNote":"Deprecated legacy sei_* method, ENABLED by default in enabled_legacy_sei_apis. Prefer the addr precompile at 0x...1004 (getEvmAddr) via eth_call. Errors if the bech32 is malformed or the address is not yet associated. HTTP-only.","params":[{"name":"seiAddress","type":"string","description":"The Sei bech32 address to resolve.","example":"sei13ytysxs88z0fp9cssagg77ekpecrrlrwce9pwl"}]},
  {"namespace":"sei","name":"sei_getCosmosTx","status":"limited","description":"Returns the underlying CometBFT/Cosmos transaction hash corresponding to a given EVM transaction hash.","seiNote":"Deprecated legacy sei_* method, but ENABLED by default in enabled_legacy_sei_apis (it has no precompile equivalent yet). Bridges Sei's dual-tx model: every EVM tx is wrapped in a Cosmos tx; this returns the wrapping Cosmos tx hash. HTTP-only.","params":[{"name":"ethHash","type":"DATA, 32 bytes","description":"The EVM transaction hash to map to its underlying Cosmos tx hash.","example":"0x828c91592453fe7c5bf743204495a35bf02b67b579b8f59ee7eea8af031d7c14"}]},
  {"namespace":"sei","name":"sei_getEvmTx","status":"limited","description":"Returns the EVM transaction hash corresponding to a given CometBFT/Cosmos transaction hash.","seiNote":"Deprecated legacy sei_* method and DISABLED by default (not in the default enabled_legacy_sei_apis allowlist); disabled calls return -32601 with data 'legacy_sei_deprecated'. Inverse of sei_getCosmosTx; the cosmosHash arg is a plain hex string (no 0x prefix). HTTP-only.","params":[{"name":"cosmosHash","type":"string","description":"The Cosmos/CometBFT transaction hash as a hex string (no 0x prefix).","example":"A1B2C3D4E5F60718293A4B5C6D7E8F90A1B2C3D4E5F60718293A4B5C6D7E8F901"}]},
  {"namespace":"sei","name":"sei_associate","status":"limited","description":"Submits an address-association transaction linking an EVM address and its Sei address via a signed payload.","seiNote":"Deprecated legacy sei_* method, DISABLED by default (not in the default enabled_legacy_sei_apis allowlist). Broadcasts a real Cosmos AssociateTx (no gas) and returns no result on success. The same action is available on-chain via the addr precompile at 0x...1004 (associate/associatePubKey). HTTP-only.","params":[{"name":"req","type":"object","description":"AssociateRequest with hex-string signature components r, s, v and a custom_message.","example":"{\"r\":\"0x1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8\",\"s\":\"0x2c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8\",\"v\":\"0x1b\",\"custom_message\":\"associate\"}"}]},
  {"namespace":"sei","name":"sei_getBlockByNumber","status":"limited","description":"Returns block info by number including Cosmos transactions that have synthetic EVM receipts.","seiNote":"Deprecated legacy sei_* method, DISABLED by default (must be added to enabled_legacy_sei_apis); disabled calls return -32601 with data 'legacy_sei_deprecated'. Unlike eth_getBlockByNumber it includes synthetic (shell) EVM txs for Cosmos activity, so tx indices differ from eth_. HTTP-only.","params":[{"name":"number","type":"BLOCKNUMBER","description":"Block number or tag.","example":"latest"},{"name":"fullTx","type":"boolean","description":"If true include full transaction objects, else only hashes.","example":"true"}]},
  {"namespace":"sei","name":"sei_getBlockByHash","status":"limited","description":"Returns block info by hash including Cosmos transactions that have synthetic EVM receipts.","seiNote":"Deprecated legacy sei_* method, DISABLED by default. Includes synthetic shell EVM txs (bank/Cosmos activity), unlike eth_getBlockByHash. HTTP-only.","params":[{"name":"blockHash","type":"DATA, 32 bytes","description":"Block hash.","example":"0x5620c15afd9a1d0ab19d7560043df6e038d731c6205974dca7a55900071e3864"},{"name":"fullTx","type":"boolean","description":"If true include full transaction objects, else only hashes.","example":"false"}]},
  {"namespace":"sei","name":"sei_getBlockReceipts","status":"limited","description":"Returns all receipts for a block including synthetic receipts for Cosmos transactions.","seiNote":"Deprecated legacy sei_* method, DISABLED by default. Returns more receipts than eth_getBlockReceipts for the same block (covering Sei synthetic/Cosmos-originated EVM activity). HTTP-only.","params":[{"name":"blockNrOrHash","type":"BLOCKNUMBER or DATA","description":"Block number, tag, or hash.","example":"latest"}]},
  {"namespace":"sei","name":"sei_getBlockTransactionCountByNumber","status":"limited","description":"Returns the transaction count of a block by number, including synthetic Cosmos txs.","seiNote":"Deprecated legacy sei_* method, DISABLED by default. HTTP-only.","params":[{"name":"number","type":"BLOCKNUMBER","description":"Block number or tag.","example":"latest"}]},
  {"namespace":"sei","name":"sei_getBlockTransactionCountByHash","status":"limited","description":"Returns the transaction count of a block by hash, including synthetic Cosmos txs.","seiNote":"Deprecated legacy sei_* method, DISABLED by default. HTTP-only.","params":[{"name":"blockHash","type":"DATA, 32 bytes","description":"Block hash.","example":"0x5620c15afd9a1d0ab19d7560043df6e038d731c6205974dca7a55900071e3864"}]},
  {"namespace":"sei","name":"sei_getBlockByNumberExcludeTraceFail","status":"limited","description":"Returns a block by number excluding transactions whose EVM trace failed (Sei extension).","seiNote":"Deprecated legacy sei_* method, DISABLED by default. Sei-only method (no Ethereum equivalent) that omits untraceable txs; passes includeSyntheticTxs=false, excludeUntraceable=true. HTTP-only.","params":[{"name":"number","type":"BLOCKNUMBER","description":"Block number or tag.","example":"latest"},{"name":"fullTx","type":"boolean","description":"If true include full transaction objects, else only hashes.","example":"true"}]},
  {"namespace":"sei","name":"sei_getBlockByHashExcludeTraceFail","status":"limited","description":"Returns a block by hash excluding transactions whose EVM trace failed (Sei extension).","seiNote":"Deprecated legacy sei_* method, DISABLED by default. Sei-only method (no Ethereum equivalent) that omits untraceable txs. HTTP-only.","params":[{"name":"blockHash","type":"DATA, 32 bytes","description":"Block hash.","example":"0x5620c15afd9a1d0ab19d7560043df6e038d731c6205974dca7a55900071e3864"},{"name":"fullTx","type":"boolean","description":"If true include full transaction objects, else only hashes.","example":"true"}]},
  {"namespace":"sei","name":"sei_getTransactionByHash","status":"limited","description":"Returns a transaction by hash including Cosmos txs with synthetic EVM representation.","seiNote":"Deprecated legacy sei_* method, DISABLED by default. Broader visibility than eth_getTransactionByHash (also surfaces Cosmos txs). HTTP-only.","params":[{"name":"hash","type":"DATA, 32 bytes","description":"Transaction hash.","example":"0x828c91592453fe7c5bf743204495a35bf02b67b579b8f59ee7eea8af031d7c14"}]},
  {"namespace":"sei","name":"sei_getTransactionReceipt","status":"limited","description":"Returns a transaction receipt by hash including synthetic receipts for Cosmos txs.","seiNote":"Deprecated legacy sei_* method, DISABLED by default. Broader visibility than eth_getTransactionReceipt. HTTP-only.","params":[{"name":"hash","type":"DATA, 32 bytes","description":"Transaction hash.","example":"0x828c91592453fe7c5bf743204495a35bf02b67b579b8f59ee7eea8af031d7c14"}]},
  {"namespace":"sei","name":"sei_getTransactionReceiptExcludeTraceFail","status":"limited","description":"Returns a transaction receipt, omitting it if the transaction panicked/failed during trace (Sei extension).","seiNote":"Deprecated legacy sei_* method, DISABLED by default. Calls getTransactionReceipt with excludePanicTxs=true, so receipts for panic/trace-fail txs are omitted (returns null). HTTP-only.","params":[{"name":"hash","type":"DATA, 32 bytes","description":"Transaction hash.","example":"0x828c91592453fe7c5bf743204495a35bf02b67b579b8f59ee7eea8af031d7c14"}]},
  {"namespace":"sei","name":"sei_getTransactionByBlockNumberAndIndex","status":"limited","description":"Returns a transaction by block number and index over the combined (incl. Cosmos) transaction set.","seiNote":"Deprecated legacy sei_* method, DISABLED by default. The index space includes Cosmos txs, so it differs from eth_. HTTP-only.","params":[{"name":"blockNumber","type":"BLOCKNUMBER","description":"Block number or tag.","example":"latest"},{"name":"index","type":"QUANTITY","description":"Transaction index over all txs, including Cosmos.","example":"0x0"}]},
  {"namespace":"sei","name":"sei_getTransactionByBlockHashAndIndex","status":"limited","description":"Returns a transaction by block hash and index over the combined (incl. Cosmos) transaction set.","seiNote":"Deprecated legacy sei_* method, DISABLED by default. HTTP-only.","params":[{"name":"blockHash","type":"DATA, 32 bytes","description":"Block hash.","example":"0x5620c15afd9a1d0ab19d7560043df6e038d731c6205974dca7a55900071e3864"},{"name":"index","type":"QUANTITY","description":"Transaction index over all txs, including Cosmos.","example":"0x0"}]},
  {"namespace":"sei","name":"sei_getTransactionCount","status":"limited","description":"Returns the transaction count (nonce) of an address at a given block.","seiNote":"Deprecated legacy sei_* method, DISABLED by default. Prefer eth_getTransactionCount. HTTP-only.","params":[{"name":"address","type":"DATA, 20 bytes","description":"Account address.","example":"0xDa52B9E673d1f48FcD9916b3F606A136a8eA5e55"},{"name":"blockNrOrHash","type":"BLOCKNUMBER or DATA","description":"Block number, tag, or hash.","example":"latest"}]},
  {"namespace":"sei","name":"sei_getTransactionErrorByHash","status":"limited","description":"Returns the recorded error message for a failed transaction by hash.","seiNote":"Deprecated legacy sei_* method, DISABLED by default (not in the default allowlist). HTTP-only.","params":[{"name":"hash","type":"DATA, 32 bytes","description":"Transaction hash.","example":"0x828c91592453fe7c5bf743204495a35bf02b67b579b8f59ee7eea8af031d7c14"}]},
  {"namespace":"sei","name":"sei_getVMError","status":"limited","description":"Returns the EVM/VM error string for a transaction by hash.","seiNote":"Deprecated legacy sei_* method, DISABLED by default. HTTP-only.","params":[{"name":"hash","type":"DATA, 32 bytes","description":"Transaction hash.","example":"0x828c91592453fe7c5bf743204495a35bf02b67b579b8f59ee7eea8af031d7c14"}]},
  {"namespace":"sei","name":"sei_getLogs","status":"limited","description":"Returns logs matching filter criteria, including synthetic logs from Cosmos transactions.","seiNote":"Deprecated legacy sei_* method, DISABLED by default. Unlike eth_getLogs it includes synthetic logs from Cosmos txs. Subject to the same 2,000-block / 10,000-log caps. HTTP-only.","params":[{"name":"crit","type":"object","description":"Filter criteria (fromBlock, toBlock, address, topics, blockHash).","example":"{\"fromBlock\":\"0x0\",\"toBlock\":\"latest\",\"address\":\"0xE30feDd158A2e3b13e9badaeABaFc5516e95e8C7\"}"}]},
  {"namespace":"sei","name":"sei_getFilterLogs","status":"limited","description":"Returns all logs for a filter ID, including synthetic Cosmos logs.","seiNote":"Deprecated legacy sei_* method, DISABLED by default. HTTP-only.","params":[{"name":"filterID","type":"QUANTITY/ID","description":"Filter ID.","example":"0x1"}]},
  {"namespace":"sei","name":"sei_getFilterChanges","status":"limited","description":"Returns new logs/hashes since the last poll of a filter (Sei view including synthetic events).","seiNote":"Deprecated legacy sei_* method, DISABLED by default. HTTP-only.","params":[{"name":"filterID","type":"QUANTITY/ID","description":"Filter ID.","example":"0x1"}]},
  {"namespace":"sei","name":"sei_newFilter","status":"limited","description":"Creates a log filter over the Sei (EVM+synthetic) view and returns its ID.","seiNote":"Deprecated legacy sei_* method, DISABLED by default. HTTP-only.","params":[{"name":"crit","type":"object","description":"Filter criteria (fromBlock, toBlock, address, topics).","example":"{\"fromBlock\":\"latest\",\"address\":\"0xE30feDd158A2e3b13e9badaeABaFc5516e95e8C7\",\"topics\":[]}"}]},
  {"namespace":"sei","name":"sei_newBlockFilter","status":"limited","description":"Creates a new-block filter (Sei view) and returns its ID.","seiNote":"Deprecated legacy sei_* method, DISABLED by default. HTTP-only."},
  {"namespace":"sei","name":"sei_uninstallFilter","status":"limited","description":"Removes a previously created sei filter by ID.","seiNote":"Deprecated legacy sei_* method, DISABLED by default. HTTP-only.","params":[{"name":"filterID","type":"QUANTITY/ID","description":"Filter ID.","example":"0x1"}]},
  {"namespace":"sei","name":"sei_traceBlockByNumberExcludeTraceFail","status":"limited","description":"Traces all transactions in a block by number, excluding those whose trace failed (Sei extension).","seiNote":"Deprecated legacy sei_* method (registered via SeiDebugAPI), DISABLED by default. Filters out txs whose trace errored. HTTP-only.","params":[{"name":"number","type":"BLOCKNUMBER","description":"Block number or tag.","example":"latest"},{"name":"config","type":"object","description":"Optional tracer config.","example":"{\"tracer\":\"callTracer\"}"}]},
  {"namespace":"sei","name":"sei_traceBlockByHashExcludeTraceFail","status":"limited","description":"Traces all transactions in a block by hash, excluding those whose trace failed (Sei extension).","seiNote":"Deprecated legacy sei_* method (registered via SeiDebugAPI), DISABLED by default. HTTP-only.","params":[{"name":"hash","type":"DATA, 32 bytes","description":"Block hash.","example":"0x5620c15afd9a1d0ab19d7560043df6e038d731c6205974dca7a55900071e3864"},{"name":"config","type":"object","description":"Optional tracer config.","example":"{\"tracer\":\"callTracer\"}"}]},
  {"namespace":"sei","name":"sei_sign","status":"limited","description":"Signs data with a node-hosted key (Sei legacy variant of eth_sign).","seiNote":"Deprecated legacy sei_* method, DISABLED by default; notably the Docker localnet enables all gated methods EXCEPT sei_sign. Requires a node-hosted key (unusable on public RPC). HTTP-only.","params":[{"name":"address","type":"DATA, 20 bytes","description":"Account to sign with (must be in the node keyring).","example":"0xDa52B9E673d1f48FcD9916b3F606A136a8eA5e55"},{"name":"data","type":"DATA","description":"Data to sign.","example":"0xdeadbeef"}]},
  {"namespace":"sei2","name":"sei2_getBlockByNumber","status":"limited","description":"Returns block info by number in the sei block shape, additionally including Cosmos bank transfers.","seiNote":"Deprecated legacy sei2_* method, DISABLED by default (all sei2_* methods must be explicitly added to enabled_legacy_sei_apis); disabled calls return -32601 with data 'legacy_sei_deprecated'. Same shape as sei_ blocks plus Cosmos bank MsgSend transfers surfaced as synthetic EVM txs. HTTP-only (Sei2BlockAPI is not on the WebSocket server).","params":[{"name":"number","type":"BLOCKNUMBER","description":"Block number or tag.","example":"latest"},{"name":"fullTx","type":"boolean","description":"If true include full transaction objects, else only hashes.","example":"true"}]},
  {"namespace":"sei2","name":"sei2_getBlockByHash","status":"limited","description":"Returns block info by hash in the sei block shape, additionally including Cosmos bank transfers.","seiNote":"Deprecated legacy sei2_* method, DISABLED by default. Includes bank transfers in the block payload. HTTP-only.","params":[{"name":"blockHash","type":"DATA, 32 bytes","description":"Block hash.","example":"0x5620c15afd9a1d0ab19d7560043df6e038d731c6205974dca7a55900071e3864"},{"name":"fullTx","type":"boolean","description":"If true include full transaction objects, else only hashes.","example":"false"}]},
  {"namespace":"sei2","name":"sei2_getBlockReceipts","status":"limited","description":"Returns all receipts for a block in the sei2 shape (with bank-transfer context).","seiNote":"Deprecated legacy sei2_* method, DISABLED by default. HTTP-only. Note: in some source revisions the inherited GetBlockReceipts calls shouldIncludeSynthetic(\"sei2\"), which only accepts 'eth'/'sei' and can surface as an internal error for the sei2 namespace.","params":[{"name":"blockNrOrHash","type":"BLOCKNUMBER or DATA","description":"Block number, tag, or hash.","example":"latest"}]},
  {"namespace":"sei2","name":"sei2_getBlockTransactionCountByNumber","status":"limited","description":"Returns the transaction count of a block by number in the sei2 shape.","seiNote":"Deprecated legacy sei2_* method, DISABLED by default. HTTP-only.","params":[{"name":"number","type":"BLOCKNUMBER","description":"Block number or tag.","example":"latest"}]},
  {"namespace":"sei2","name":"sei2_getBlockTransactionCountByHash","status":"limited","description":"Returns the transaction count of a block by hash in the sei2 shape.","seiNote":"Deprecated legacy sei2_* method, DISABLED by default. The sei2 namespace has only block/receipt/count methods (no transaction or filter APIs). HTTP-only.","params":[{"name":"blockHash","type":"DATA, 32 bytes","description":"Block hash.","example":"0x5620c15afd9a1d0ab19d7560043df6e038d731c6205974dca7a55900071e3864"}]},
  {"namespace":"sei2","name":"sei2_getBlockByNumberExcludeTraceFail","status":"limited","description":"Returns a block by number excluding trace-failing txs, with bank transfers per the sei2 config.","seiNote":"Deprecated legacy sei2_* method, DISABLED by default. Passes includeSyntheticTxs=false, excludeUntraceable=true; includeBankTransfers=true still applies. HTTP-only.","params":[{"name":"number","type":"BLOCKNUMBER","description":"Block number or tag.","example":"latest"},{"name":"fullTx","type":"boolean","description":"If true include full transaction objects, else only hashes.","example":"true"}]},
  {"namespace":"sei2","name":"sei2_getBlockByHashExcludeTraceFail","status":"limited","description":"Returns a block by hash excluding trace-failing txs, with bank transfers per the sei2 config.","seiNote":"Deprecated legacy sei2_* method, DISABLED by default. HTTP-only.","params":[{"name":"blockHash","type":"DATA, 32 bytes","description":"Block hash.","example":"0x5620c15afd9a1d0ab19d7560043df6e038d731c6205974dca7a55900071e3864"},{"name":"fullTx","type":"boolean","description":"If true include full transaction objects, else only hashes.","example":"false"}]},
  {"namespace":"admin","name":"admin_*","status":"unsupported","description":"Geth node administration namespace (admin_nodeInfo, admin_peers, admin_addPeer, admin_datadir, etc.). Not run by Sei.","seiNote":"Sei does not run go-ethereum's admin namespace; node administration is via the CometBFT/Cosmos stack. All admin_* methods return -32601 method not found."},
  {"namespace":"miner","name":"miner_*","status":"unsupported","description":"Geth miner-control namespace (miner_start, miner_stop, miner_setEtherbase, miner_setGasPrice, etc.). Not run by Sei.","seiNote":"Sei has no PoW/PoA miner (CometBFT PoS consensus); the namespace is not served. All miner_* methods return -32601."},
  {"namespace":"clique","name":"clique_*","status":"unsupported","description":"Clique proof-of-authority consensus namespace (clique_getSnapshot, clique_propose, etc.). Not run by Sei.","seiNote":"Sei uses CometBFT, not the Clique PoA engine; the namespace is not served. All clique_* methods return -32601."},
  {"namespace":"engine","name":"engine_*","status":"unsupported","description":"Ethereum Engine API namespace (engine_newPayloadV*, engine_forkchoiceUpdatedV*, engine_getPayloadV*) for consensus/execution-layer payload exchange. Not run by Sei.","seiNote":"Sei is not a post-merge Ethereum execution client; there is no CL/EL split or payload engine (consensus is CometBFT). All engine_* methods return -32601."},
  {"namespace":"les","name":"les_*","status":"unsupported","description":"Light Ethereum Subprotocol (LES) light-server namespace. Not run by Sei.","seiNote":"Sei does not implement LES light-server endpoints; the namespace is not served. All les_* methods return -32601."},
  {"namespace":"personal","name":"personal_*","status":"unsupported","description":"Geth account-management namespace (personal_newAccount, personal_unlockAccount, personal_sendTransaction, personal_sign, etc.). Not run by Sei.","seiNote":"Sei does not expose the deprecated personal namespace; hosted RPC nodes hold no user keys. Key management/signing is client-side and eth_sendRawTransaction is the supported path. All personal_* methods return -32601."}
];

const parseValue = (raw) => {
  if (typeof raw !== 'string') return raw;
  const t = raw.trim();
  if (t === '') return '';
  const looksJson = t[0] === '{' || t[0] === '[' || t === 'true' || t === 'false' || t === 'null';
  if (looksJson) {
    try { return JSON.parse(t); } catch (e) { return raw; }
  }
  return raw;
};

const isEmptyValue = (v) => {
  if (v === '' || v === undefined || v === null) return true;
  if (Array.isArray(v)) return v.length === 0;
  if (typeof v === 'object') return Object.keys(v).length === 0;
  return false;
};

const buildParams = (method, values) => {
  const params = (method.params || []).map((p) => {
    const v = values ? values[p.name] : undefined;
    return parseValue(v !== undefined ? v : (p.example || ''));
  });
  // eth_subscribe: the optional filter only applies to the logs stream.
  if (method.name === 'eth_subscribe' && params[0] !== 'logs') params.length = 1;
  while (params.length && isEmptyValue(params[params.length - 1])) params.pop();
  return params;
};

const deriveWsEndpoint = (httpUrl) => {
  if (!httpUrl) return 'wss://<your-ws-endpoint>';
  try {
    const u = new URL(httpUrl);
    u.protocol = u.protocol === 'http:' ? 'ws:' : 'wss:';
    return u.toString().replace(/\/$/, '');
  } catch (e) {
    return 'wss://<your-ws-endpoint>';
  }
};

const isWsOnly = (name) => name === 'eth_subscribe' || name === 'eth_unsubscribe';
const isMutation = (name) => name === 'eth_sendRawTransaction' || name === 'eth_sendTransaction' || name === 'eth_signTransaction' || name === 'eth_sign' || name === 'sei_sign' || name === 'sei_associate' || name.startsWith('personal_');

  const [theme, setTheme] = useState('dark');
  const [isMobile, setIsMobile] = useState(false);
  const [mobileView, setMobileView] = useState('list');
  const rootRef = useRef(null);

  const [network, setNetwork] = useState('mainnet');
  const [customEndpoint, setCustomEndpoint] = useState('');
  const endpoint = network === 'custom' ? customEndpoint : NETWORKS[network].http;
  const wsEndpoint = network === 'custom' ? deriveWsEndpoint(customEndpoint) : NETWORKS[network].ws;
  const [connection, setConnection] = useState('idle'); // idle | ok | fail
  const [consoleActive, setConsoleActive] = useState(false); // true once the user engages the console; gates the connectivity ping so a page view alone doesn't hit the RPC

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNamespace, setSelectedNamespace] = useState('all');
  const [showAll, setShowAll] = useState(false);
  const isHiddenByDefault = (m) => m.status === 'unsupported' || !!(NAMESPACE_META[m.namespace] && NAMESPACE_META[m.namespace].deprecated);

  const [selectedMethod, setSelectedMethod] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('curl');
  const [paramValues, setParamValues] = useState({});
  const [debouncedParams, setDebouncedParams] = useState({});
  const [requestResult, setRequestResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState('');

  const isDark = theme === 'dark';

  useEffect(() => {
    const detect = () => setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
    detect();
    const observer = new MutationObserver(detect);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const stackBelow = (w) => setIsMobile(w < 768);
    const el = rootRef.current;
    if (el && typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver((entries) => stackBelow(entries[0].contentRect.width));
      ro.observe(el);
      return () => ro.disconnect();
    }
    const check = () => stackBelow(window.innerWidth);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedParams(paramValues), 250);
    return () => clearTimeout(t);
  }, [paramValues]);

  const validateEndpoint = useCallback(async () => {
    if (!endpoint) { setConnection('idle'); return; }
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'web3_clientVersion', params: [] }),
      });
      setConnection(res.ok ? 'ok' : 'fail');
    } catch (e) {
      setConnection('fail');
    }
  }, [endpoint]);

  useEffect(() => { if (consoleActive) validateEndpoint(); }, [validateEndpoint, consoleActive]);

  // Clear any prior run result when the target endpoint changes (network switch
  // or custom-URL edit), so a response from one endpoint is never left showing
  // under a different network's label.
  useEffect(() => { setRequestResult(null); }, [endpoint]);

  const allMethods = useMemo(() => SEI_RPC_METHODS.map((m) => ({ ...m, meta: NAMESPACE_META[m.namespace] || { label: m.namespace, color: '#6b7280' } })), []);

  const filteredMethods = useMemo(() => {
    let list = allMethods;
    if (selectedNamespace !== 'all') list = list.filter((m) => m.namespace === selectedNamespace);
    if (!showAll) list = list.filter((m) => !isHiddenByDefault(m));
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter((m) => m.name.toLowerCase().includes(q) || (m.description || '').toLowerCase().includes(q));
    }
    const rank = (s) => (s === 'supported' ? 0 : s === 'limited' ? 1 : 2);
    return [...list].sort((a, b) => {
      const ns = NAMESPACE_ORDER.indexOf(a.namespace) - NAMESPACE_ORDER.indexOf(b.namespace);
      if (ns !== 0) return ns;
      return rank(a.status) - rank(b.status);
    });
  }, [allMethods, selectedNamespace, showAll, searchTerm]);

  const visibleNamespaces = useMemo(() => {
    const present = new Set();
    allMethods.forEach((m) => { if (showAll || !isHiddenByDefault(m)) present.add(m.namespace); });
    return NAMESPACE_ORDER.filter((ns) => present.has(ns));
  }, [allMethods, showAll]);

  const counts = useMemo(() => allMethods.reduce((a, m) => ((a[m.status] = (a[m.status] || 0) + 1), a), {}), [allMethods]);

  const selectMethod = (m) => {
    setConsoleActive(true);
    setSelectedMethod(m);
    setParamValues({});
    // Clear synchronously so examples don't reuse the previous method's values.
    setDebouncedParams({});
    setRequestResult(null);
    setSelectedLanguage('curl');
    if (isMobile) setMobileView('detail');
  };

  const copy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 1500);
  };

  const execute = async () => {
    if (!selectedMethod) return;
    setIsLoading(true);
    setRequestResult(null);
    const params = buildParams(selectedMethod, paramValues);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: selectedMethod.name, params }),
      });
      setRequestResult(await res.json());
    } catch (e) {
      setRequestResult({ error: { code: -1, message: e.message + ' (the endpoint may not allow browser requests / CORS)' } });
    } finally {
      setIsLoading(false);
    }
  };

  // ---- Code generation ---------------------------------------------------
  const generateCode = useCallback((method, language) => {
    if (!method) return '';
    const params = buildParams(method, debouncedParams);
    const paramsJson = JSON.stringify(params);
    const bodyJson = JSON.stringify({ jsonrpc: '2.0', id: 1, method: method.name, params });
    const url = endpoint || 'https://evm-rpc.sei-apis.com';
    const ws = wsEndpoint;
    const BT = String.fromCharCode(96); // backtick, for raw string literals
    const csBody = bodyJson.replace(/\\/g, '\\\\').replace(/"/g, '\\"'); // valid C#/JSON string literal

    if (isWsOnly(method.name)) {
      if (language === 'javascript') {
        return [
          `// ${method.name} runs over WebSocket only.`,
          `const socket = new WebSocket('${ws}');`,
          'socket.onopen = () => socket.send(JSON.stringify({',
          `  jsonrpc: '2.0', id: 1, method: '${method.name}', params: ${paramsJson},`,
          '}));',
          'socket.onmessage = (e) => console.log(JSON.parse(e.data));',
          '',
          '// ethers v6',
          "import { WebSocketProvider } from 'ethers';",
          `const provider = new WebSocketProvider('${ws}');`,
          `console.log(await provider.send('${method.name}', ${paramsJson}));`,
        ].join('\n');
      }
      if (language === 'typescript') {
        return [
          `// ${method.name} runs over WebSocket only.`,
          `const socket = new WebSocket('${ws}');`,
          'socket.onopen = () => socket.send(JSON.stringify({',
          `  jsonrpc: '2.0', id: 1, method: '${method.name}', params: ${paramsJson},`,
          '}));',
          'socket.onmessage = (e: MessageEvent) => console.log(JSON.parse(e.data));',
        ].join('\n');
      }
      if (language === 'python') {
        return [
          '# pip install websocket-client',
          'from websocket import create_connection',
          `socket = create_connection("${ws}")`,
          `socket.send(r"""${bodyJson}""")`,
          'print(socket.recv())',
          'socket.close()',
        ].join('\n');
      }
      if (language === 'go') {
        return [
          '// go get github.com/gorilla/websocket',
          'package main',
          '',
          'import (',
          '\t"fmt"',
          '\t"github.com/gorilla/websocket"',
          ')',
          '',
          'func main() {',
          `\tc, _, err := websocket.DefaultDialer.Dial("${ws}", nil)`,
          '\tif err != nil {',
          '\t\tpanic(err)',
          '\t}',
          '\tdefer c.Close()',
          '\tc.WriteMessage(websocket.TextMessage, []byte(' + BT + bodyJson + BT + '))',
          '\t_, msg, _ := c.ReadMessage()',
          '\tfmt.Println(string(msg))',
          '}',
        ].join('\n');
      }
      if (language === 'rust') {
        return [
          '// tokio-tungstenite = "0.23"  futures-util = "0.3"  tokio = { version = "1", features = ["full"] }',
          'use futures_util::{SinkExt, StreamExt};',
          'use tokio_tungstenite::{connect_async, tungstenite::Message};',
          '',
          '#[tokio::main]',
          'async fn main() -> Result<(), Box<dyn std::error::Error>> {',
          `    let (mut socket, _) = connect_async("${ws}").await?;`,
          '    socket.send(Message::Text(r#"' + bodyJson + '"#.to_string())).await?;',
          '    if let Some(msg) = socket.next().await {',
          '        println!("{}", msg?);',
          '    }',
          '    Ok(())',
          '}',
        ].join('\n');
      }
      if (language === 'csharp') {
        return [
          'using System;',
          'using System.Net.WebSockets;',
          'using System.Text;',
          'using System.Threading;',
          '',
          'using var socket = new ClientWebSocket();',
          `await socket.ConnectAsync(new Uri("${ws}"), CancellationToken.None);`,
          `var body = Encoding.UTF8.GetBytes("${csBody}");`,
          'await socket.SendAsync(body, WebSocketMessageType.Text, true, CancellationToken.None);',
          'var buffer = new byte[8192];',
          'var res = await socket.ReceiveAsync(buffer, CancellationToken.None);',
          'Console.WriteLine(Encoding.UTF8.GetString(buffer, 0, res.Count));',
        ].join('\n');
      }
      if (language === 'cast') {
        return [
          `# ${method.name} is WebSocket-only. cast has no native WebSocket support.`,
          '# Use wscat (npm i -g wscat):',
          `wscat -c ${ws}`,
          `> ${bodyJson}`,
        ].join('\n');
      }
      if (language === 'java') {
        return [
          'import java.net.URI;',
          'import java.net.http.*;',
          'import java.util.concurrent.CompletableFuture;',
          'import java.util.concurrent.CompletionStage;',
          '',
          'var done = new CompletableFuture<Void>();',
          'HttpClient.newHttpClient().newWebSocketBuilder()',
          `    .buildAsync(URI.create("${ws}"), new WebSocket.Listener() {`,
          '        public void onOpen(WebSocket ws) {',
          `            ws.sendText("${csBody}", true); ws.request(1);`,
          '        }',
          '        public CompletionStage<?> onText(WebSocket ws, CharSequence data, boolean last) {',
          '            System.out.println(data); done.complete(null); return null;',
          '        }',
          '    }).join();',
          'done.join();',
        ].join('\n');
      }
      if (language === 'kotlin') {
        return [
          'import java.net.URI',
          'import java.net.http.*',
          'import java.util.concurrent.CompletableFuture',
          'import java.util.concurrent.CompletionStage',
          '',
          'val done = CompletableFuture<Void>()',
          'HttpClient.newHttpClient().newWebSocketBuilder()',
          `    .buildAsync(URI.create("${ws}"), object : WebSocket.Listener {`,
          '        override fun onOpen(ws: WebSocket) {',
          `            ws.sendText("${csBody}", true); ws.request(1)`,
          '        }',
          '        override fun onText(ws: WebSocket, data: CharSequence, last: Boolean): CompletionStage<*>? {',
          '            println(data); done.complete(null); ws.request(1); return null',
          '        }',
          '    }).join()',
          'done.join()',
        ].join('\n');
      }
      if (language === 'swift') {
        return [
          'import Foundation',
          '',
          `let task = URLSession.shared.webSocketTask(with: URL(string: "${ws}")!)`,
          'task.resume()',
          `try await task.send(.string(#"${bodyJson}"#))`,
          'let msg = try await task.receive()',
          'if case .string(let text) = msg { print(text) }',
          'task.cancel(with: .normalClosure, reason: nil)',
        ].join('\n');
      }
      // curl (default) — wscat
      return [
        `# ${method.name} is WebSocket-only. Use wscat (npm i -g wscat):`,
        `wscat -c ${ws}`,
        `> ${bodyJson}`,
      ].join('\n');
    }

    if (language === 'javascript') {
      return [
        '// fetch',
        `const res = await fetch('${url}', {`,
        "  method: 'POST',",
        "  headers: { 'Content-Type': 'application/json' },",
        '  body: JSON.stringify({',
        "    jsonrpc: '2.0', id: 1,",
        `    method: '${method.name}',`,
        `    params: ${paramsJson},`,
        '  }),',
        '});',
        'console.log((await res.json()).result);',
        '',
        '// ethers v6',
        "import { JsonRpcProvider } from 'ethers';",
        `const provider = new JsonRpcProvider('${url}');`,
        `console.log(await provider.send('${method.name}', ${paramsJson}));`,
        '',
        '// viem',
        "import { createPublicClient, http } from 'viem';",
        `const client = createPublicClient({ transport: http('${url}') });`,
        `console.log(await client.request({ method: '${method.name}', params: ${paramsJson} }));`,
      ].join('\n');
    }

    if (language === 'typescript') {
      return [
        'type RpcResponse<T> = {',
        '  jsonrpc: string; id: number;',
        '  result?: T; error?: { code: number; message: string };',
        '};',
        '',
        `const res = await fetch('${url}', {`,
        "  method: 'POST',",
        "  headers: { 'Content-Type': 'application/json' },",
        '  body: JSON.stringify({',
        "    jsonrpc: '2.0', id: 1,",
        `    method: '${method.name}',`,
        `    params: ${paramsJson},`,
        '  }),',
        '});',
        'const data: RpcResponse<unknown> = await res.json();',
        'console.log(data.result);',
        '',
        '// ethers v6',
        "import { JsonRpcProvider } from 'ethers';",
        `const provider = new JsonRpcProvider('${url}');`,
        `console.log(await provider.send('${method.name}', ${paramsJson}));`,
      ].join('\n');
    }

    if (language === 'python') {
      return [
        'import requests, json',
        '',
        `url = "${url}"`,
        `params = json.loads(r"""${paramsJson}""")`,
        'res = requests.post(url, json={',
        '    "jsonrpc": "2.0", "id": 1,',
        `    "method": "${method.name}", "params": params,`,
        '})',
        'print(res.json().get("result"))',
        '',
        '# web3.py',
        'from web3 import Web3',
        'w3 = Web3(Web3.HTTPProvider(url))',
        `print(w3.provider.make_request("${method.name}", params))`,
      ].join('\n');
    }

    if (language === 'go') {
      return [
        'package main',
        '',
        'import (',
        '\t"bytes"',
        '\t"fmt"',
        '\t"io"',
        '\t"net/http"',
        ')',
        '',
        'func main() {',
        '\tbody := []byte(' + BT + bodyJson + BT + ')',
        `\tresp, _ := http.Post("${url}", "application/json", bytes.NewBuffer(body))`,
        '\tdefer resp.Body.Close()',
        '\tout, _ := io.ReadAll(resp.Body)',
        '\tfmt.Println(string(out))',
        '}',
      ].join('\n');
    }

    if (language === 'rust') {
      return [
        '// reqwest = { version = "0.12", features = ["json"] }',
        '// serde_json = "1"   tokio = { version = "1", features = ["full"] }',
        'use serde_json::Value;',
        '',
        '#[tokio::main]',
        'async fn main() -> Result<(), Box<dyn std::error::Error>> {',
        '    let body: Value = serde_json::from_str(r#"' + bodyJson + '"#)?;',
        `    let res = reqwest::Client::new().post("${url}")`,
        '        .json(&body).send().await?',
        '        .json::<Value>().await?;',
        '    println!("{:#?}", res["result"]);',
        '    Ok(())',
        '}',
      ].join('\n');
    }

    if (language === 'csharp') {
      return [
        'using System;',
        'using System.Net.Http;',
        'using System.Text;',
        '',
        'using var http = new HttpClient();',
        `var json = "${csBody}";`,
        'var content = new StringContent(json, Encoding.UTF8, "application/json");',
        `var res = await http.PostAsync("${url}", content);`,
        'Console.WriteLine(await res.Content.ReadAsStringAsync());',
      ].join('\n');
    }

    if (language === 'cast') {
      const castArgs = params.map(p => `'${JSON.stringify(p)}'`).join(' ');
      return `cast rpc --rpc-url ${url} ${method.name}${params.length ? ' ' + castArgs : ''}`;
    }

    if (language === 'java') {
      return [
        'import java.net.URI;',
        'import java.net.http.*;',
        '',
        `var json = "${csBody}";`,
        `var req = HttpRequest.newBuilder(URI.create("${url}"))`,
        '    .header("Content-Type", "application/json")',
        '    .POST(HttpRequest.BodyPublishers.ofString(json))',
        '    .build();',
        'var res = HttpClient.newHttpClient().send(req, HttpResponse.BodyHandlers.ofString());',
        'System.out.println(res.body());',
      ].join('\n');
    }

    if (language === 'kotlin') {
      return [
        'import java.net.URI',
        'import java.net.http.HttpClient',
        'import java.net.http.HttpRequest',
        'import java.net.http.HttpResponse',
        '',
        `val json = "${csBody}"`,
        `val req = HttpRequest.newBuilder(URI.create("${url}"))`,
        '    .header("Content-Type", "application/json")',
        '    .POST(HttpRequest.BodyPublishers.ofString(json))',
        '    .build()',
        'val res = HttpClient.newHttpClient().send(req, HttpResponse.BodyHandlers.ofString())',
        'println(res.body())',
      ].join('\n');
    }

    if (language === 'swift') {
      return [
        'import Foundation',
        '',
        `let url = URL(string: "${url}")!`,
        'var request = URLRequest(url: url)',
        'request.httpMethod = "POST"',
        'request.setValue("application/json", forHTTPHeaderField: "Content-Type")',
        `request.httpBody = Data(#"${bodyJson}"#.utf8)`,
        '',
        'let (data, _) = try await URLSession.shared.data(for: request)',
        'print(String(decoding: data, as: UTF8.self))',
      ].join('\n');
    }

    // curl (default)
    return `curl -s -X POST ${url} \\\n  -H "Content-Type: application/json" \\\n  -d '${bodyJson}'`;
  }, [endpoint, wsEndpoint, debouncedParams]);

  const codeExample = useMemo(() => generateCode(selectedMethod, selectedLanguage), [selectedMethod, selectedLanguage, generateCode]);

  // ---- Styling shorthands -------------------------------------------------
  const c = {
    bg: isDark ? '#000000' : '#f5f5f7',
    panel: isDark ? '#0a0a0a' : '#ffffff',
    panel2: isDark ? '#121212' : '#f5f5f7',
    border: isDark ? '#1f1f1f' : '#ececee',
    text: isDark ? '#ffffff' : '#131313',
    sub: isDark ? '#9ca3af' : '#666666',
    faint: isDark ? '#6b7280' : '#999999',
    input: isDark ? '#161616' : '#ffffff',
    code: isDark ? '#0d0d0d' : '#1a1a1a',
    maroon: '#600014',
  };
  const mono = 'var(--sei-font-mono, ui-monospace, "SF Mono", Menlo, monospace)';
  const bd = '1px solid ' + c.border; // shared 1px border
  const fieldStyle = { width: '100%', fontSize: 12, fontFamily: mono, padding: '7px 10px', background: c.input, color: c.text, border: bd, borderRadius: 4, outline: 'none', boxSizing: 'border-box' };
  const statusColor = (s) => (isDark ? STATUS_META[s].dark : STATUS_META[s].light);

  const StatusDot = ({ status }) => (
    <span title={STATUS_META[status].label} style={{ display: 'inline-block', width: 7, height: 7, borderRadius: 9, background: statusColor(status), flexShrink: 0 }} />
  );

  const Badge = ({ status }) => (
    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 3, color: statusColor(status), background: statusColor(status) + '22', border: `1px solid ${statusColor(status)}55` }}>
      {STATUS_META[status].label}
    </span>
  );

  const CopyBtn = ({ text, k }) => (
    <button
      onClick={() => copy(text, k)}
      style={{ fontSize: 11, color: c.sub, background: 'transparent', border: bd, borderRadius: 3, padding: '3px 8px', cursor: 'pointer' }}
    >
      {copied === k ? 'Copied' : 'Copy'}
    </button>
  );

  const CodeBlock = ({ text, maxHeight }) => (
    <pre style={{ margin: 0, padding: 14, borderRadius: 4, background: c.code, border: bd, overflowX: 'auto', maxHeight }}>
      <code style={{ fontFamily: mono, fontSize: 12, color: '#d4d4d4', whiteSpace: 'pre', lineHeight: 1.6 }}>{text}</code>
    </pre>
  );

  const m = selectedMethod;
  const mMeta = m ? NAMESPACE_META[m.namespace] || {} : {};

  return (
    <div ref={rootRef} className="not-prose rpc-explorer-root" style={{ fontFamily: 'var(--sei-font-body, inherit)', color: c.text, background: c.bg, border: bd, borderRadius: 6, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '96vh', minHeight: 768 }}>
      <div style={{ borderBottom: bd, background: c.panel, padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 12, flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em' }}>Sei EVM JSON-RPC Explorer</div>
          <div style={{ fontSize: 12, color: c.sub, marginTop: 2 }}>
            {allMethods.length} methods · {counts.supported} supported · {counts.limited} limited · {counts.unsupported} unavailable
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Network segmented control */}
          <div style={{ display: 'flex', border: bd, borderRadius: 4, overflow: 'hidden' }}>
            {['mainnet', 'testnet', 'custom'].map((n) => (
              <button
                key={n}
                onClick={() => { setNetwork(n); setConnection('idle'); }}
                style={{
                  fontSize: 12, padding: '6px 12px', cursor: 'pointer', border: 'none', textTransform: 'capitalize',
                  background: network === n ? c.maroon : 'transparent',
                  color: network === n ? '#fff' : c.sub,
                  fontWeight: network === n ? 600 : 400,
                }}
              >
                {n}
              </button>
            ))}
          </div>
          {network === 'custom' ? (
            <input
              value={customEndpoint}
              onChange={(e) => { setCustomEndpoint(e.target.value); setConnection('idle'); }}
              onBlur={validateEndpoint}
              placeholder="https://your-rpc"
              style={{ fontSize: 12, fontFamily: mono, padding: '6px 10px', width: 220, background: c.input, color: c.text, border: bd, borderRadius: 4, outline: 'none' }}
            />
          ) : (
            <code style={{ fontSize: 12, fontFamily: mono, color: c.sub, padding: '5px 10px', background: c.panel2, borderRadius: 4, border: bd, maxWidth: '100%', overflowWrap: 'anywhere' }}>{endpoint}</code>
          )}
          <span title={connection === 'ok' ? 'Reachable' : connection === 'fail' ? 'Unreachable from this browser' : 'Not checked'} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: connection === 'ok' ? '#22c55e' : connection === 'fail' ? '#ef4444' : c.faint }}>
            <span style={{ width: 8, height: 8, borderRadius: 9, background: connection === 'ok' ? '#22c55e' : connection === 'fail' ? '#ef4444' : c.faint }} />
            {connection === 'ok' ? 'Live' : connection === 'fail' ? 'Offline' : '—'}
          </span>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left: list */}
        <div style={{ width: isMobile ? '100%' : 320, flexShrink: 0, display: (isMobile && mobileView !== 'list') ? 'none' : 'flex', flexDirection: 'column', borderRight: isMobile ? 'none' : bd, background: c.panel, overflow: 'hidden' }}>
          <div style={{ padding: 14, borderBottom: bd }}>
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search methods…"
              style={{ width: '100%', fontSize: 13, padding: '8px 12px', background: c.input, color: c.text, border: bd, borderRadius: 4, outline: 'none', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 10 }}>
              <button
                onClick={() => setSelectedNamespace('all')}
                style={{ fontSize: 11, padding: '3px 9px', borderRadius: 3, cursor: 'pointer', fontWeight: 600, border: `1px solid ${selectedNamespace === 'all' ? c.maroon : c.border}`, background: selectedNamespace === 'all' ? c.maroon : 'transparent', color: selectedNamespace === 'all' ? '#fff' : c.sub }}
              >
                All
              </button>
              {visibleNamespaces.map((ns) => {
                const active = selectedNamespace === ns;
                const col = NAMESPACE_META[ns].color;
                return (
                  <button
                    key={ns}
                    onClick={() => setSelectedNamespace(ns)}
                    style={{ fontSize: 11, padding: '3px 9px', borderRadius: 3, cursor: 'pointer', fontWeight: 600, border: `1px solid ${col}`, background: active ? col : 'transparent', color: active ? '#fff' : (isDark ? col : col), opacity: active ? 1 : 0.85 }}
                  >
                    {NAMESPACE_META[ns].label}
                  </button>
                );
              })}
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 11, fontSize: 12, color: c.sub, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={showAll}
                onChange={(e) => {
                  const next = e.target.checked;
                  setShowAll(next);
                  if (!next && selectedNamespace !== 'all') {
                    const meta = NAMESPACE_META[selectedNamespace];
                    if (meta && (meta.deprecated || meta.unavailable)) setSelectedNamespace('all');
                  }
                }}
                style={{ accentColor: c.maroon }}
              />
              Show deprecated &amp; unavailable methods
            </label>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredMethods.length === 0 && (
              <div style={{ padding: 24, fontSize: 13, color: c.faint, textAlign: 'center' }}>No methods match.</div>
            )}
            {filteredMethods.map((mm) => {
              const active = m && m.name === mm.name;
              return (
                <button
                  key={mm.name}
                  onClick={() => selectMethod(mm)}
                  style={{ width: '100%', textAlign: 'left', padding: '9px 13px 9px 12px', cursor: 'pointer', border: 'none', borderLeft: `3px solid ${mm.meta.color}`, borderBottom: bd, background: active ? (isDark ? '#161616' : '#f0eef0') : 'transparent', display: 'block', opacity: mm.status === 'unsupported' ? 0.6 : 1 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <StatusDot status={mm.status} />
                    <code style={{ fontFamily: mono, fontSize: 12.5, color: active ? c.text : (isDark ? '#e5e5e5' : '#1a1a1a'), fontWeight: active ? 600 : 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{mm.name}</code>
                  </div>
                  <div style={{ fontSize: 11.5, color: c.faint, marginTop: 3, lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{mm.description}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: detail */}
        <div style={{ flex: 1, display: (isMobile && mobileView !== 'detail') ? 'none' : 'flex', flexDirection: 'column', overflowY: 'auto', background: c.bg }}>
          {!m ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.faint, fontSize: 14, padding: 24, textAlign: 'center' }}>
              Select a method to see its reference, parameters, and runnable examples.
            </div>
          ) : (
            <div style={{ padding: isMobile ? 16 : 24, maxWidth: 860 }}>
              {isMobile && (
                <button onClick={() => setMobileView('list')} style={{ fontSize: 12, color: c.sub, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 12 }}>← Methods</button>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <code style={{ fontFamily: mono, fontSize: 19, fontWeight: 700, color: c.text }}>{m.name}</code>
                <Badge status={m.status} />
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 3, color: '#fff', background: mMeta.color }}>{mMeta.label}</span>
              </div>
              <p style={{ fontSize: 14, color: c.sub, marginTop: 10, lineHeight: 1.55 }}>{m.description}</p>

              {mMeta.deprecated && (
                <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 4, background: '#f59e0b18', border: '1px solid #f59e0b55', fontSize: 12.5, color: isDark ? '#fbbf24' : '#92400e', lineHeight: 1.5 }}>
                  <strong>Deprecated.</strong> The <code style={{ fontFamily: mono }}>{m.namespace}_*</code> surface is scheduled for removal and is gated by <code style={{ fontFamily: mono }}>enabled_legacy_sei_apis</code> in <code style={{ fontFamily: mono }}>app.toml</code>. Prefer standard <code style={{ fontFamily: mono }}>eth_*</code>/<code style={{ fontFamily: mono }}>debug_*</code> methods for new integrations.
                </div>
              )}
              {mMeta.unavailable && (
                <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 4, background: isDark ? '#ffffff0a' : '#0000000a', border: bd, fontSize: 12.5, color: c.sub, lineHeight: 1.5 }}>
                  The entire <code style={{ fontFamily: mono }}>{m.namespace}_*</code> namespace is not exposed on Sei. {mMeta.blurb}
                </div>
              )}
              {m.seiNote && (
                <div style={{ marginTop: 14, padding: '12px 14px', borderRadius: 4, background: c.maroon + (isDark ? '22' : '12'), border: `1px solid ${c.maroon}${isDark ? '66' : '44'}`, fontSize: 12.5, color: isDark ? '#e9b8c0' : '#600014', lineHeight: 1.55 }}>
                  <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 11, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Sei-specific behavior</div>
                  {m.seiNote}
                </div>
              )}

              {/* Parameters */}
              {m.params && m.params.length > 0 && (
                <div style={{ marginTop: 22 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Parameters</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {m.params.map((p) => (
                      <div key={p.name} style={{ padding: '10px 13px', borderRadius: 4, background: c.panel2, border: bd }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <code style={{ fontFamily: mono, fontSize: 12.5, color: isDark ? '#e9b8c0' : c.maroon, fontWeight: 600 }}>{p.name}</code>
                          <span style={{ fontSize: 10.5, padding: '1px 7px', borderRadius: 3, color: c.sub, background: isDark ? '#ffffff10' : '#00000008', border: bd, fontFamily: mono }}>{p.type}</span>
                        </div>
                        <div style={{ fontSize: 12.5, color: c.sub, marginTop: 5, lineHeight: 1.5 }}>{p.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Try it — request (inputs + code) first, then Run, then Result */}
              {m.status !== 'unsupported' && (
                <div style={{ marginTop: 22 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                    Try it
                    <span style={{ fontSize: 11, fontWeight: 400, color: c.faint }}>· {network === 'custom' ? (endpoint || 'set a custom endpoint') : NETWORKS[network].label}</span>
                  </div>

                  {isWsOnly(m.name) && (
                    <div style={{ padding: '10px 14px', borderRadius: 4, background: c.panel2, border: bd, fontSize: 12.5, color: c.sub, lineHeight: 1.5, marginBottom: 10 }}>
                      This is a WebSocket subscription method. Connect to <code style={{ fontFamily: mono }}>{wsEndpoint}</code> and send the payload below — edit the parameters to customize the subscription.
                    </div>
                  )}
                  {m.params && m.params.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
                      {m.params.map((p) => {
                        const ex = p.example || '';
                        const big = ex.trim().startsWith('{') || ex.trim().startsWith('[') || (p.type || '').toLowerCase().includes('object');
                        const fieldId = `rpc-param-${p.name}`;
                        const field = {
                          id: fieldId,
                          value: paramValues[p.name] !== undefined ? paramValues[p.name] : '',
                          onChange: (e) => setParamValues((prev) => ({ ...prev, [p.name]: e.target.value })),
                          placeholder: ex,
                        };
                        return (
                          <div key={p.name}>
                            <label htmlFor={fieldId} style={{ fontSize: 11, color: c.faint, fontFamily: mono, display: 'block', marginBottom: 3 }}>{p.name}</label>
                            {big
                              ? <textarea rows={2} {...field} style={{ ...fieldStyle, resize: 'vertical' }} />
                              : <input {...field} style={fieldStyle} />}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {isMutation(m.name) && (
                    <div style={{ fontSize: 11.5, color: c.faint, marginBottom: 8, lineHeight: 1.45 }}>
                      This is a state-changing / signing method. Public RPC nodes hold no keys, so it generally errors unless you supply a signed payload.
                    </div>
                  )}

                  {/* Request — code example */}
                  <div style={{ marginTop: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: c.sub }}>Request</div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                          {LANGUAGES.map((l) => (
                            <button
                              key={l.id}
                              onClick={() => setSelectedLanguage(l.id)}
                              style={{ fontSize: 11, padding: '3px 9px', borderRadius: 3, cursor: 'pointer', border: 'none', background: selectedLanguage === l.id ? c.maroon : (isDark ? '#161616' : '#ececee'), color: selectedLanguage === l.id ? '#fff' : c.sub }}
                            >
                              {l.name}
                            </button>
                          ))}
                        </div>
                        <CopyBtn text={codeExample} k="code" />
                      </div>
                    </div>
                    <CodeBlock text={codeExample} />
                  </div>

                  {/* Run + Result (HTTP-callable methods) */}
                  {!isWsOnly(m.name) && (
                    <div style={{ marginTop: 14 }}>
                      <button
                        onClick={execute}
                        disabled={isLoading || !endpoint}
                        style={{ fontSize: 13, fontWeight: 600, padding: '8px 18px', borderRadius: 4, cursor: isLoading || !endpoint ? 'not-allowed' : 'pointer', border: 'none', background: c.maroon, color: '#fff', opacity: isLoading || !endpoint ? 0.55 : 1 }}
                      >
                        {isLoading ? 'Running…' : 'Run request'}
                      </button>
                      {requestResult && (
                        <div style={{ marginTop: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <span style={{ fontSize: 11, color: requestResult.error ? '#ef4444' : '#22c55e', fontWeight: 600 }}>{requestResult.error ? 'Error' : 'Result'}</span>
                            <CopyBtn text={JSON.stringify(requestResult, null, 2)} k="resp" />
                          </div>
                          <CodeBlock text={JSON.stringify(requestResult, null, 2)} maxHeight={280} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RPCMethodsViewer;
