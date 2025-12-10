---
title: 'What token standards are supported on Sei EVM and how do I implement them?'
description: 'What token standards are supported on Sei EVM and how do I implement them?'
---

# What token standards are supported on Sei EVM and how do I implement them?

Sei EVM follows Ethereum's compatibility model, supporting all major token standards. This article guides you through implementing the most common token standards on Sei and highlights any Sei-specific considerations.

## ERC-20 Fungible Tokens

The ERC-20 standard is fully supported on Sei EVM and works identically to Ethereum.

### Basic Implementation

```
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SeiToken is ERC20, Ownable {
 constructor(address initialOwner)
 ERC20("Sei Token Example", "STKN")
 Ownable(initialOwner)
 {
 // Mint 1 million tokens to the contract deployer
 _mint(initialOwner, 1000000 * 10**decimals());
 }

 // Optional: Add additional minting functionality
 function mint(address to, uint256 amount) public onlyOwner {
 _mint(to, amount);
 }
}

```

### Installation and Deployment

```
# Install OpenZeppelin contracts
npm install @openzeppelin/contracts

# Compile with Hardhat
npx hardhat compile

# Deploy to Sei testnet
npx hardhat run scripts/deploy-erc20.ts --network sei-testnet

```

### Sei-Specific Considerations

- While deploying ERC-20 tokens on Sei works similarly to Ethereum, consider using the Bank precompile for interoperability with native Sei assets.

- For tokens that will interact with native Sei modules, consider implementing pointer contracts.

## ERC-721 Non-Fungible Tokens (NFTs)

ERC-721 for NFTs works seamlessly on Sei EVM.

### Basic Implementation

```
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract SeiNFT is ERC721URIStorage, Ownable {
 using Counters for Counters.Counter;
 Counters.Counter private _tokenIds;

 constructor(address initialOwner)
 ERC721("Sei NFT Collection", "SNFT")
 Ownable(initialOwner)
 {}

 function mintNFT(address recipient, string memory tokenURI)
 public
 onlyOwner
 returns (uint256)
 {
 _tokenIds.increment();
 uint256 newItemId = _tokenIds.current();

 _mint(recipient, newItemId);
 _setTokenURI(newItemId, tokenURI);

 return newItemId;
 }
}

```

### Handling NFT Metadata

- **IPFS Storage**: Store metadata and images on IPFS for decentralization

```
// Example using NFT.Storage
const { NFTStorage, File } = require('nft.storage');
const fs = require('fs');

const API_KEY = 'your-nft-storage-api-key';
const client = new NFTStorage({ token: API_KEY });

async function storeNFT(imagePath, name, description) {
 const image = fs.readFileSync(imagePath);
 const imageFile = new File([image], 'nft.png', { type: 'image/png' });

 const metadata = await client.store({
 name,
 description,
 image: imageFile
 });

 return metadata.url; // Returns ipfs://... URL
}

```

- **On-Chain Storage**: For small metadata, consider on-chain storage for guaranteed availability

### Optimizing for Sei's Performance

With Sei's high throughput and parallel execution:

- Batch minting becomes more efficient

- Consider implementing advanced functions that would be too gas-intensive on Ethereum

```
// Example batch mint function
function batchMint(address[] memory recipients, string[] memory tokenURIs)
 public
 onlyOwner
 returns (uint256[] memory)
{
 require(recipients.length == tokenURIs.length, "Arrays must have same length");

 uint256[] memory ids = new uint256[](recipients.length);

 for (uint i = 0; i newItemId = _tokenIds.current();

 _mint(recipients[i], newItemId);
 _setTokenURI(newItemId, tokenURIs[i]);

 ids[i] = newItemId;
 }

 return ids;
}

```

## ERC-1155 Multi-Token Standard

ERC-1155 combines functionality from ERC-20 and ERC-721, allowing a single contract to manage multiple token types.

### Basic Implementation

```
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SeiMultiToken is ERC1155, Ownable {
 // Token type IDs
 uint256 public constant FUNGIBLE = 0;
 uint256 public constant COLLECTIBLE_1 = 1;
 uint256 public constant COLLECTIBLE_2 = 2;

 constructor(address initialOwner)
 ERC1155("https://game.example/api/item/{id}.json")
 Ownable(initialOwner)
 {
 // Mint 1000 fungible tokens
 _mint(initialOwner, FUNGIBLE, 1000, "");

 // Mint one of each collectible
 _mint(initialOwner, COLLECTIBLE_1, 1, "");
 _mint(initialOwner, COLLECTIBLE_2, 1, "");
 }

 function mint(address to, uint256 id, uint256 amount) public onlyOwner {
 _mint(to, id, amount, "");
 }

 function mintBatch(
 address to,
 uint256[] memory ids,
 uint256[] memory amounts
 ) public onlyOwner {
 _mintBatch(to, ids, amounts, "");
 }
}

```

## Other Token Standards

### ERC-4626 Tokenized Vaults

Perfect for DeFi applications on Sei:

