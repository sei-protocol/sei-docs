import { readdir, readFile } from 'node:fs/promises';
import { relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// This repository intentionally has no JavaScript dependency manifest. The
// dependency-free lexer below masks strings, comments, templates, and MDX code
// fences so CI can inspect rendered JSX without adding a parser dependency.
const repoDir = fileURLToPath(new URL('../', import.meta.url));
const snippetsDir = fileURLToPath(new URL('../snippets/', import.meta.url));
const ignoredDirectories = new Set([
  '.git',
  '.mintlify',
  '.next',
  '.vercel',
  'dist',
  'node_modules'
]);

const maskRange = (characters, start, end) => {
  for (let index = start; index < end; index += 1) {
    if (characters[index] !== '\n') characters[index] = ' ';
  }
};

const consumeQuotedString = (source, start, quote) => {
  let index = start + 1;
  while (index < source.length) {
    if (source[index] === '\\') {
      index += 2;
      continue;
    }
    if (source[index] === quote) return index + 1;
    index += 1;
  }
  return source.length;
};

const consumeLineComment = (source, start) => {
  const newline = source.indexOf('\n', start + 2);
  return newline === -1 ? source.length : newline;
};

const consumeBlockComment = (source, start) => {
  const close = source.indexOf('*/', start + 2);
  return close === -1 ? source.length : close + 2;
};

const consumeHtmlComment = (source, start) => {
  const close = source.indexOf('-->', start + 4);
  return close === -1 ? source.length : close + 3;
};

const consumeBracedJavaScript = (source, start) => {
  let depth = 1;
  let index = start + 1;

  while (index < source.length && depth > 0) {
    const character = source[index];
    const next = source[index + 1];

    if (character === "'" || character === '"') {
      index = consumeQuotedString(source, index, character);
    } else if (character === '`') {
      index = consumeTemplateLiteral(source, index);
    } else if (character === '/' && next === '/') {
      index = consumeLineComment(source, index);
    } else if (character === '/' && next === '*') {
      index = consumeBlockComment(source, index);
    } else {
      if (character === '{') depth += 1;
      if (character === '}') depth -= 1;
      index += 1;
    }
  }

  return index;
};

function consumeTemplateLiteral(source, start) {
  let index = start + 1;
  while (index < source.length) {
    if (source[index] === '\\') {
      index += 2;
      continue;
    }
    if (source[index] === '`') return index + 1;
    if (source[index] === '$' && source[index + 1] === '{') {
      index = consumeBracedJavaScript(source, index + 1);
      continue;
    }
    index += 1;
  }
  return source.length;
}

const structuralMask = (source) => {
  // split('') preserves UTF-16 indices, which keeps match locations aligned
  // with String#indexOf even when a page contains emoji or other astral text.
  const characters = source.split('');
  let index = 0;

  while (index < source.length) {
    const character = source[index];
    const next = source[index + 1];
    let end = index + 1;

    if (character === "'" || character === '"') {
      end = consumeQuotedString(source, index, character);
    } else if (character === '`') {
      end = consumeTemplateLiteral(source, index);
    } else if (character === '/' && next === '/') {
      end = consumeLineComment(source, index);
    } else if (character === '/' && next === '*') {
      end = consumeBlockComment(source, index);
    } else if (source.startsWith('<!--', index)) {
      end = consumeHtmlComment(source, index);
    } else {
      index += 1;
      continue;
    }

    maskRange(characters, index, end);
    index = end;
  }

  return characters.join('');
};

export const maskMdxCodeFences = (source) => {
  const lines = source.match(/[^\n]*\n|[^\n]+$/g) || [];
  let fence = null;

  return lines
    .map((line) => {
      const content = line.endsWith('\n') ? line.slice(0, -1) : line;

      if (!fence) {
        const opening = /^( {0,3})(`{3,}|~{3,})/.exec(content);
        if (!opening) return line;
        fence = { character: opening[2][0], length: opening[2].length };
      } else {
        const closing = new RegExp(
          `^ {0,3}\\${fence.character}{${fence.length},}\\s*$`
        );
        if (closing.test(content)) fence = null;
      }

      return line.replace(/[^\n]/g, ' ');
    })
    .join('');
};

const findMatchingForward = (source, start, open, close) => {
  let depth = 0;
  for (let index = start; index < source.length; index += 1) {
    if (source[index] === open) depth += 1;
    if (source[index] === close) {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return -1;
};

const findMatchingBackward = (source, start, open, close) => {
  let depth = 0;
  for (let index = start; index >= 0; index -= 1) {
    if (source[index] === close) depth += 1;
    if (source[index] === open) {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return -1;
};

const previousNonWhitespace = (source, start) => {
  let index = start;
  while (index >= 0 && /\s/.test(source[index])) index -= 1;
  return index;
};

const nextNonWhitespace = (source, start) => {
  let index = start;
  while (index < source.length && /\s/.test(source[index])) index += 1;
  return index;
};

const getComponentBodyEnd = (mask, bodyStart) => {
  if (mask[bodyStart] === '{') {
    return findMatchingForward(mask, bodyStart, '{', '}');
  }
  if (mask[bodyStart] === '(') {
    return findMatchingForward(mask, bodyStart, '(', ')');
  }

  // Support concise JSX arrows such as `const Icon = (props) => <svg />`.
  const semicolon = mask.indexOf(';', bodyStart);
  return semicolon === -1 ? mask.length : semicolon;
};

const findComponentRanges = (source, mask) => {
  const ranges = [];

  for (const arrow of mask.matchAll(/=>/g)) {
    const parameterEnd = previousNonWhitespace(mask, arrow.index - 1);
    if (mask[parameterEnd] !== ')') continue;

    const parameterStart = findMatchingBackward(mask, parameterEnd, '(', ')');
    if (parameterStart === -1) continue;

    const declaration = mask.slice(Math.max(0, parameterStart - 240), parameterStart);
    const nameMatch = /(?:export\s+)?const\s+([A-Z][$\w]*)\s*=\s*$/.exec(declaration);
    if (!nameMatch) continue;

    const bodyStart = nextNonWhitespace(mask, arrow.index + 2);
    const bodyEnd = getComponentBodyEnd(mask, bodyStart);
    if (bodyEnd === -1) continue;

    ranges.push({
      bodyStart,
      bodyEnd,
      parameters: source.slice(parameterStart + 1, parameterEnd)
    });
  }

  for (const declaration of mask.matchAll(/\bfunction\s+([A-Z][$\w]*)\s*\(/g)) {
    const parameterStart = declaration.index + declaration[0].lastIndexOf('(');
    const parameterEnd = findMatchingForward(mask, parameterStart, '(', ')');
    if (parameterEnd === -1) continue;

    const bodyStart = nextNonWhitespace(mask, parameterEnd + 1);
    if (mask[bodyStart] !== '{') continue;
    const bodyEnd = findMatchingForward(mask, bodyStart, '{', '}');
    if (bodyEnd === -1) continue;

    ranges.push({
      bodyStart,
      bodyEnd,
      parameters: source.slice(parameterStart + 1, parameterEnd)
    });
  }

  return ranges;
};

const splitTopLevelProperties = (source) => {
  const mask = structuralMask(source);
  const properties = [];
  let start = 0;
  let braces = 0;
  let brackets = 0;
  let parentheses = 0;

  for (let index = 0; index < mask.length; index += 1) {
    if (mask[index] === '{') braces += 1;
    if (mask[index] === '}') braces -= 1;
    if (mask[index] === '[') brackets += 1;
    if (mask[index] === ']') brackets -= 1;
    if (mask[index] === '(') parentheses += 1;
    if (mask[index] === ')') parentheses -= 1;

    if (
      mask[index] === ','
      && braces === 0
      && brackets === 0
      && parentheses === 0
    ) {
      properties.push(source.slice(start, index).trim());
      start = index + 1;
    }
  }

  properties.push(source.slice(start).trim());
  return properties;
};

const parametersBindClassName = (parameters) => {
  const trimmed = parameters.trim();
  if (!trimmed.startsWith('{')) return false;

  const mask = structuralMask(trimmed);
  const objectEnd = findMatchingForward(mask, 0, '{', '}');
  if (objectEnd === -1) return false;

  const remainder = trimmed.slice(objectEnd + 1).trim();
  if (remainder && !remainder.startsWith('=')) return false;

  const properties = splitTopLevelProperties(trimmed.slice(1, objectEnd));
  return properties.some((property) => (
    /^className\s*(?:=[\s\S]*)?$/.test(property)
    || /^className\s*:\s*className\s*(?:=[\s\S]*)?$/.test(property)
  ));
};

const isForwardedClassName = (position, componentRanges) => {
  const enclosing = componentRanges
    .filter((range) => position > range.bodyStart && position < range.bodyEnd)
    .sort(
      (left, right) =>
        (left.bodyEnd - left.bodyStart) - (right.bodyEnd - right.bodyStart)
    );

  return enclosing.length > 0 && parametersBindClassName(enclosing[0].parameters);
};

const isStaticStringLiteral = (expression) => (
  /^'(?:\\[\s\S]|[^'\\])*'$/.test(expression)
  || /^"(?:\\[\s\S]|[^"\\])*"$/.test(expression)
);

const isStaticTemplateLiteral = (expression) => {
  if (!expression.startsWith('`')) return false;

  let index = 1;
  while (index < expression.length) {
    if (expression[index] === '\\') {
      index += 2;
      continue;
    }
    if (expression[index] === '$' && expression[index + 1] === '{') return false;
    if (expression[index] === '`') return index === expression.length - 1;
    index += 1;
  }

  return false;
};

export const findUnsafeClassNames = (source, { mdx = false } = {}) => {
  const code = mdx ? maskMdxCodeFences(source) : source;
  const mask = structuralMask(code);
  const componentRanges = findComponentRanges(code, mask);
  const failures = [];

  for (const match of mask.matchAll(/\bclassName\b/g)) {
    let cursor = nextNonWhitespace(mask, match.index + match[0].length);
    if (mask[cursor] !== '=') continue;

    cursor = nextNonWhitespace(mask, cursor + 1);
    if (mask[cursor] !== '{') continue;

    const expressionEnd = findMatchingForward(mask, cursor, '{', '}');
    const line = source.slice(0, match.index).split('\n').length;

    if (expressionEnd === -1) {
      failures.push({ line, reason: 'className has an unclosed JSX expression' });
      continue;
    }

    const expression = code.slice(cursor + 1, expressionEnd).trim();
    const staticLiteral = isStaticStringLiteral(expression)
      || isStaticTemplateLiteral(expression);

    if (staticLiteral) continue;
    if (
      expression === 'className'
      && isForwardedClassName(match.index, componentRanges)
    ) {
      continue;
    }

    const reason = expression === 'className'
      ? "className={className} is only allowed when className is destructured in the enclosing component's parameters"
      : 'dynamic className expression is not extractor-safe; use literal branches, inline styles, or a semantic hook';
    failures.push({ line, reason });
  }

  return failures;
};

const collectFiles = async (directory, predicate) => {
  const files = [];
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const path = resolve(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...await collectFiles(path, predicate));
    } else if (predicate(entry.name)) {
      files.push(path);
    }
  }

  return files;
};

export const main = async () => {
  const snippetFiles = (await collectFiles(
    snippetsDir,
    (file) => file.endsWith('.jsx')
  )).sort();
  const mdxFiles = (await collectFiles(
    repoDir,
    (file) => file.endsWith('.mdx')
  )).sort();
  const failures = [];

  for (const path of [...snippetFiles, ...mdxFiles]) {
    const source = await readFile(path, 'utf8');
    const file = relative(repoDir, path);
    const unsafe = findUnsafeClassNames(source, { mdx: path.endsWith('.mdx') });
    failures.push(
      ...unsafe.map(({ line, reason }) => `${file}:${line} ${reason}`)
    );
  }

  if (failures.length) {
    console.error('Mintlify cannot reliably compile these className expressions:\n');
    console.error(failures.map((failure) => `- ${failure}`).join('\n'));
    process.exitCode = 1;
    return;
  }

  console.log(
    `Checked ${snippetFiles.length} JSX snippets and ${mdxFiles.length} MDX pages: className attributes are extractor-safe.`
  );
};

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : '';
if (import.meta.url === invokedPath) await main();
