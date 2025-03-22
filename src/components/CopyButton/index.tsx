'use client';

import { IconCopy } from '@tabler/icons-react';
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
			className='text-neutral-500 hover:text-red-9 dark:hover:text-red-7 transition-colors focus:outline-none'
			onClick={handleCopy}
			title='Copy to clipboard'
			aria-label='Copy to clipboard'>
			<IconCopy className={`w-4 h-4 ${copied ? 'text-green-500' : ''}`} />
		</button>
	);
};
