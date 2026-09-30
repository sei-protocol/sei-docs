import { readdir, readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const repoDir = fileURLToPath(new URL('../', import.meta.url));
const docsConfigPath = fileURLToPath(new URL('../docs.json', import.meta.url));
const { redirects = [] } = JSON.parse(await readFile(docsConfigPath, 'utf8'));

// Match each path segment against its directory listing rather than trusting
// stat alone, so a case-insensitive filesystem (macOS) rejects the same paths
// as the Linux runner and Mintlify's case-sensitive URLs.
const listings = new Map();
const exists = async (path) => {
  let dir = '';
  for (const name of path.split('/')) {
    if (!listings.has(dir)) {
      listings.set(dir, new Set(await readdir(`${repoDir}${dir}`).catch(() => [])));
    }
    if (!listings.get(dir).has(name)) return false;
    dir = dir ? `${dir}/${name}` : name;
  }
  return true;
};
const isFile = async (path) =>
  (await exists(path)) && (await stat(`${repoDir}${path}`)).isFile();
const isDirectory = async (path) =>
  !path || ((await exists(path)) && (await stat(`${repoDir}${path}`)).isDirectory());

const sources = new Set(redirects.map(({ source }) => source));
const failures = [];
let checked = 0;

for (const { source, destination } of redirects) {
  if (/^(https?:)?\/\//.test(destination)) continue;
  checked += 1;

  const path = destination.split(/[?#]/)[0].replace(/^\/+|\/+$/g, '');
  const segments = path ? path.split('/') : [];
  const dynamic = segments.findIndex(
    (segment) => segment.startsWith(':') || segment.includes('*')
  );

  // A parameterized destination forwards whatever the source matched, so only
  // its static prefix can be checked.
  if (dynamic !== -1) {
    const prefix = segments.slice(0, dynamic).join('/');
    if (!(await isDirectory(prefix))) {
      failures.push(`${source} -> ${destination}: no directory /${prefix} to forward into`);
    }
    continue;
  }

  const candidates = path
    ? [path, `${path}.mdx`, `${path}.md`, `${path}/index.mdx`, `${path}/index.md`]
    : ['index.mdx', 'index.md'];
  if ((await Promise.all(candidates.map(isFile))).some(Boolean)) continue;

  const target = `/${path}`;
  failures.push(
    sources.has(target)
      ? `${source} -> ${destination}: ${target} is itself a redirect; point at its destination instead`
      : `${source} -> ${destination}: no page at ${target}`
  );
}

if (failures.length) {
  console.error('Redirects that point at a page that does not exist:\n');
  console.error(failures.map((failure) => `- ${failure}`).join('\n'));
  process.exit(1);
}

console.log(`Checked ${checked} redirect destinations; each resolves to a page in this repo.`);
