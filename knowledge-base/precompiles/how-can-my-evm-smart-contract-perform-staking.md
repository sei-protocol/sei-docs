---
title: 'How can my EVM smart contract perform staking actions like delegating $SEI?'
description: 'How can my EVM smart contract perform staking actions like delegating $SEI?'
---

# How can my EVM smart contract perform staking actions like delegating $SEI?

Sei provides a **Staking Precompile** at address `0x0000000000000000000000000000000000001005` that allows EVM contracts to interact with Sei's native staking system.

**Key Functions (Solidity Interface):**

```
interface ISeiStakingPrecompile {
 // --- State Changing Functions ---

 /**
 * @notice Delegates $SEI sent with the call (msg.value) from the caller to a validator.
 * @dev Caller's EVM address must be associated with a Sei address.
 * @param validatorBech32 The validator's address in Sei bech32 format (e.g., "seivaloper1...").
 * @return success True if delegation succeeded.
 */
 function delegate(string memory validatorBech32) external payable returns (bool success);

 /**
 * @notice Redelegates staked $SEI from a source validator to a destination validator.
 * @dev Caller's EVM address must be associated. msg.value must be 0.
 * @param srcValidatorBech32 The source validator's bech32 address.
 * @param dstValidatorBech32 The destination validator's bech32 address.
 * @param amount The amount of $SEI (in usei) to redelegate.
 * @return success True if redelegation initiated successfully.
 */
 function redelegate(string memory srcValidatorBech32, string memory dstValidatorBech32, uint256 amount) external returns (bool success);

 /**
 * @notice Undelegates staked $SEI from a validator.
 * @dev Caller's EVM address must be associated. msg.value must be 0.
 * @param validatorBech32 The validator's bech32 address.
 * @param amount The amount of $SEI (in usei) to undelegate.
 * @return success True if undelegation initiated successfully.
 */
 function undelegate(string memory validatorBech32, uint256 amount) external returns (bool success);

 // --- View Function ---

 /**
 * @notice Queries the delegation information for a specific delegator and validator.
 * @param delegator The delegator's EVM address (must be associated).
 * @param validatorBech32 The validator's bech32 address.
 * @return delegationInfo A struct containing delegation details.
 */
 function delegation(address delegator, string memory validatorBech32) external view returns (Delegation memory delegationInfo);

 // --- Helper Structs for Return Value ---
 struct Balance {
 uint256 Amount; // Amount of tokens delegated (in usei)
 string Denom; // Should always be "usei"
 }

 struct DelegationDetails {
 string DelegatorAddress; // Sei native address (sei1...)
 uint256 Shares; // Number of validator shares owned
 uint256 Decimals; // Precision of the Shares value (e.g., 10^18)
 string ValidatorAddress; // Validator's bech32 address (seivaloper1...)
 }

 struct Delegation {
 Balance Balance; // The current token equivalent of the shares
 DelegationDetails Delegation; // Details about the delegation shares
 }
}

```

**How to Use:**

- **Association:** The EVM address calling `delegate`, `redelegate`, or `undelegate` **must** be associated with a Sei native address. The native address is the one that actually performs the staking operation.

- **Interface:** Define or import the `ISeiStakingPrecompile` interface.

- **Instantiate:** Get a reference: `ISeiStakingPrecompile constant seiStaking = ISeiStakingPrecompile(0x0000000000000000000000000000000000001005);`

- **Call Functions:**

**Delegate:** Call `delegate{value: amountToDelegateInWei}("validator_address")`. Note `value` is required.

- **Redelegate/Undelegate:** Call `redelegate(...)` or `undelegate(...)` with `msg.value = 0`. The amount is specified as a function argument (in `usei`, the smallest unit of SEI).

- **Query:** Call `delegation(...)` to get details.

**Important Considerations:**

- **Units:** When calling `redelegate` or `undelegate`, the `amount` argument is in `usei` (1 SEI = 1,000,000 usei). When calling `delegate`, the `msg.value` is in `wei` (the smallest EVM unit, 1 SEI = 10^18 wei). The precompile handles the conversion for delegation.

- **No Delegate Call:** This precompile cannot be called using `delegatecall`.

- **Staked Balance:** $SEI delegated via this precompile is managed by the associated native (`sei1...`) address. It will *not* appear in the EVM address balance in MetaMask.

- **Gas:** Write operations incur higher base gas costs (50k-70k) plus the cost of the underlying staking module interaction. Querying is cheaper.
