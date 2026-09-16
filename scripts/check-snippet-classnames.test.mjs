import assert from 'node:assert/strict';
import test from 'node:test';

import { findUnsafeClassNames } from './check-snippet-classnames.mjs';

test('allows quoted JSX attributes and static brace literals', () => {
  const source = [
    'const One = () => <div className="a b" />;',
    "const Two = () => <div className={'a b'} />;",
    'const Three = () => <div className={`a b`} />;'
  ].join('\n');

  assert.deepEqual(findUnsafeClassNames(source), []);
});

test('allows className forwarded from the enclosing component props', () => {
  const source = `
    const Icon = ({ className = '' }) => (
      <svg className={className} />
    );
    const Badge = ({ className }) => <span
      className={className}
    />;
  `;

  assert.deepEqual(findUnsafeClassNames(source), []);
});

test('rejects arbitrary identifiers regardless of how they are declared', () => {
  const source = `
    const STYLES = { wrapper: 'p-4' };
    const { wrapper } = STYLES;
    const Card = (props, cls$) => (
      <div className={wrapper}>
        <span className={cls$} />
      </div>
    );
  `;

  assert.equal(findUnsafeClassNames(source).length, 2);
});

test('rejects className that is not a destructured component prop', () => {
  const positional = `
    const Icon = (className) => (
      <svg className={className} />
    );
  `;
  const bodyDestructuring = `
    const Icon = (props) => {
      const { className } = props;
      return <svg className={className} />;
    };
  `;
  const renamedProperty = `
    const Icon = ({ iconClass: className }) => (
      <svg className={className} />
    );
  `;

  assert.equal(findUnsafeClassNames(positional).length, 1);
  assert.equal(findUnsafeClassNames(bodyDestructuring).length, 1);
  assert.equal(findUnsafeClassNames(renamedProperty).length, 1);
});

test('uses the innermost enclosing component parameters', () => {
  const source = `
    const Parent = ({ className }) => {
      const Child = ({ label }) => (
        <span className={className}>{label}</span>
      );
      return <Child label="Example" />;
    };
  `;

  assert.equal(findUnsafeClassNames(source).length, 1);
});

test('rejects conditional and interpolated class lists', () => {
  const source = `
    const Card = ({ active, tone }) => (
      <div className={active ? 'active' : ''}>
        <span className={\`text-\${tone}\`} />
      </div>
    );
  `;

  assert.equal(findUnsafeClassNames(source).length, 2);
});

test('ignores comments and fenced MDX examples', () => {
  const source = `
<!-- className={fromHtmlComment} -->
{/* className={fromJsxComment} */}

\`\`\`jsx
const Example = ({ active }) => <div className={active ? 'on' : 'off'} />;
\`\`\`

<div className="rendered" />
  `;

  assert.deepEqual(findUnsafeClassNames(source, { mdx: true }), []);
});

test('checks rendered JSX in MDX outside code fences', () => {
  const source = `
\`\`\`jsx
<div className={exampleOnly} />
\`\`\`

😀
<Card className={dynamicClasses} />
  `;

  const failures = findUnsafeClassNames(source, { mdx: true });
  assert.equal(failures.length, 1);
  assert.equal(failures[0].line, 7);
});
