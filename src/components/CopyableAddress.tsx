'use client';

import { useState } from 'react';

export function CopyableAddress({ address }: { address: string }) {
	const [copied, setCopied] = useState(false);

	const handleCopy = () => {
		navigator.clipboard.writeText(address);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<button onClick={handleCopy} className='group flex items-center gap-2 transition hover:text-blue-600 dark:hover:text-blue-400'>
			<code className='text-xs'>{address}</code>
			{copied ? (
				<svg className='h-3.5 w-3.5 text-green-600 dark:text-green-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
					<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
				</svg>
			) : (
				<svg
					className='h-3.5 w-3.5 text-neutral-400 opacity-0 transition group-hover:opacity-100 dark:text-neutral-500'
					fill='none'
					viewBox='0 0 24 24'
					stroke='currentColor'>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						strokeWidth={2}
						d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z'
					/>
				</svg>
			)}
		</button>
	);
}
