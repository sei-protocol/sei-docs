---
title: 'What are the opcode compatibility differences between Sei and Ethereum?'
description: 'What are the opcode compatibility differences between Sei and Ethereum?'
---

# What are the opcode compatibility differences between Sei and Ethereum?

## Understanding EVM Opcode Compatibility

The Ethereum Virtual Machine (EVM) uses opcodes as the foundational instruction set for smart contract execution. While Sei maintains high compatibility with Ethereum's opcodes, some differences exist that developers should understand.

## Sei's EVM Opcode Support

Sei's EVM implementation supports opcodes up to the Cancun hard fork, including:

- Core computational opcodes

- Stack manipulation

- Memory operations

- Storage operations

- Control flow

- Standard precompiles

This compatibility allows most Ethereum contracts to run without modification on Sei.

## Key Opcode Differences

While most opcodes behave identically, some important differences exist:

|
Opcode |
Ethereum Behavior |
Sei Behavior |
Migration Notes |

|
SELFDESTRUCT |
Deprecated but functional |
Fully deprecated |
Need alternative approach |

|
BLOCKHASH |
Access to 256 previous blocks |
Limited historical block access |
Use storage if needing more history |

|
DIFFICULTY/PREVRANDAO |
Returns randomness from beacon chain |
Returns Tendermint consensus-based value |
Not suitable for randomness |

|
CREATE2 |
Standard behavior |
Fully compatible but may have different gas costs |
Test thoroughly |

|
EXTCODEHASH |
Standard behavior |
May have different gas cost |
Test thoroughly |

|
TIMESTAMP |
~12s granularity |
~400ms granularity |
Time-sensitive logic may need adjustment |

|
GAS |
Returns gas left |
Same behavior but different pricing model |
Gas estimation may differ |

## SELFDESTRUCT Handling

The `SELFDESTRUCT` opcode is fully deprecated in Sei. Contracts using it will need modifications:

### Ethereum Pattern Using SELFDESTRUCT:

```
// Ethereum contract with SELFDESTRUCT
contract SelfdestructExample {
 address payable owner;

 constructor() {
 owner = payable(msg.sender);
 }

 function close() external {
 require(msg.sender == owner, "Not owner");
 selfdestruct(owner); // PROBLEMATIC ON SEI
 }
}

```

### Sei Compatible Alternative:

```
// Sei-compatible alternative
contract NoSelfdestructExample {
 address payable owner;
 bool public isActive = true;

 constructor() {
 owner = payable(msg.sender);
 }

 function close() external {
 require(msg.sender == owner, "Not owner");
 require(isActive, "Already closed");

 // Transfer all ETH balance
 uint balance = address(this).balance;
 if (balance > 0) {
 owner.transfer(balance);
 }

 // Mark contract as closed
 isActive = false;
 }

 // Add guard to all functions
 modifier onlyActive() {
 require(isActive, "Contract is closed");
 _;
 }

 // Apply guard to all other functions
 function exampleFunction() external onlyActive {
 // Function logic here
 }
}

```

## BLOCKHASH Limitations

The `BLOCKHASH` opcode may have limited historical access on Sei:

### Ethereum Pattern:

```
// Ethereum contract accessing historical blocks
contract BlockHashExample {
 function getOldBlockHash(uint256 blockNumber) external view returns (bytes32) {
 require(block.number - blockNumber 256, "Too old");
 return blockhash(blockNumber); // Access to 256 previous blocks
 }
}

```

### Sei Compatible Alternative:

```
// Sei-compatible block hash storage
contract BlockHashStorageExample {
 mapping(uint256 => bytes32) public storedHashes;

 // Store current block hash
 function storeCurrentBlockHash() external {
 storedHashes[block.number] = blockhash(block.number);
 }

 // Retrieve stored hash or current hash if available
 function getBlockHash(uint256 blockNumber) external view returns (bytes32) {
 if (storedHashes[blockNumber] != bytes32(0)) {
 return storedHashes[blockNumber];
 }

 // Only try blockhash if it's recent
 if (block.number - blockNumber 10) { // Conservative limit
 return blockhash(blockNumber);
 }

 revert("Block hash not available");
 }
}

```

## DIFFICULTY/PREVRANDAO Considerations

The `DIFFICULTY`/`PREVRANDAO` opcode returns different values in Sei due to consensus differences:

### Ethereum Pattern:

