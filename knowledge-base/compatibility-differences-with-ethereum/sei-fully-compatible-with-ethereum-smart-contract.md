---
title: 'Is Sei fully compatible with Ethereum smart contract standards such as ERC-20, ERC-721, ERC-1155?'
description: 'Is Sei fully compatible with Ethereum smart contract standards such as ERC-20, ERC-721, ERC-1155?'
---

# Is Sei fully compatible with Ethereum smart contract standards such as ERC-20, ERC-721, ERC-1155?

Yes, Sei Network is fully compatible with standard Ethereum smart contract standards including ERC-20, ERC-721, and ERC-1155. Sei's EVM environment implements the Ethereum Virtual Machine specification up through the Cancun upgrade, ensuring that token standards work exactly as they do on Ethereum.

### ERC-20 Compatibility

Standard ERC-20 tokens deploy and function identically to Ethereum:

```
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyToken is ERC20 {
 constructor(uint256 initialSupply) ERC20("My Token", "MTK") {
 _mint(msg.sender, initialSupply);
 }
}

```

You can use familiar tools like OpenZeppelin contracts without modification. All standard ERC-20 functions like `transfer`, `balanceOf`, `approve`, and `transferFrom` work as expected.

### ERC-721 (NFTs) Compatibility

Sei fully supports non-fungible token standards:

```
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract MyNFT is ERC721URIStorage {
 uint256 private _tokenIds;

 constructor() ERC721("My NFT Collection", "MYNFT") {}

 function mintNFT(address recipient, string memory tokenURI)
 public
 returns (uint256)
 {
 uint256 newItemId = _tokenIds++;
 _mint(recipient, newItemId);
 _setTokenURI(newItemId, tokenURI);
 return newItemId;
 }
}

```

NFT marketplaces, collections, and other NFT infrastructure built for Ethereum can be deployed to Sei with minimal changes.

### ERC-1155 (Multi-Token) Compatibility

Multi-token standard is also fully supported:

```
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract MyMultiToken is ERC1155 {
 constructor() ERC1155("https://myapi.com/token/{id}.json") {}

 function mint(address account, uint256 id, uint256 amount, bytes memory data)
 public
 {
 _mint(account, id, amount, data);
 }

 function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data)
 public
 {
 _mintBatch(to, ids, amounts, data);
 }
}

```

### Marketplace and Infrastructure Support

Common infrastructure also works without modification:

```
// Example of standard marketplace contract
interface IERC721 {
 function transferFrom(address from, address to, uint256 tokenId) external;
}

contract SimplifiedMarketplace {
 struct Listing {
 address seller;
 uint256 price;
 }

 mapping(address => mapping(uint256 => Listing)) public listings;

 function listItem(address nftContract, uint256 tokenId, uint256 price) external {
 IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);
 listings[nftContract][tokenId] = Listing(msg.sender, price);
 }

 function buyItem(address nftContract, uint256 tokenId) external payable {
 Listing memory listing = listings[nftContract][tokenId];
 require(listing.price > 0, "Not for sale");
 require(msg.value >= listing.price, "Insufficient payment");

 delete listings[nftContract][tokenId];
 IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
 payable(listing.seller).transfer(listing.price);
 }
}

```

### Testing Compatibility

While standards are compatible, testing on Sei's testnet is always recommended:

```
# Configure Hardhat for Sei testnet
# In hardhat.config.js
module.exports = {
 networks: {
 seiTestnet: {
 url: "https://evm-rpc.testnet.sei.io",
 chainId: 1328,
 accounts: [process.env.PRIVATE_KEY]
 }
 }
}

# Deploy and test standard contracts
npx hardhat run scripts/deploy.js --network seiTestnet
```
