'use client';

import { IconCheck, IconCopy } from '@tabler/icons-react';
import { useState } from 'react';

interface CopyButtonProps {
	textToCopy: string;
}

export const CopyButton = ({ textToCopy }: CopyButtonProps) => {
	const [copied, setCopied] = useState(false);

	const handleCopy = () => {
		navigator.clipboard.writeText(textToCopy);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<button
			onClick={handleCopy}
			className='p-1 rounded-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50 transition-colors'
			title='Copy to clipboard'
			aria-label='Copy to clipboard'>
			{copied ? <IconCheck className='h-4 w-4 text-green-500' /> : <IconCopy className='h-4 w-4' />}
		</button>
	);
};
