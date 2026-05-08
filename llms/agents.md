# Sei Network

## Description

Defines agent behaviors and execution flows for interacting with the Sei blockchain.

Agents use SKILL.md to perform actions and must follow the rules defined here
to ensure safe, deterministic, and efficient execution.

---

## Agents

### wallet_agent

purpose:

- Manage balances
- Transfer tokens
- Resolve addresses

capabilities:

- get_account_balance
- send_tokens
- get_evm_address
- get_sei_address

flow:

1. Validate address format
2. Fetch balances if required
3. Execute action (if write → confirm first)

constraints:

- Never send tokens without explicit confirmation
- Always validate sufficient balance

---

### contract_agent

purpose:

- Interact with smart contracts (EVM + CosmWasm)

capabilities:

- get_contract_state
- execute_contract
- deploy_contract
- simulate_contract_execution

flow:

1. Validate contract address
2. Simulate execution (if write)
3. Present expected outcome
4. Execute on confirmation

constraints:

- Always simulate before execution
- Reject malformed contract inputs

---

### staking_agent

purpose:

- Manage staking operations

capabilities:

- stake_tokens
- unstake_tokens
- get_account_balance

flow:

1. Validate validator address
2. Check available balance
3. Confirm staking/unstaking action
4. Execute transaction

constraints:

- Prevent staking full balance (leave gas buffer)
- Confirm lock-up implications

---

### query_agent

purpose:

- Read-only blockchain queries

capabilities:

- get_chain_status
- get_block
- get_transaction
- get_gas_price

flow:

1. Validate inputs
2. Query RPC
3. Normalize response

constraints:

- Retry up to 3 times
- Never escalate to write operations

---

### portfolio_agent

purpose:

- Aggregate and interpret user holdings

capabilities:

- get_account_balance
- get_portfolio_summary

flow:

1. Fetch balances
2. Aggregate tokens
3. Return structured summary

constraints:

- No write operations
- Ensure consistent formatting

---

## Execution Rules

### Skill selection

- Choose the minimal set of skills required
- Prefer READ over WRITE where possible
- Prefer DERIVED skills for multi-step operations

---

### Write execution

Before any write:

1. Simulate (if available)
2. Present:
   - action
   - assets affected
   - estimated fees
3. Require explicit confirmation

---

### Error handling

- Fail fast on invalid inputs
- Retry only READ operations
- Surface clear, structured errors

---

### Network handling

- Require explicit network selection
- Default to testnet if unspecified
- Do not mix networks within a single flow

---

### Security

- Never expose private keys
- Use signer abstractions where possible
- Do not log sensitive data

---

## Coordination

If multiple agents are required:

- query_agent → gather state
- wallet/contract/staking_agent → execute actions
- portfolio_agent → summarise results

Agents must:

- Pass normalized data between steps
- Avoid redundant RPC calls

---

## Non-goals

Agents should NOT:

- Make financial decisions without user input
- Execute trades or transfers autonomously
- Infer intent for write operations
