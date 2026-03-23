# Sei Network

## Description

Skills for interacting with the Sei blockchain (EVM + CosmWasm), including:

- Account queries
- Token transfers
- Smart contract interaction
- Staking
- Transaction monitoring

---

## When to use

Use these skills when:

- The user requests interaction with the Sei blockchain
- Tasks involve balances, transactions, contracts, or staking
- Structured execution is required (not just explanation)

Do not use when:

- The request is purely informational
- No blockchain interaction is needed

---

## Setup

### Required

- `rpc_url`
- `network` (mainnet | testnet | devnet)

### Optional

- `chain_id`

### For write operations

- `private_key` OR signer abstraction

### Notes

- Default to `testnet` if network is unspecified
- Validate address formats:
  - Sei (bech32)
  - EVM (0x)
- Convert addresses when required

---

## Conventions

### Skill types

- `read` → no state change
- `write` → state change (requires signing)
- `derived` → multi-step / computed

### Response format

```json
{
	"success": true,
	"data": {},
	"error": null
}
```

### Error format

```json
{
	"success": false,
	"error": {
		"message": "",
		"recoverable": true
	}
}
```

---

## Behaviour

### Retries

- Read: retry up to 3 times (exponential backoff)
- Write: do not retry unless explicitly safe

### Data handling

- Normalize token amounts
- Standardize addresses (checksum for EVM)
- Keep consistent field naming

### Write safety

Before execution:

1. Simulate (if possible)
2. Present summary (action, assets, fees)
3. Require explicit confirmation

---

## Skills

### get_chain_status

type: read

Fetch current chain status.

inputs:

- rpc_url

returns:

- latest_block_height
- chain_id
- syncing

---

### get_account_balance

type: read

Retrieve token balances.

inputs:

- address
- denom (optional)

returns:

- balances:
  - denom
  - amount

---

### get_evm_address

type: read

Convert Sei → EVM address.

inputs:

- sei_address

returns:

- evm_address

---

### get_sei_address

type: read

Convert EVM → Sei address.

inputs:

- evm_address

returns:

- sei_address

---

### get_transaction

type: read

Fetch transaction details.

inputs:

- tx_hash

returns:

- status
- gas_used
- logs
- events

---

### get_block

type: read

Fetch block details.

inputs:

- height

returns:

- block_hash
- timestamp
- transactions

---

### get_gas_price

type: read

Fetch gas price.

inputs:

- rpc_url

returns:

- gas_price

---

### get_contract_state

type: read

Query contract state.

inputs:

- contract_address
- query

returns:

- result

---

### send_tokens

type: write

Transfer tokens.

inputs:

- from_address
- to_address
- amount
- denom
- private_key

returns:

- tx_hash

constraints:

- validate balance
- require confirmation

---

### execute_contract

type: write

Execute contract.

inputs:

- contract_address
- msg / data
- sender
- gas_limit
- private_key

returns:

- tx_hash
- execution_result

constraints:

- simulate first
- require confirmation

---

### deploy_contract

type: write

Deploy contract.

inputs:

- bytecode
- constructor_args
- sender
- private_key

returns:

- contract_address
- tx_hash

---

### stake_tokens

type: write

Delegate tokens.

inputs:

- delegator_address
- validator_address
- amount
- private_key

returns:

- tx_hash

---

### unstake_tokens

type: write

Undelegate tokens.

inputs:

- delegator_address
- validator_address
- amount
- private_key

returns:

- tx_hash

---

### estimate_transaction_cost

type: derived

Estimate gas + fees.

inputs:

- tx_payload
- rpc_url

returns:

- gas_estimate
- fee_estimate

---

### simulate_contract_execution

type: derived

Simulate contract execution.

inputs:

- contract_address
- msg / data
- sender

returns:

- gas_used
- result

---

### get_portfolio_summary

type: derived

Aggregate balances.

inputs:

- address

returns:

- total_value
- token_breakdown

---

### monitor_transaction

type: derived

Track transaction until confirmed.

inputs:

- tx_hash
- timeout_seconds

returns:

- confirmed
- block_height

---

## Safety

- Never expose private keys
- Always validate inputs before execution
- Prefer simulation before write actions
- Avoid unnecessary RPC load

---

## References

- https://docs.sei.io/
- Sei JSON-RPC (EVM)
- CosmWasm API
- `seid` CLI
