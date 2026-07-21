# Sei Docs Style Guide

This style guide contains general rules and principles to ensure the documentation is cohesive, useful, and organized.

## Principles

This documentation strives to be:

### Beginner Friendly

The Sei community welcomes members from all walks of life. As such, the documentation should be understandable by anyone, including those who are new to Web3 or non-technical.

The docs should strive to be Jargon Free:

- Advanced terms and concepts, especially Web3 related terms and ideas, should be properly explained.
- Where appropriate, we should provide links to resources that can help the reader understand.
- Acronyms should be spelled out on first use.

### Simple

Great documentation is simple and to the point. It should aim to convey more meaning with fewer words.

- To be clear and inclusive, avoid using jargon and obscure words where possible.
- Limit the number of clauses in a sentence and make sure that your points are structured.
- Avoid qualifying language, which is ~~quite~~ often ~~completely~~ unnecessary.
- Information should be simply organized and easy to find.

### Self-explanatory

Great documentation is self-explanatory. Documentation shouldn't need more documentation to explain itself.

- Aim to provide as much context as possible. Code snippets and diagrams are great ways to illustrate complex concepts and provide examples.

## Organization

The Sei Docs are structured using [Mintlify](https://mintlify.com). The documentation is organized into four main sections based on target audience and purpose.

### Learn

The Learn section contains general information about Sei and its ecosystem. This section is designed to be accessible to everyone, from complete beginners to experienced developers looking to understand Sei's architecture.

**Contents include:**

- **Getting Started**: About Sei, user quickstart, chain info, token standards, gas, account linking
- **Sei Giga Platform**: Overview, technical specs, and developer guide for Sei's next-generation architecture
- **Core Architecture**: Consensus (Twin Turbo), parallel execution, and storage (SeiDB)
- **Network Tools & Providers**: Wallets, RPC providers, block explorers, faucet, indexers
- **Governance**: Overview, proposals, and staking
- **Interoperability**: EVM ↔ CosmWasm interaction
- **Resources**: Hardware wallets, Ledger setup, and brand kit

### EVM

The EVM section is the primary developer resource for building on Sei. It covers everything needed to develop, deploy, and maintain smart contracts and dApps on Sei's high-performance EVM.

**Contents include:**

- **Essentials**: Network information, differences with Ethereum, migration guides
- **seid CLI**: Installation, querying, and transactions
- **Frontend Development**: Sei Global Wallet, building frontends
- **Smart Contracts**: Development with Hardhat/Foundry, contract wizard, debugging, tracing, verification, precompiles
- **sei-js Library**: External links to sei-js documentation (Scaffold Sei, MCP Server, X402, Ledger)
- **Ecosystem Tutorials**: Indexers, wallet integrations, bridging, AI tooling, oracles, VRF
- **Reference**: Transactions, RPC reference, tokens, changelog, ecosystem contracts
- **Hardware Wallets**: Ledger integration with Ethers

### Cosmos-SDK (Deprecated)

> ⚠️ **Deprecation Notice**: Cosmos SDK and CosmWasm functionality is being deprecated in favor of EVM-only. For more details, see [SIP-3](https://github.com/sei-protocol/sips/blob/main/sips/sip-3.md) and [Proposal 99](https://seistream.app/proposals/99).

This section contains legacy documentation for Cosmos SDK functionality. New development should focus on the EVM.

### Operate (Node)

The Operate section covers topics related to running Sei infrastructure. This is relevant for node operators, validators, and those looking to contribute to chain infrastructure.

**Contents include:**

- **Node Operations**: Overview, Seictl setup, statesync, snapshot sync, node types, troubleshooting, API configuration, validators, oracle price feeder
- **Advanced Operations**: Configuration & monitoring, RocksDB backend, technical reference

## Style Guidelines

### Acronyms and Abbreviations

To maximize clarity, we should avoid acronyms and abbreviations where possible, especially for shorter, more ambiguous acronyms:

- Just use 'CosmWasm' instead of 'CW'

However, there are occasions where acronyms might be more easily understandable (e.g., NFT instead of Non-Fungible Token, RPC instead of Remote Procedure Call), or referred to very frequently.

In these cases, we should first use the spelled-out term followed by the shortened form in parentheses:

- Command Line Interface (CLI)
- Ethereum Virtual Machine (EVM)
- Denomination (Denom)

On subsequent occurrences in the same topic, we can then use the acronym.

### Links

You can add links to text using the following syntax:

```md
[text_to_highlight](link)
```

Some examples:

1. Link to section of [same document](#style-guidelines).

```md
[same document](#style-guidelines)
```

2. Link to [another document](/learn).

```md
[another document](/learn)
```

3. Link to [section of another document](/learn#getting-started).

```md
[section of another document](/learn#getting-started)
```

4. External [Link](https://dashboard.sei.io).

```md
[Link](https://dashboard.sei.io)
```

Sentence ending punctuation should always be included outside the link.

Links should be as descriptive as possible to let the reader know where they are going.

- Bad Example: Interested to learn more about staking? Click [here](#links) to find out more
- Better Example: Interested to learn more about staking? Refer to our [staking guide](/learn/general-staking) to find out more!

### Code

Code should either be specified as `inline`

```md
Code should either be specified as `inline`
```

Or within code blocks.

```ts
const codeBlockString = 'codeBlock';
```

````md
```ts
const codeBlockString = 'codeBlock';
```
````

`Inline Code` should be used when referring to:

- File and directory names (e.g., `./evm/networks.mdx`)
- References to variables in code (e.g., `codeBlockString`)
- CLI commands (e.g., `seid`)
- Contract addresses or hashes

Code Blocks should be used when:

- Sharing code snippets

```ts
const deployContract = async () => {
  const factory = new ethers.ContractFactory(abi, bytecode, signer);
  const contract = await factory.deploy();
  await contract.waitForDeployment();
  return contract;
};
```

- Scripts that users should copy and execute directly

```sh
git clone https://github.com/sei-protocol/sei-chain
cd sei-chain
git checkout v6.2.6
make install
```

When code blocks are used, they should always be prettified by specifying the language. For example:

````md
TypeScript code block labelled with 'ts'

```ts
const variable = value;
```

Bash command line code block labelled with 'sh'

```sh
seid version
```

Solidity code block labelled with 'solidity'

```solidity
contract MyToken is ERC20 {
    constructor() ERC20("MyToken", "MTK") {}
}
```
````

When writing code blocks, avoid:

1. Creating large code blocks. Break your code into smaller, more digestible pieces.
2. Writing too much documentation in between lines. If necessary, break the code block up and add text to explain each code block instead.

For tutorials, the goal should be to write code blocks that can be directly copied and used by the reader.

Remember, code is used to elaborate or provide an example—make your point clearly first before using code to substantiate it!

### Headings

Headings should be used to denote the start of each section. Mintlify renders the page title from frontmatter automatically, so don't add a leading `# Page Title` H1 in the body. Use `##`, `###`, and `####` for section structure (avoid using anything more than level 4 headings):

```md
## Main Topic(s) on page

### Sub Topics

#### Use only if more required
```

Heading levels should never be skipped. A level 2 heading should follow the implicit page title, and a level 3 heading should follow a level 2 heading, etc.

### Images

To use images, first add them to the `./assets` folder.

Then reference them using absolute paths with standard Markdown image syntax:

```md
![alt text for my image](/assets/image-name.png)
```

For images that need a frame, use Mintlify's `<Frame>` component:

```mdx
<Frame caption="Optional caption">
  ![alt text](/assets/image-name.png)
</Frame>
```

### Callouts and Admonitions

Use callouts to highlight important information. Mintlify supports the following callout types:

```mdx
<Note>Informational callout for additional context.</Note>

<Tip>Helpful tip or recommended approach.</Tip>

<Info>Background information or supporting context.</Info>

<Warning>Warning callout for important caveats or gotchas.</Warning>

<Check>Confirmation that something has been verified or completed.</Check>

<Danger>Critical information, deprecation notices, or destructive actions.</Danger>
```

### Tables

Use tables for comparing features, listing network information, or presenting structured data:

```md
| Feature    | Sei EVM    | Ethereum      |
| ---------- | ---------- | ------------- |
| Block Time | 400 ms     | 12-14 seconds |
| Throughput | 100 MGas/s | 3 MGas/s      |
```

### Network Information

When referencing network information, always include:

- Chain ID (both decimal and hex format where applicable)
- RPC URLs
- Explorer links

Example:
| Network | Chain ID | RPC URL |
|---------|----------|---------|
| Mainnet (pacific-1) | 1329 (0x531) | https://evm-rpc.sei-apis.com |
| Testnet (atlantic-2) | 1328 (0x530) | https://evm-rpc-testnet.sei-apis.com |
