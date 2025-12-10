---
title: 'How do I set up a local development environment for building and testing Sei EVM smart contracts?'
description: 'How do I set up a local development environment for building and testing Sei EVM smart contracts?'
---

# How do I set up a local development environment for building and testing Sei EVM smart contracts?

This guide walks you through setting up a complete development environment for building, testing, and deploying smart contracts on Sei's EVM.

## Prerequisites

- Node.js v16+ and npm/yarn

- Git

- Basic understanding of Solidity and Ethereum development

## Step 1: Set Up a Sei EVM Project

[Hardhat](https://hardhat.org/) is a popular development environment for Ethereum that works with Sei EVM. We'll use it for this guide.

```
# Create project directory
mkdir sei-evm-project
cd sei-evm-project

# Initialize npm project
npm init -y

# Install Hardhat and dependencies
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox @nomicfoundation/hardhat-verify dotenv

# Initialize Hardhat project
npx hardhat init
# Choose "Create a TypeScript project" for better developer experience

```

## Step 2: Configure Hardhat for Sei EVM

Create/edit `hardhat.config.ts` with Sei network configurations:

```
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import * as dotenv from "dotenv";

dotenv.config();

// Get private key from environment
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

const config: HardhatUserConfig = {
 solidity: {
 version: "0.8.19",
 settings: {
 optimizer: {
 enabled: true,
 runs: 200,
 },
 },
 },
 networks: {
 // Sei Testnet
 "sei-testnet": {
 url: "https://evm-rpc.testnet.sei.io",
 chainId: 1328,
 accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
 },
 // Sei Mainnet
 "sei-mainnet": {
 url: "https://evm-rpc.sei.io",
 chainId: 1329,
 accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
 },
 // Local development network
 hardhat: {
 chainId: 31337,
 },
 },
 etherscan: {
 apiKey: {
 // Dummy API key - Sei explorer doesn't require a real key
 "sei-testnet": "dummy",
 "sei-mainnet": "dummy",
 },
 customChains: [
 {
 network: "sei-testnet",
 chainId: 1328,
 urls: {
 apiURL: "https://testnet.seiexplorer.com/api",
 browserURL: "https://testnet.seiexplorer.com",
 },
 },
 {
 network: "sei-mainnet",
 chainId: 1329,
 urls: {
 apiURL: "https://seiexplorer.com/api",
 browserURL: "https://seiexplorer.com",
 },
 },
 ],
 },
};

export default config;

```

Create a `.env` file to store your private key:

```
PRIVATE_KEY=your_private_key_here

```

## Step 3: Create a Simple Smart Contract

Create a sample contract in `contracts/SimpleStorage.sol`:

```
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SimpleStorage {
 uint256 private value;

 event ValueChanged(uint256 newValue);

 function setValue(uint256 newValue) public {
 value = newValue;
 emit ValueChanged(newValue);
 }

 function getValue() public view returns (uint256) {
 return value;
 }
}

```

## Step 4: Create Deployment Script

Create a deployment script in `scripts/deploy.ts`:

```
import { ethers } from "hardhat";

async function main() {
 // Get the contract factory
 const SimpleStorage = await ethers.getContractFactory("SimpleStorage");

 // Deploy the contract
 console.log("Deploying SimpleStorage...");
 const simpleStorage = await SimpleStorage.deploy();

 // Wait for deployment to finish
 await simpleStorage.deploymentTransaction()?.wait();

 console.log(`SimpleStorage deployed to: ${await simpleStorage.getAddress()}`);
}

// Execute deployment
main()
 .then(() => process.exit(0))
 .catch((error) => {
 console.error(error);
 process.exit(1);
 });

```

## Step 5: Write Tests

Create a test file in `test/SimpleStorage.ts`:

```
import { expect } from "chai";
import { ethers } from "hardhat";
import { SimpleStorage } from "../typechain-types";

describe("SimpleStorage", function () {
 let simpleStorage: SimpleStorage;

 beforeEach(async function () {
 const SimpleStorage = await ethers.getContractFactory("SimpleStorage");
 simpleStorage = await SimpleStorage.deploy();
 });

 it("Should return the initial value as 0", async function () {
 expect(await simpleStorage.getValue()).to.equal(0);
 });

 it("Should set the value correctly", async function () {
 const tx = await simpleStorage.setValue(42);
 await tx.wait();
 expect(await simpleStorage.getValue()).to.equal(42);
 });

 it("Should emit an event when setting value", async function () {
 await expect(simpleStorage.setValue(42))
 .to.emit(simpleStorage, "ValueChanged")
 .withArgs(42);
 });
});

```

## Step 6: Compile, Test, and Deploy

Compile your contracts:

```
npx hardhat compile

```

Run tests:

```
npx hardhat test

```

Deploy to Sei testnet:

```
npx hardhat run scripts/deploy.ts --network sei-testnet

```

## Step 7: Verifying Contract on Sei Explorer

Verify your deployed contract:

```
npx hardhat verify --network sei-testnet

```

## Using Sei-Specific Features

To interact with Sei's precompiles, you'll need to import the appropriate interface. For example, to use the Oracle precompile:

```
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface ISeiOraclePrecompile {
 function getExchangeRate(string calldata denom) external view returns (uint256, uint256);
}

contract PriceConsumer {
 ISeiOraclePrecompile constant oraclePrecompile =
 ISeiOraclePrecompile(0x0000000000000000000000000000000000001008);

 function getSeiPrice() external view returns (uint256 price, uint256 timestamp) {
 return oraclePrecompile.getExchangeRate("usei");
 }
}

```
