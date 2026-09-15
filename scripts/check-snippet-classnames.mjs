import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const snippetsDir = fileURLToPath(new URL('../snippets/', import.meta.url));
const files = (await readdir(snippetsDir)).filter((file) => file.endsWith('.jsx')).sort();
const failures = [];

for (const file of files) {
  const source = await readFile(`${snippetsDir}/${file}`, 'utf8');
  // Remove documentation comments so examples of forbidden syntax do not
  // trigger the check. URLs in strings remain intact because only whole-line
  // comments are removed here.
  const code = source
    .replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, ' '))
    .replace(/^\s*\/\/.*$/gm, '');

  for (const match of code.matchAll(/className\s*=\s*\{([\s\S]*?)\}/g)) {
    const expression = match[1].trim();
    const line = code.slice(0, match.index).split('\n').length;
    const forwardedProp = /^[A-Za-z_$][\w$]*$/.test(expression)
      && !new RegExp(`\\b(?:const|let|var)\\s+${expression}\\s*=`).test(code);

    if (forwardedProp) continue;

    failures.push(
      `${file}:${line} className must be a literal attribute; use explicit JSX, inline styles, or a semantic hook`
    );
  }
}

if (failures.length) {
  console.error('Mintlify cannot reliably compile these dynamic snippet class names:\n');
  console.error(failures.map((failure) => `- ${failure}`).join('\n'));
  process.exit(1);
}

console.log(`Checked ${files.length} JSX snippets: className attributes are extractor-safe.`);
