---
title: 'What security considerations should I keep in mind when developing smart contracts for Sei EVM?'
description: 'What security considerations should I keep in mind when developing smart contracts for Sei EVM?'
---

# What security considerations should I keep in mind when developing smart contracts for Sei EVM?

While Sei's EVM implementation is compatible with Ethereum, there are Sei-specific security considerations alongside standard EVM security practices you should follow. This guide covers both to help you build secure dApps on Sei.

## Sei-Specific Security Considerations

### Parallel Execution Awareness

Sei's parallel transaction processing can introduce potential edge cases:

- **Transaction Ordering**: Don't assume transactions will be executed in a specific order, as parallel execution may reorder them within the same block.

- **Block Information**: Be cautious with block-level information like `block.timestamp` and `block.number` in critical logic, as transactions executing in parallel access the same values.

- **Flash Loan Protection**: Design your contracts to be resistant to flash loan attacks, which could exploit parallel execution to manipulate markets.

### Precompile Security

When using Sei's precompiled contracts:

- **Input Validation**: Always validate inputs before passing them to precompiles.

- **Address Association**: For precompiles requiring address association, verify association status before critical operations.

- **Permission Control**: Implement proper access controls around precompile calls, especially those handling assets or performing sensitive operations.

### Cross-Environment Considerations

With Sei's dual native/EVM environment:

- **Bridge Safety**: When using the native-to-EVM bridge, implement additional verification for high-value transfers.

- **Address Format Validation**: Verify address formats when accepting native Sei addresses as inputs to avoid misdirected funds.

## General EVM Security Best Practices

### Access Control

```
// ❌ Insecure: No access control
function withdrawFunds() external {
 payable(msg.sender).transfer(address(this).balance);
}

// ✅ Secure: Proper access control
address public owner;

constructor() {
 owner = msg.sender;
}

modifier onlyOwner() {
 require(msg.sender == owner, "Not owner");
 _;
}

function withdrawFunds() external onlyOwner {
 payable(owner).transfer(address(this).balance);
}

```

- **Role-Based Access**: Consider implementing role-based access using libraries like OpenZeppelin's AccessControl.

- **Multi-Signature**: For high-value contracts, implement multi-signature requirements for critical operations.

- **Time Locks**: Add time delays for sensitive operations, allowing monitoring and intervention if necessary.

### Reentrancy Protection

```
// ❌ Vulnerable to reentrancy
function withdraw(uint amount) external {
 require(balances[msg.sender] >= amount, "Insufficient balance");
 (bool success, ) = msg.sender.call{value: amount}("");
 require(success, "Transfer failed");
 balances[msg.sender] -= amount; // State change after external call
}

// ✅ Protected against reentrancy
bool private locked;

modifier nonReentrant() {
 require(!locked, "Reentrant call");
 locked = true;
 _;
 locked = false;
}

function withdraw(uint amount) external nonReentrant {
 require(balances[msg.sender] >= amount, "Insufficient balance");
 balances[msg.sender] -= amount; // State change before external call
 (bool success, ) = msg.sender.call{value: amount}("");
 require(success, "Transfer failed");
}

```

- **Check-Effects-Interactions Pattern**: Always apply state changes before making external calls.

- **Reentrancy Guards**: Use nonReentrant modifiers from trusted libraries like OpenZeppelin.

### Integer Overflow/Underflow

```
// ❌ Vulnerable to overflow/underflow (pre-Solidity 0.8.x)
function transfer(address to, uint256 amount) external {
 require(balances[msg.sender] >= amount, "Insufficient balance");
 balances[msg.sender] -= amount;
 balances[to] += amount; // Could overflow
}

// ✅ Safe with Solidity 0.8.x built-in checks
// Or use SafeMath for earlier versions

```

- **Use Recent Solidity Version**: Solidity 0.8.x includes built-in overflow/underflow checks.

- **SafeMath**: For older Solidity versions, use SafeMath library.

- **Unchecked Operations**: Only use `unchecked` blocks when you've verified overflow is impossible.

### External Calls

```
// ❌ Unsafe external call
function unsafeCall(address target, bytes memory data) external {
 (bool success, ) = target.call(data);
 // Missing success check
}

// ✅ Safe external call
function safeCall(address target, bytes memory data) external {
 (bool success, bytes memory returnData) = target.call(data);
 require(success, "External call failed");
 // Additionally validate returnData if needed
}

```

- **Always Check Return Values**: Verify the success of external calls.

- **Avoid Assuming Call Success**: Implement proper error handling for failed calls.

- **Validate External Contract Addresses**: Verify addresses before making calls.

### Front-Running Protection

- **Commit-Reveal Schemes**: For operations sensitive to transaction ordering.

- **Minimum/Maximum Acceptable Values**: Include parameters to specify acceptable slippage.

- **Timeouts**: Implement expiration timestamps for pending operations.

### Gas Considerations

- **Avoid Unbounded Operations**: Functions shouldn't depend on unbounded data structures.

- **Gas Limits**: Be aware of block gas limits when designing operations that might process large datasets.

## Testing & Verification

### Comprehensive Testing

- **Unit Tests**: Test individual components with libraries like Hardhat's testing framework.

- **Integration Tests**: Test contract interactions to ensure they work together properly.

- **Fuzz Testing**: Use tools like Echidna to find edge cases through randomized inputs.

### Security Audits

- **Internal Reviews**: Have team members review each other's code.

- **External Audits**: Consider professional audits for high-value contracts.

- **Bug Bounties**: Implement bug bounty programs to incentivize security findings.

## Deployment Practices

### Upgradeability Considerations

```
// Example using OpenZeppelin's upgradeable contracts
contract MyUpgradeableContract is Initializable, UUPSUpgradeable {
 function initialize() public initializer {
 // Initialization code instead of constructor
 }

 function _authorizeUpgrade(address) internal override onlyOwner {}
}

```

- **Transparent vs UUPS**: Choose an upgradeability pattern appropriate for your needs.

- **Initialization**: Ensure proper initialization of upgradeable contracts.

- **Storage Layout**: Be cautious with storage layout changes in upgrades.

### Emergency Preparedness

- **Circuit Breakers**: Implement pause functionality for critical operations.

- **Recovery Mechanisms**: Plan for potential security incidents.

- **Key Management**: Use proper key management practices for admin/owner accounts.

## Sei Testnet Usage

- **Test Thoroughly on Testnet**: Always test on Sei testnet before mainnet deployment.

- **Simulate Mainnet Conditions**: Test with realistic conditions similar to expected mainnet usage.

- **Verify Precompile Behavior**: Ensure precompiles behave as expected in your specific use case.

## Common Vulnerabilities Checklist

- [ ] Reentrancy vulnerabilities

- [ ] Access control issues

- [ ] Integer overflows/underflows (pre-Solidity 0.8.x)

- [ ] Unchecked external calls

- [ ] Front-running vulnerabilities

- [ ] Logic errors in business rules

- [ ] Dependency vulnerabilities

- [ ] Gas-related issues

- [ ] Oracle manipulation vulnerabilities

- [ ] Flash loan attack vectors