```
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SeiVault is ERC4626 {
 constructor(IERC20 asset)
 ERC4626(asset)
 ERC20("Sei Vault Token", "seiVT")
 {}

 // Override _decimals to match the asset's decimals
 function decimals() public view virtual override returns (uint8) {
 return ERC20(asset()).decimals();
 }
}

```

### ERC-2981 NFT Royalty Standard

Important for NFT marketplaces:

```
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract SeiRoyaltyNFT is ERC721URIStorage, ERC2981, Ownable {
 using Counters for Counters.Counter;
 Counters.Counter private _tokenIds;

 constructor(address initialOwner)
 ERC721("Sei Royalty NFT", "SRNFT")
 Ownable(initialOwner)
 {
 // Set default royalty to 5% (500 basis points)
 _setDefaultRoyalty(initialOwner, 500);
 }

 function mintNFT(
 address recipient,
 string memory tokenURI,
 address royaltyReceiver,
 uint96 royaltyFeeNumerator
 ) public onlyOwner returns (uint256) {
 _tokenIds.increment();
 uint256 newItemId = _tokenIds.current();

 _mint(recipient, newItemId);
 _setTokenURI(newItemId, tokenURI);

 // Set token-specific royalty if provided
 if (royaltyReceiver != address(0) && royaltyFeeNumerator > 0) {
 _setTokenRoyalty(newItemId, royaltyReceiver, royaltyFeeNumerator);
 }

 return newItemId;
 }

 // Override required by Solidity for proper inheritance
 function supportsInterface(bytes4 interfaceId)
 public
 view
 override(ERC721, ERC2981)
 returns (bool)
 {
 return super.supportsInterface(interfaceId);
 }
}

```

## Bridging Standards to Native Sei

To achieve interoperability between EVM tokens and native Sei environment:

### Token Pointers

Using Sei's precompiled pointer contracts:

```
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./interfaces/IPointerRegistry.sol";

contract SeiNativeTokenPointer is ERC20 {
 IPointerRegistry constant pointerRegistry =
 IPointerRegistry(0x000000000000000000000000000000000000100A);
 address immutable pointerContract;
 string public nativeDenom;

 constructor(string memory _nativeDenom, string memory name, string memory symbol)
 ERC20(name, symbol)
 {
 nativeDenom = _nativeDenom;

 // Register this contract as a pointer
 pointerContract = pointerRegistry.registerPointer();
 }

 // Override transfer functions to utilize native token transfers
 function transfer(address to, uint256 amount) public override returns (bool) {
 // Implement native transfer logic using bank precompile
 // ...

 emit Transfer(msg.sender, to, amount);
 return true;
 }
}

```

## Testing Token Standards on Sei

- **Setup Test Environment**:

```
// test/SeiToken.test.js
const { expect } = require("chai");

describe("SeiToken", function () {
 let token;
 let owner;
 let addr1;
 let addr2;

 beforeEach(async function () {
 const SeiToken = await ethers.getContractFactory("SeiToken");
 [owner, addr1, addr2] = await ethers.getSigners();
 token = await SeiToken.deploy(owner.address);
 });

 it("Should assign the total supply to the owner", async function () {
 const ownerBalance = await token.balanceOf(owner.address);
 expect(await token.totalSupply()).to.equal(ownerBalance);
 });

 // More tests...
});

```

- **Test with Sei-Specific Logic**:

```
it("Should work with Sei's parallel execution", async function () {
 // Simulate multiple concurrent transactions
 await Promise.all([
 token.transfer(addr1.address, 50),
 token.transfer(addr2.address, 100),
 token.connect(addr1).approve(addr2.address, 50),
 ]);

 // Verify results
 expect(await token.balanceOf(addr1.address)).to.equal(50);
 expect(await token.balanceOf(addr2.address)).to.equal(100);
 expect(await token.allowance(addr1.address, addr2.address)).to.equal(50);
});

```

## Best Practices for Sei Token Implementations

- **Optimize for Parallel Execution**:

Design tokens with minimal state conflicts

- Use granular state like individual balances rather than shared counters

- Consider batch operations for efficiency

- **Security Considerations**:

Follow ERC standards precisely to ensure compatibility with wallets and exchanges

- Use established libraries like OpenZeppelin

- Consider formal verification for high-value contracts

- **Gas Efficiency**:

Take advantage of Sei's lower gas costs for more complex functionality

- Implement batch operations where appropriate

- Use ERC-1155 for multiple token types to save on deployment costs

- **Interoperability**:

Consider implementing pointer contracts for EVM-native interoperability

- Use precompiles where applicable

## Verifying Token Contracts

```
# Verify ERC-20 contract
npx hardhat verify --network sei-testnet DEPLOYED_CONTRACT_ADDRESS "CONSTRUCTOR_ARGUMENT"

# Example
npx hardhat verify --network sei-testnet 0x123...789 "0xabc...def"

```

## Adding Tokens to MetaMask

Guide users to add your token to their wallet:

- Open MetaMask and ensure Sei Network is selected

- Click "Import tokens" at the bottom of the assets list

- Enter the token contract address

- Token symbol and decimals should auto-populate

- Click "Add Custom Token"
