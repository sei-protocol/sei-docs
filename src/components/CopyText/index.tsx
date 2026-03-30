'use client';

import { useState } from 'react';

const CheckIcon = ({ className }: { className?: string }) => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		width='24'
		height='24'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
		className={className}>
		<path d='M5 12l5 5l10 -10' />
	</svg>
);

const CopyIcon = ({ className }: { className?: string }) => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		width='24'
		height='24'
		viewBox='0 0 24 24'
		fill='none'
		stroke='currentColor'
		strokeWidth='2'
		strokeLinecap='round'
		strokeLinejoin='round'
		className={className}>
		<path d='M7 7m0 2.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z' />
		<path d='M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1' />
	</svg>
);

export const CopyButton = ({ value, copyDisabled = false }: { value: string; copyDisabled?: boolean }) => {
	const [copied, setCopied] = useState(false);

	const copyToClipboard = async () => {
		if (copyDisabled) return;

		await navigator.clipboard.writeText(value);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<div onClick={copyToClipboard} className='cursor-pointer flex items-center gap-2 font-bold'>
			<code className='px-2 py-1 text-sm bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded'>{value}</code>
			{!copyDisabled ? (
				<button
					type='button'
					onClick={copyToClipboard}
					className='p-1  text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50 transition-colors'
					title='Copy to clipboard'
					aria-label='Copy to clipboard'>
					{copied ? <CheckIcon className='h-4 w-4 text-green-500' /> : <CopyIcon className='h-4 w-4' />}
				</button>
			) : null}
		</div>
	);
};
