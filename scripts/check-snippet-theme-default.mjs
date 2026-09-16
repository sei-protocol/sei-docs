import { readdir, readFile } from 'node:fs/promises';
import { relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoDir = fileURLToPath(new URL('../', import.meta.url));
const snippetsDir = fileURLToPath(new URL('../snippets/', import.meta.url));
const docsConfigPath = fileURLToPath(new URL('../docs.json', import.meta.url));
const themeSeedFiles = new Set([
  'changelog.jsx',
  'ecosystem-app-grid.jsx',
  'ecosystem-contracts.jsx',
  'rpc-methods-viewer.jsx',
  'sandbox-embed.jsx',
  'sip-index.jsx',
  'sstore-gas-live.jsx'
]);

// Theme-aware snippets need a deterministic server/hydration seed. Keep the
// runtime literals local because Mintlify evaluates each snippet in isolation,
// and use this check as the single link to docs.json → appearance.default.
const docsConfig = JSON.parse(await readFile(docsConfigPath, 'utf8'));
const defaultAppearance = docsConfig.appearance?.default;

if (!['dark', 'light'].includes(defaultAppearance)) {
  console.error(
    `docs.json appearance.default is ${JSON.stringify(defaultAppearance)}; `
    + 'theme-aware snippets require an explicit dark or light hydration seed.'
  );
  process.exit(1);
}

const files = (await readdir(snippetsDir))
  .filter((file) => file.endsWith('.jsx'))
  .sort();
const failures = [];
let checkedSeeds = 0;

for (const file of files) {
  const path = `${snippetsDir}/${file}`;
  const source = await readFile(path, 'utf8');
  const relativePath = relative(repoDir, path);
  const seeds = [
    ...source.matchAll(
      /const\s*\[\s*isDark\s*,\s*([A-Za-z_$][\w$]*)\s*\]\s*=\s*useState\(\s*(true|false)\s*\)/g
    )
  ].map((match) => ({
    index: match.index,
    setter: match[1],
    actual: match[2],
    expected: defaultAppearance === 'dark' ? 'true' : 'false'
  }));

  seeds.push(
    ...[...source.matchAll(
      /const\s*\[\s*theme\s*,\s*([A-Za-z_$][\w$]*)\s*\]\s*=\s*useState\(\s*(['"])(dark|light)\2\s*\)/g
    )].map((match) => ({
      index: match.index,
      setter: match[1],
      actual: match[3],
      expected: defaultAppearance
    }))
  );

  if (themeSeedFiles.has(file) && seeds.length !== 1) {
    failures.push(
      `${relativePath}: expected exactly one registered theme seed, found ${seeds.length}`
    );
  }

  for (const seed of seeds) {
    checkedSeeds += 1;
    const line = source.slice(0, seed.index).split('\n').length;

    if (seed.actual !== seed.expected) {
      failures.push(
        `${relativePath}:${line} initial theme ${seed.actual} does not match `
        + `docs.json appearance.default (${defaultAppearance})`
      );
    }

    const escapedSetter = seed.setter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const layoutSync = new RegExp(
      `useLayoutEffect\\s*\\([\\s\\S]*?\\b${escapedSetter}\\s*\\(`
    );
    if (!layoutSync.test(source.slice(seed.index))) {
      failures.push(
        `${relativePath}:${line} synchronize ${seed.setter} in useLayoutEffect `
        + 'so the saved theme is applied before paint'
      );
    }
  }
}

for (const file of themeSeedFiles) {
  if (!files.includes(file)) {
    failures.push(`snippets/${file}: registered theme-aware snippet is missing`);
  }
}

if (failures.length) {
  console.error('Theme-aware snippet defaults are out of sync:\n');
  console.error(failures.map((failure) => `- ${failure}`).join('\n'));
  process.exit(1);
}

console.log(
  `Checked ${checkedSeeds} theme seeds against docs.json appearance.default `
  + `(${defaultAppearance}); each synchronizes before paint.`
);
