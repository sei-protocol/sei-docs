# Sei Docs — agent instructions

## About this project

- Official Sei Network documentation, built on [Mintlify](https://mintlify.com)
- Pages are MDX with YAML frontmatter; config lives in `docs.json`
- Run `mint dev` to preview locally, `mint broken-links` to check links
- Hosted at `docs.sei.io`

## Terminology

- **Sei** (not "the Sei blockchain" or "Sei chain") — just "Sei"
- **Sei EVM** when specifically referring to the EVM execution layer
- **Sei Giga** is the next-generation architecture upgrade
- **seid** is the CLI binary; always lowercase and code-formatted
- **sei-js** (lowercase, hyphenated) for the JS/TS SDK
- **Pacific-1** (mainnet chain ID `1329`), **Atlantic-2** (testnet chain ID `1328`)
- Precompiles live at specific addresses — always reference exact address when mentioning
- **Twin Turbo Consensus** and **parallelization engine** are proper nouns
- Prefer "dApp" over "app" when the context is blockchain
- Avoid "gas fees" — say "gas" or "transaction fees"

## Style preferences

- Active voice, second person ("you")
- Sentence case for headings
- One idea per sentence
- Bold for UI elements: Click **Settings**
- Inline code for file names, commands, paths, RPC methods
- Prefer `<Card>` / `<CardGroup>` / `<Columns>` over heavy `<div>` layouts
- Prefer `<Info>`, `<Warning>`, `<Note>`, `<Tip>`, `<Check>`, `<Danger>` over custom callouts
- Use `<Steps>` / `<Step>` for ordered procedures
- Use `<Tabs>` / `<Tab>` for parallel code samples (hardhat vs. foundry, ethers vs. viem, etc.)
- Always give `<CodeGroup>` blocks explicit language tags

## Content boundaries

- Cosmos-SDK content is deprecated (see SIP-3) — keep the deprecation notice visible on `cosmos-sdk/index.mdx`
- New content should target EVM unless it's infrastructure (nodes, validators)
- No speculation about unreleased features or timelines
- No trading advice, price targets, or investment framing
- Link to authoritative external docs (OpenZeppelin, Ethereum.org, Hardhat, Foundry) instead of re-explaining them
- Link to live status/dashboards rather than hard-coding network stats that change

## Redirects

All legacy paths from the Nextra site are preserved in `docs.json` under `redirects`. When renaming or moving a page, always add a matching redirect entry so external links and search results continue to resolve.

## llms.txt / llms-full.txt

`llms.txt` and `llms-full.txt` at the repo root are hand-curated overrides for Mintlify's auto-generated versions. The script `scripts/generate-llms.mjs` reads `docs.json`, fetches each page's `.md` from the deployed site, and re-emits both files using the curated config block at the top of the script (project name, intro, constraints, quick reference, section overviews, examples, resources). A scheduled GitHub Action (`.github/workflows/regenerate-llms.yml`) runs this weekly and opens a PR when anything changed; trigger it manually via `workflow_dispatch` after large content updates if you don't want to wait. Edit the config block at the top of the script to update wording; do not hand-edit the generated `.txt` files.

## Brand assets

- Logos and brand guidelines live in `assets/sei-brand-assets/`
- Docs OG banner is `assets/docs-banner.png`
- Primary brand color is Sei Maroon `#600014` — configured in `docs.json`
