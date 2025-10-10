'use client';

import { BundledLanguage } from './types';

type SyntaxHighlighterProps = {
	code: string;
	language: BundledLanguage;
};

// Lightweight renderer: rely on Nextra/rehypePrettyCode to style <pre><code>
// This avoids shipping a client component and third-party highlight libs.
export const SyntaxHighlighter = ({ code, language }: SyntaxHighlighterProps) => {
	return (
		<pre className='nx-pre'>
			<code className={`language-${language}`}>{code}</code>
		</pre>
	);
};
