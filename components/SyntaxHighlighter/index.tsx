'use client';

import CodeBlock from 'shiki-code-block-react';
import { BundledLanguage } from './types';
import { useTheme } from 'next-themes';

type SyntaxHighlighterProps = {
	code: string;
	language: BundledLanguage;
};

export const SyntaxHighlighter = ({ code, language }) => {
	const { theme } = useTheme();

	return (
		<CodeBlock
			lang={language}
			theme={{
				light: 'github-light-default',
				dark: theme === 'dark' ? 'github-dark-default' : 'github-light-default'
			}}
			code={code}
		/>
	);
};