```
// Ethereum contract using PREVRANDAO for randomness
contract RandomnessExample {
 function getPseudoRandom(address user, uint256 nonce) external view returns (uint256) {
 return uint256(keccak256(abi.encodePacked(
 block.prevrandao, // Different on Sei!
 user,
 nonce
 )));
 }
}

```

### Sei Compatible Alternative:

```
// Sei-compatible randomness approach
contract BetterRandomnessExample {
 function getPseudoRandom(address user, uint256 nonce) external view returns (uint256) {
 return uint256(keccak256(abi.encodePacked(
 blockhash(block.number - 1), // Use block hash instead
 block.timestamp, // More frequent updates on Sei
 user,
 nonce
 )));
 }

 // For anything requiring true randomness, use an oracle
 // Example with Chainlink VRF would be shown here
}

```

## Gas-Related Opcodes

Gas-related opcodes (`GAS`, `GASPRICE`) work the same way but may return different values due to Sei's different gas model:

```
// Function with gas-related operations
function checkGas() external view returns (uint256 gasLeft, uint256 gasPrice) {
 gasLeft = gasleft(); // Works the same way but may differ in value
 gasPrice = tx.gasprice; // Will be much lower on Sei
}

```

## Timestamp Considerations

Sei's faster block time (~400ms vs ~12s) means timestamp-based logic may need adjustments:

```
// Ethereum timing logic
function isDelayOver(uint256 startTime, uint256 delay) external view returns (bool) {
 // On Ethereum, typical minimum practical delay might be 15-30 seconds
 // On Sei, practical minimum could be under 1 second
 return block.timestamp >= startTime + delay;
}

```

## Testing for Opcode Compatibility

To ensure your contracts work properly on Sei, follow these testing steps:

### 1. Use Sei Testnet

Deploy and test your contracts on Sei testnet (Chain ID 1328) to verify compatibility:

```
// hardhat.config.js
module.exports = {
 networks: {
 sei_testnet: {
 url: "https://evm-rpc.testnet.sei.io",
 chainId: 1328,
 accounts: [process.env.PRIVATE_KEY]
 }
 }
};

```

### 2. Test Contract Bytecode

For critical contracts, you can analyze the compiled bytecode to check for problematic opcodes:

```
// Script to check contract bytecode for incompatible opcodes
const { ethers } = require("ethers");

async function checkContractCompatibility(contractAddress, provider) {
 // Get contract bytecode
 const bytecode = await provider.getCode(contractAddress);

 // Check for selfdestruct opcode (0xff)
 if (bytecode.includes("ff")) {
 console.warn("Warning: Contract may contain SELFDESTRUCT opcode");
 }

 // Add other opcode checks as needed

 return bytecode;
}

```

### 3. Gas Cost Testing

Test gas costs on both Ethereum and Sei to understand any differences:

```
// Gas usage comparison test
async function compareGasUsage(contract, method, args) {
 // Test on Ethereum
 const ethEstimate = await ethProvider.estimateGas({
 to: contract.address,
 data: contract.interface.encodeFunctionData(method, args)
 });

 // Test on Sei
 const seiEstimate = await seiProvider.estimateGas({
 to: contract.address,
 data: contract.interface.encodeFunctionData(method, args)
 });

 console.log(`Ethereum gas estimate: ${ethEstimate.toString()}`);
 console.log(`Sei gas estimate: ${seiEstimate.toString()}`);
 console.log(`Difference: ${ethEstimate.sub(seiEstimate).toString()}`);
}

```

## Handling Precompiles

Sei includes all standard Ethereum precompiles with identical addresses and behavior:

|
Address |
Precompile |
Status on Sei |

|
0x01 |
ecrecover |
Fully compatible |

|
0x02 |
sha256 |
Fully compatible |

|
0x03 |
ripemd160 |
Fully compatible |

|
0x04 |
identity |
Fully compatible |

|
0x05 |
modexp |
Fully compatible |

|
0x06 |
ecAdd |
Fully compatible |

|
0x07 |
ecMul |
Fully compatible |

|
0x08 |
ecPairing |
Fully compatible |

|
0x09 |
blake2f |
Fully compatible |

Plus Sei's additional precompiles at addresses starting from `0x1001` to extend functionality.

_For most contracts, no changes are needed to run on Sei. For those using the specific opcodes detailed above, modifications are straightforward. By testing thoroughly on Sei testnet, developers can ensure their contracts function correctly with Sei's EVM implementation._

_The high compatibility level means that the vast majority of Ethereum tooling, libraries, and smart contract patterns will work seamlessly on Sei, enabling developers to leverage existing code while benefiting from Sei's performance advantages._
