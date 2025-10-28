'use client';

import { Code } from '@radix-ui/themes';
import { useState } from 'react';
import { IconCheck, IconCopy } from '@tabler/icons-react';

export const CopyButton = ({ value, copyDisabled = false }: { value: string; copyDisabled?: boolean }) => {
	const [copied, setCopied] = useState(false);

	const copyToClipboard = async () => {
		if (copyDisabled) return;

		await navigator.clipboard.writeText(value);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
	};

	return (
		<>
			<div onClick={copyToClipboard} className='cursor-pointer flex items-center gap-2 font-bold'>
				<Code color='gray' variant='soft' size='3' className='text-nowrap'>
					{value}
				</Code>
				{!copyDisabled ? (
					<button
						onClick={copyToClipboard}
						className='p-1 rounded-md text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50 transition-colors'
						title='Copy to clipboard'
						aria-label='Copy to clipboard'>
						{copied ? <IconCheck className='h-4 w-4 text-green-500' /> : <IconCopy className='h-4 w-4' />}
					</button>
				) : null}
			</div>
		</>
	);
};

type CopyTextProps = {
	label: string;
	value: string;
	copyDisabled?: boolean;
	column?: boolean;
};

export const CopyText = ({ label, value, copyDisabled = false, column = false }: CopyTextProps) => {
	return (
		<div className={`flex flex-row gap-2 items-center ${column && '!flex-col !items-start'}`}>
			<p className='text-neutral-400'>{label}</p>
			<CopyButton value={value} copyDisabled={copyDisabled} />
		</div>
	);
};
