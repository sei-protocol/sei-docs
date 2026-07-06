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
 * Paths (override via env):
 *   SEI_SKILL_DIR   default ../../sei-skill/skill   (sibling checkout)
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
  { name: 'sei-precompiles', sources: ['references/precompiles/overview.md', 'references/precompiles/staking-distribution.md', 'references/precompiles/governance.md', 'references/precompiles/json-p256.md', 'references/pointers/overview.md', 'references/pointers/token-factory.md'] },
  { name: 'sei-frontend', sources: ['SKILL-FRONTEND.md', 'references/frontend/frontend-stack.md', 'references/addresses-wallets.md'] },
  { name: 'sei-security', sources: ['references/contracts/security.md', 'references/ecosystem/ai-tooling.md'] },
  { name: 'sei-nodes', sources: ['references/ecosystem/node-operations.md', 'references/ecosystem/validators.md', 'references/architecture.md'] },
  { name: 'sei-payments', sources: ['references/ecosystem/payments.md'] },
  { name: 'sei-bridges', sources: ['references/ecosystem/bridges.md', 'references/ecosystem/ibc-bridging.md'] },
  { name: 'sei-migration', sources: ['references/migration/from-ethereum.md', 'references/migration/from-solana.md'] },
];

const PROMPT = (name, bar) => `You are flattening the canonical Sei skill source below into ONE self-contained Mintlify skill file for docs.sei.io.

Produce a single SKILL.md for the skill "${name}":
- YAML frontmatter: name (= "${name}"), description (a ">"-folded "Use when ..." trigger paragraph), license: MIT, compatibility, metadata { author: Sei, version, intended-host: docs.sei.io, domain }.
- Body <= ~5000 tokens. Dense and Sei-specific: "Critical facts", code, "Common pitfalls", and a "Key docs" table.
- Link to live https://docs.sei.io/... pages (NOT references/*.md). Keep every canonical constant (addresses, chain IDs, EIDs, gas values, governance proposal numbers) verbatim; never invent an address or proposal number.
- The file is MDX-parsed by the docs tooling: no HTML comments, and no bare "<", ">", "{", or "}" outside code spans/fences (write placeholders like \`<your-rpc>\` in backticks).
- Match or exceed the QUALITY BAR (the current docs skill) in correctness and concision. Do not reintroduce anything the source dropped (e.g. Axelar, LayerZero v1 API, native-oracle endorsement, overconfident Wormhole-EVM examples).

${bar ? '== QUALITY BAR (current docs skill — match this) ==\n' + bar + '\n' : ''}== CANONICAL SOURCE (flatten this) ==\n`;

const args = process.argv.slice(2);
const only = args.includes('--skill') ? args[args.indexOf('--skill') + 1] : null;
const write = args.includes('--write'); // also write generated SKILL.md into .mintlify/skills/<name>/
const SRC_REF = process.env.SEI_SKILL_REF || '';

// Stamp a GENERATED marker so the artifact is clearly machine-generated; the
// "Enforce generated-only agent skills" step in validate-docs.yml requires it,
// which is how "no hand-authored skill content in the docs" is kept true.
// The marker lives as YAML comments INSIDE the frontmatter: invisible to YAML/
// skill consumers, and — unlike an HTML comment in the body — safe for MDX
// parsers (mint / the Mintlify platform parse .md as MDX, where `<!-- -->` is
// a syntax error).
function stampGenerated(md) {
  const banner = `# GENERATED FROM sei-protocol/sei-skill${SRC_REF ? '@' + SRC_REF : ''} — DO NOT EDIT BY HAND.\n# Edit the source in sei-skill, then regenerate via scripts/build-mintlify-skills.mjs\n# (see .github/workflows/sync-skills.yml).\n`;
  if (md.startsWith('---\n')) return '---\n' + banner + md.slice(4);
  return `---\n${banner}---\n` + md;
}

mkdirSync(DIST, { recursive: true });

for (const m of MAP) {
  if (only && m.name !== only) continue;
  const present = m.sources.filter((s) => has(join(SKILL, s)));
  const missing = m.sources.filter((s) => !has(join(SKILL, s)));
  const bundle = present.map((s) => `\n\n<<< ${s} >>>\n` + R(join(SKILL, s))).join('\n');
  const barPath = join(DOCS_SKILLS, m.name, 'SKILL.md');
  const bar = has(barPath) ? R(barPath) : '';
  const outDir = join(DIST, m.name);
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'SOURCE_BUNDLE.md'), bundle);
  writeFileSync(join(outDir, 'PROMPT.md'), PROMPT(m.name, bar));
  console.log(`• ${m.name}: ${present.length} source(s)${missing.length ? `, ${missing.length} missing (${missing.join(', ')})` : ''}${bar ? ', quality-bar found' : ''}`);
}

if (process.env.ANTHROPIC_API_KEY) {
  console.log('\nANTHROPIC_API_KEY detected — generating SKILL.md per skill (review before copying)...');
  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const client = new Anthropic();
  for (const m of MAP) {
    if (only && m.name !== only) continue;
    const prompt = R(join(DIST, m.name, 'PROMPT.md')) + R(join(DIST, m.name, 'SOURCE_BUNDLE.md'));
    const msg = await client.messages.create({ model: 'claude-opus-4-8', max_tokens: 8000, messages: [{ role: 'user', content: prompt }] });
    const text = msg.content.map((b) => (b.type === 'text' ? b.text : '')).join('');
    const skillMd = stampGenerated(text.replace(/^```(markdown)?\n?/, '').replace(/\n?```$/, ''));
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
