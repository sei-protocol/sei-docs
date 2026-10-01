#!/usr/bin/env node
/**
 * Generate the docs single-file skills (.mintlify/skills/<name>/SKILL.md) from the
 * canonical sei-skill source (github.com/sei-protocol/sei-skill).
 *
 * Each docs skill is a FLATTENED projection of one or more sei-skill domains:
 * self-contained, <= ~5k tokens, linking to live docs.sei.io pages instead of
 * bundling references/ (Mintlify serves only a single SKILL.md per skill — its
 * discovery manifest lists files: ["SKILL.md"], no references/ subtree).
 *
 * sei-skill is the source of truth; these docs skills are derived. Reconcile any
 * docs-side fixes back into sei-skill FIRST, then regenerate — generating from a
 * stale source would regress the docs.
 *
 * Modes:
 *   - ANTHROPIC_API_KEY set -> condenses each skill via the model, writes SKILL.md.
 *   - no key                -> emits SOURCE_BUNDLE.md + PROMPT.md per skill to dist/
 *                              for a human/LLM to run.
 *
 * The current docs skill (if present) is fed in as the QUALITY BAR so generation
 * matches-or-beats it. Output lands in dist/ (gitignored) — review before copying
 * into .mintlify/skills/<name>/.
 *
 * Paths and model (override via env):
 *   SEI_SKILL_DIR    default ../../sei-skill/skill   (sibling checkout)
 *   ANTHROPIC_MODEL  required with ANTHROPIC_API_KEY — a current model ID
 *
 * Usage:
 *   node scripts/build-mintlify-skills.mjs [--skill sei-bridges]
 *   SEI_SKILL_DIR=/abs/path/sei-skill/skill node scripts/build-mintlify-skills.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(__dirname, '..');                                   // sei-docs root
const SKILL = process.env.SEI_SKILL_DIR || resolve(REPO, '..', 'sei-skill', 'skill');
const DOCS_SKILLS = resolve(REPO, '.mintlify', 'skills');
const DIST = resolve(REPO, 'dist', 'mintlify-skills');

const R = (p) => readFileSync(p, 'utf8');
const has = (p) => existsSync(p);

if (!has(SKILL)) {
  console.error(`! sei-skill source not found at ${SKILL}`);
  console.error('  Clone github.com/sei-protocol/sei-skill next to sei-docs, or set SEI_SKILL_DIR.');
  process.exit(1);
}

// docs skill -> canonical sei-skill sources (master/variant + references).
const MAP = [
  { name: 'sei-contracts', sources: ['SKILL-CONTRACTS.md', 'references/evm/overview.md', 'references/evm/foundry.md', 'references/evm/hardhat.md', 'references/contracts/gas-optimization-sei.md', 'references/contracts/occ-aware-design.md', 'references/contracts/upgradeability.md', 'references/contracts/account-abstraction.md', 'references/contracts/contract-verification.md'] },
  // references/pointers/token-factory.md is left out: tokenfactory is unsupported on docs.sei.io (see DOCS_POLICY).
  { name: 'sei-precompiles', sources: ['references/precompiles/overview.md', 'references/precompiles/staking-distribution.md', 'references/precompiles/governance.md', 'references/precompiles/json-p256.md', 'references/pointers/overview.md'] },
  { name: 'sei-frontend', sources: ['SKILL-FRONTEND.md', 'references/frontend/frontend-stack.md', 'references/addresses-wallets.md'] },
  { name: 'sei-security', sources: ['references/contracts/security.md', 'references/ecosystem/ai-tooling.md'] },
  { name: 'sei-nodes', sources: ['references/ecosystem/node-operations.md', 'references/ecosystem/validators.md', 'references/architecture.md'] },
  { name: 'sei-payments', sources: ['references/ecosystem/payments.md'] },
  { name: 'sei-bridges', sources: ['references/ecosystem/bridges.md', 'references/ecosystem/ibc-bridging.md'] },
  { name: 'sei-migration', sources: ['references/migration/from-ethereum.md', 'references/migration/from-solana.md'] },
];

// Where docs.sei.io has retired something sei-skill still teaches, the docs win until
// sei-skill catches up. Keep the IBC, tokenfactory, and x402 lines in sync with the
// constraints in scripts/generate-llms.mjs.
const DOCS_POLICY = [
  'IBC is disabled on Sei in both directions (Proposals 116 and 120 inbound, Proposal 121 outbound). Never present IBC or the IBC precompile as a way to move assets on or off Sei; existing ibc/ balances stay usable within Sei.',
  'Tokenfactory is unsupported. Give no commands, APIs, Wasm bindings, native-denom pointer workflows, or other instructions for creating, minting, burning, administering, or integrating tokenfactory denoms. Use ERC-20 for new fungible tokens (https://docs.sei.io/cosmos-sdk#tokenfactory-is-not-supported).',
  'Pointer contracts are a legacy and migration tool: the CW20/CW721/CW1155 pointer flow applies only to already-deployed CosmWasm contracts, and new tokens are deployed as ERC-20/721/1155 (https://docs.sei.io/learn/pointers).',
  'The sei_associate JSON-RPC method and the seid tx evm associate-address command have been removed. Associate addresses through the Addr precompile (https://docs.sei.io/learn/accounts).',
  'RocksDB support for the SeiDB state store will be removed. Do not recommend ss-backend = "rocksdb" or RocksDB builds; point nodes that use it at the rebuild guidance (https://docs.sei.io/node/node-operators#move-off-rocksdb).',
  'Current seid releases require Go 1.25.6 or later; the authoritative version is the go.mod at the release tag (https://docs.sei.io/node).',
  'x402 means the upstream v2 protocol: @x402/core and @x402/evm with the matching @x402 client or server adapter (@x402/fetch, @x402/axios, @x402/express, @x402/hono, @x402/next), the PAYMENT-REQUIRED, PAYMENT-SIGNATURE, and PAYMENT-RESPONSE headers, and the CAIP-2 network IDs eip155:1329 and eip155:1328. The @sei-js/x402, @sei-js/x402-fetch, @sei-js/x402-axios, @sei-js/x402-express, @sei-js/x402-hono, and @sei-js/x402-next packages implement v1, are deprecated, and must not be recommended. Never present the v1 X-Payment header, a transaction-hash proof, or a hand-rolled verifier (https://docs.sei.io/ai/x402).',
];

// Terminology and style from AGENTS.md. The skills are generated-only, so the
// prompt is the one place that can keep regenerations from drifting.
const HOUSE_STYLE = [
  'Name the networks Sei Mainnet (EVM chain ID 1329) and Sei Testnet (EVM chain ID 1328). Both are proper nouns, so never write "Sei mainnet" or "Sei testnet". Keep pacific-1 and atlantic-2 only where technically required: node-operator instructions, CLI or config values, API paths, and registry keys.',
  'Call the network Sei, not "the Sei chain" or "the Sei blockchain". Say Sei EVM for the EVM execution layer.',
  'Write seid lowercase and code-formatted, and sei-js lowercase and hyphenated.',
  'Say "gas" or "transaction fees", never "gas fees", and prefer "dApp" over "app" for blockchain applications.',
  'Do not quote a current minimum gas price (such as ~50 gwei) in prose or comments. Governance sets it and has changed it, so say to read eth_gasPrice and link https://docs.sei.io/evm/differences-with-ethereum.',
];

// Known bugs in sei-skill's samples. Agents copy skill code verbatim, so the
// output must correct them. Remove an entry once sei-skill fixes it.
const SOURCE_ERRATA = [
  'Precompiles are native code in the Sei node. A local EVM and a Foundry, Hardhat, or anvil fork all lack them, so precompile calls fail there. Recommend testing on Sei Testnet or a local seid node and placing a mock at the address in unit tests (Foundry vm.etch, Hardhat hardhat_setCode); never recommend forking for precompile tests.',
  'Signature-gated execution (such as a P-256 passkey wallet) must build the signed digest inside the contract from block.chainid, address(this), a nonce that increments on use, and the exact call. Never verify a caller-supplied hash.',
  'Wait for an approval to be mined before the call that spends it; viem write calls return a hash, not a receipt. viem waitForTransactionReceipt and wagmi useWaitForTransactionReceipt resolve for reverted transactions too, so every sample checks receipt.status before reporting success. wagmi samples that pin a chainId pin it on every read and receipt hook too.',
  'Sei accepts EIP-1559 (type-2) transactions but has no base-fee burn or priority-fee market: recommend legacy gasPrice as the default without calling EIP-1559 fields unsupported.',
  'Validator resync scripts fail closed (set -euo pipefail), stop seid and verify it stopped before touching keys or data, back up priv_validator_state.json and check the backup exists, and restore it after clearing data/, because seid tendermint unsafe-reset-all resets it to height 0. Keep that resync in its own block, separate from the state sync configuration a fresh node also runs, so a fresh node never reaches systemctl stop for a unit that does not exist yet.',
  'Archive nodes also set ss-keep-recent = 0 in app.toml, because min-retain-blocks = 0 and pruning = "nothing" leave SeiDB State Store pruning on. [statesync] enable = true in config.toml makes a node bootstrap from peers\' snapshots; a state sync provider serves snapshots by setting a non-zero [state-sync] snapshot-interval in app.toml.',
  'seid\'s config.toml [priv-validator] section has no key-type or server-address keys. For a TMKMS or Horcrux remote signer, seid listens on [priv-validator] laddr (a tcp:// address only the signer host can reach) and the signer dials in; link the signer\'s own docs for its side of the setup.',
  'Match precompile ABIs to sei-chain precompiles/<name>/abi.json: Distribution withdrawDelegationRewards(string validator) and withdrawValidatorCommission() with the delegator or operator as caller; Governance submitProposal(string proposalJSON), proposal(uint64), and proposals(int32,address,address,bytes); Pointer addCW20Pointer, addCW721Pointer, and addCW1155Pointer; JSON has no extractAsBytes32 and all its functions are view; Staking delegation() returns one struct (balance, delegation), and paginated queries take a bytes key ("0x" for the first page).',
  'P256 verify(bytes input) takes the 160-byte packing of hash, r, s, x, y and returns empty data for an invalid signature, so call it with staticcall and check the output length.',
  '@sei-js/precompiles exports P256_PRECOMPILE_ADDRESS and P256_PRECOMPILE_ABI, no longer exports the Oracle precompile, and re-exports sei and seiTestnet from viem.',
  'seid has no register-evm-pointer or register-cosmos-pointer command (register through the Pointer precompile; seid q evm pointer only looks pointers up). forge script has no --simulate flag, and forge script and forge create (Foundry 1.0+) only simulate unless --broadcast is passed.',
  'When porting Solana programs, msg.sender replaces the Signer check but authorizes no one: every has_one or stored-authority constraint becomes an explicit require(msg.sender == authority) or onlyOwner check.',
  'Character filters are not a prompt-injection defense. Samples must pass on-chain strings to a model delimited as untrusted data and gate writes on policy and explicit confirmation.',
  'Token-transfer samples use SafeERC20 (safeTransfer, safeTransferFrom) rather than ignoring the returned bool.',
  'Agent write samples block on an explicit confirmation step, such as an injected confirm(summary) callback, before signing; logging a summary is not a gate. The summary names the target contract address, the method and its arguments serialized in full (a BigInt-aware JSON.stringify rather than join, so tuples and structs show), the native SEI value sent, the chain, and the estimated cost, so two different writes never produce the same approval prompt.',
  'Recommend OpenZeppelin ReentrancyGuardTransient (EIP-1153, no persistent slot, so no OCC hot key) over guards keyed by msg.sender, which miss reentry through a second contract and cross-function reentrancy. Gas used is the same whether transactions run in parallel or serially, so it cannot measure parallelism.',
  'CCTP v2 TokenMessengerV2.depositForBurn takes seven arguments: amount, destinationDomain, mintRecipient, burnToken, destinationCaller, maxFee, minFinalityThreshold (1000 Fast, 2000 Standard).',
  'Do not hardcode a 50 gwei gas price in write samples; read the live floor from eth_gasPrice.',
  'Keep units explicit: staking delegation balances are usei (6 decimals) while delegate() takes wei (18 decimals), and ERC-20 samples for an arbitrary token must read decimals() instead of assuming 18.',
];

const PROMPT = (name, bar) => `You are flattening the canonical Sei skill source below into ONE self-contained Mintlify skill file for docs.sei.io.

Produce a single SKILL.md for the skill "${name}":
- YAML frontmatter: name (= "${name}"), description (a ">"-folded "Use when ..." trigger paragraph), license: MIT, compatibility, metadata { author: Sei, version, intended-host: docs.sei.io, domain }.
- Body <= ~5000 tokens. Dense and Sei-specific: "Critical facts", code, "Common pitfalls", and a "Key docs" table.
- Link to live https://docs.sei.io/... pages (NOT references/*.md). Keep every canonical constant (addresses, chain IDs, EIDs, gas costs, governance proposal numbers) verbatim, except the current minimum gas price (see HOUSE STYLE); never invent an address or proposal number.
- The file is MDX-parsed by the docs tooling: no HTML comments, and no bare "<", ">", "{", or "}" outside code spans/fences (write placeholders like \`<your-rpc>\` in backticks).
- Match or exceed the QUALITY BAR (the current docs skill) in correctness and concision. Do not reintroduce anything the source dropped (e.g. Axelar, LayerZero v1 API, native-oracle endorsement, overconfident Wormhole-EVM examples).
- Follow the DOCS POLICY below wherever it conflicts with the source or the quality bar; leave out source material it rules out.
- Correct every sample the SOURCE ERRATA below describes, even where the source still shows the old version.
- Follow the HOUSE STYLE below in prose, headings, frontmatter descriptions, and code comments.
- Output only the SKILL.md itself, starting with its frontmatter.

== DOCS POLICY ==
${DOCS_POLICY.map((rule) => '- ' + rule).join('\n')}

== HOUSE STYLE ==
${HOUSE_STYLE.map((rule) => '- ' + rule).join('\n')}

== SOURCE ERRATA ==
${SOURCE_ERRATA.map((rule) => '- ' + rule).join('\n')}

${bar ? '== QUALITY BAR (current docs skill — match this) ==\n' + bar + '\n' : ''}== CANONICAL SOURCE (flatten this) ==\n`;

const args = process.argv.slice(2);
const only = args.includes('--skill') ? args[args.indexOf('--skill') + 1] : null;
const write = args.includes('--write'); // also write generated SKILL.md into .mintlify/skills/<name>/
// A missing or misspelled name would otherwise regenerate every skill, or none, and exit 0.
if (args.includes('--skill') && !MAP.some((m) => m.name === only)) {
  console.error(`! --skill needs one of: ${MAP.map((m) => m.name).join(', ')}`);
  process.exit(1);
}
const SRC_REF = process.env.SEI_SKILL_REF || '';
const MODEL = process.env.ANTHROPIC_MODEL;

if (write && !process.env.ANTHROPIC_API_KEY) {
  console.error('! --write needs ANTHROPIC_API_KEY: without it nothing is generated, so nothing would be written.');
  process.exit(1);
}
if (process.env.ANTHROPIC_API_KEY && !MODEL) {
  console.error('! Set ANTHROPIC_MODEL to a current model ID to generate; there is no default.');
  process.exit(1);
}

// Stamp a GENERATED marker so the artifact is clearly machine-generated; the
// "Enforce generated-only agent skills" step in validate-docs.yml requires it,
// which is how "no hand-authored skill content in the docs" is kept true.
// The marker lives as YAML comments INSIDE the frontmatter: invisible to YAML/
// skill consumers, and — unlike an HTML comment in the body — safe for MDX
// parsers (mint / the Mintlify platform parse .md as MDX, where `<!-- -->` is
// a syntax error).
const BANNER_LINE = /^# (GENERATED FROM sei-protocol\/sei-skill|Edit the source in sei-skill|\(see \.github\/workflows\/sync-skills\.yml\)).*\n/gm;
function stampGenerated(md) {
  const banner = `# GENERATED FROM sei-protocol/sei-skill${SRC_REF ? '@' + SRC_REF : ''} — DO NOT EDIT BY HAND.\n# Edit the source in sei-skill, then regenerate via scripts/build-mintlify-skills.mjs\n# (see .github/workflows/sync-skills.yml).\n`;
  // A reply that echoes the quality bar's banner would otherwise end up with two.
  const body = md.replace(BANNER_LINE, '');
  if (body.startsWith('---\n')) return '---\n' + banner + body.slice(4);
  return `---\n${banner}---\n` + body;
}

// A renamed or deleted source would silently shrink a skill, so stop before
// emitting or generating anything.
const missingSources = MAP
  .filter((m) => !only || m.name === only)
  .flatMap((m) => m.sources.filter((s) => !has(join(SKILL, s))).map((s) => `${m.name}: ${s}`));
if (missingSources.length) {
  console.error(`! ${missingSources.length} mapped source(s) missing from ${SKILL}:`);
  for (const s of missingSources) console.error(`  - ${s}`);
  console.error('  Update MAP in this script to match sei-skill before regenerating.');
  process.exit(1);
}

mkdirSync(DIST, { recursive: true });

for (const m of MAP) {
  if (only && m.name !== only) continue;
  const bundle = m.sources.map((s) => `\n\n<<< ${s} >>>\n` + R(join(SKILL, s))).join('\n');
  const barPath = join(DOCS_SKILLS, m.name, 'SKILL.md');
  const bar = has(barPath) ? R(barPath).replace(BANNER_LINE, '') : '';
  const outDir = join(DIST, m.name);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'SOURCE_BUNDLE.md'), bundle);
  writeFileSync(join(outDir, 'PROMPT.md'), PROMPT(m.name, bar));
  console.log(`• ${m.name}: ${m.sources.length} source(s)${bar ? ', quality-bar found' : ''}`);
}

if (process.env.ANTHROPIC_API_KEY) {
  console.log('\nANTHROPIC_API_KEY detected — generating SKILL.md per skill (review before copying)...');
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const client = new Anthropic();
  for (const m of MAP) {
    if (only && m.name !== only) continue;
    const prompt = R(join(DIST, m.name, 'PROMPT.md')) + R(join(DIST, m.name, 'SOURCE_BUNDLE.md'));
    const msg = await client.messages.create({ model: MODEL, max_tokens: 8000, messages: [{ role: 'user', content: prompt }] });
    // A truncated reply, or one with prose before the frontmatter, would still be
    // stamped GENERATED and pass the marker check in CI.
    if (msg.stop_reason === 'max_tokens') {
      console.error(`! ${m.name}: the reply hit max_tokens, so it is incomplete; nothing written.`);
      process.exit(1);
    }
    const text = msg.content.map((b) => (b.type === 'text' ? b.text : '')).join('');
    // Unwrap only a reply that is one fenced block; a skill may legitimately end with a code fence.
    const wrapped = text.trim().match(/^```(?:markdown)?\n([\s\S]*)\n```$/);
    const body = wrapped ? wrapped[1] : text.trim();
    const frontmatter = body.startsWith('---\n') ? body.slice(4).split('\n---')[0] : '';
    if (!new RegExp(`^name: (['"]?)${m.name}\\1$`, 'm').test(frontmatter)) {
      console.error(`! ${m.name}: the reply does not start with frontmatter naming "${m.name}"; nothing written.`);
      process.exit(1);
    }
    const skillMd = stampGenerated(body) + '\n';
    writeFileSync(join(DIST, m.name, 'SKILL.md'), skillMd);
    if (write) {
      const dest = join(DOCS_SKILLS, m.name, 'SKILL.md');
      mkdirSync(dirname(dest), { recursive: true });
      writeFileSync(dest, skillMd);
    }
    console.log(`  ✓ ${m.name}/SKILL.md${write ? ' (written into .mintlify/skills/)' : ''}`);
  }
} else {
  console.log('\nNo ANTHROPIC_API_KEY — emitted SOURCE_BUNDLE.md + PROMPT.md per skill.');
  console.log('Set ANTHROPIC_API_KEY to auto-generate (add --write to emit straight into .mintlify/skills/), or hand PROMPT.md + SOURCE_BUNDLE.md to an LLM.');
}
console.log(`\nOutput: ${DIST}`);
console.log(write
  ? 'Generated skills written into .mintlify/skills/ — review the diff before committing.'
  : 'Review each dist/mintlify-skills/<name>/SKILL.md, then re-run with --write (or copy into .mintlify/skills/<name>/).');
