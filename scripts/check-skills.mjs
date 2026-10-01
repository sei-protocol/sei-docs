import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// .mintlify/skills/ is generated from sei-protocol/sei-skill by
// scripts/build-mintlify-skills.mjs, and the registry at /ai/skills must list
// exactly the skills that install.
const skillsDir = fileURLToPath(new URL('../.mintlify/skills/', import.meta.url));
const registryPath = fileURLToPath(new URL('../snippets/skills-registry.jsx', import.meta.url));

const dirs = (await readdir(skillsDir, { withFileTypes: true }).catch(() => []))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();
const failures = [];

if (!dirs.length) {
  failures.push(
    ".mintlify/skills/ has no skills, so the registry at /ai/skills would list skills that don't install"
  );
}

for (const dir of dirs) {
  const path = `.mintlify/skills/${dir}/SKILL.md`;
  const source = await readFile(`${skillsDir}${dir}/SKILL.md`, 'utf8').catch(() => null);
  if (source === null) {
    failures.push(`${path} is missing`);
    continue;
  }
  if (!source.includes('GENERATED FROM sei-protocol/sei-skill')) {
    failures.push(
      `${path}: missing the 'GENERATED FROM sei-protocol/sei-skill' marker. `
      + 'Edit the source in sei-skill and regenerate; do not hand-author skills here.'
    );
  }
  if (!new RegExp(`^name: ${dir}$`, 'm').test(source)) {
    failures.push(`${path}: frontmatter name must be '${dir}' to match its directory`);
  }

  // Agents copy these samples verbatim, so catch the regressions that can double-sign a
  // validator, leave it without a signer, report a reverted payment as sent, or build on
  // the deprecated x402 v1 packages.
  for (const [, code] of source.matchAll(/```[^\n]*\n([\s\S]*?)```/g)) {
    if (code.includes('unsafe-reset-all') && !/\bset -[a-z]*e/.test(code)) {
      failures.push(`${path}: a script that runs unsafe-reset-all must fail closed (set -euo pipefail)`);
    }
    if (/^\[priv-validator\]/m.test(code) && /^\s*(key-type|server-address)\s*=/m.test(code)) {
      failures.push(`${path}: [priv-validator] has no key-type or server-address; seid listens on laddr and the remote signer dials in`);
    }
    if (code.includes('@sei-js/x402')) {
      failures.push(`${path}: a sample uses a deprecated @sei-js/x402 package; use the upstream @x402 v2 packages (see ai/x402.mdx)`);
    }
    const waits = (code.match(/waitForTransactionReceipt\(/gi) || []).length;
    const statusChecks = (code.match(/\.status\b/g) || []).length;
    if (waits > statusChecks) {
      failures.push(`${path}: a sample waits for a receipt without checking its status (viem resolves reverted transactions too)`);
    }
  }
}

const registry = [...(await readFile(registryPath, 'utf8')).matchAll(/id: '([a-z0-9-]+)'/g)]
  .map((match) => match[1])
  .sort();
const withoutCard = dirs.filter((dir) => !registry.includes(dir));
const withoutSkill = registry.filter((id) => !dirs.includes(id));
if (withoutCard.length || withoutSkill.length) {
  failures.push(
    "snippets/skills-registry.jsx cards don't match .mintlify/skills/ "
    + `(skills without a card: ${withoutCard.join(', ') || 'none'}; `
    + `cards without a skill: ${withoutSkill.join(', ') || 'none'})`
  );
}

if (failures.length) {
  console.error('Agent skills are out of sync:\n');
  console.error(failures.map((failure) => `- ${failure}`).join('\n'));
  process.exit(1);
}

console.log(
  `Checked ${dirs.length} skills; each is generated from sei-skill, listed in the registry, `
  + 'and free of the known sample regressions.'
);
