import { useTheme } from 'nextra-theme-docs';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { atomOneDark, atomOneLight } from 'react-syntax-highlighter/dist/cjs/styles/hljs';

export const StyledSyntaxHighlighter = ({ language, children }: { language: string; children: string | string[] }) => {
	const { theme } = useTheme();

	return (
		<SyntaxHighlighter language={language} showLineNumbers wrapLines={true} style={theme === 'dark' ? atomOneDark : atomOneLight}>
			{children}
		</SyntaxHighlighter>
	);
};
