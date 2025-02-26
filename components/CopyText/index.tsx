'use client';

import { Code } from '@radix-ui/themes';
import { CopyIcon, CheckIcon } from '@radix-ui/react-icons';
import { useState } from 'react';

export const CopyButton = ({ value, copyDisabled = false }: { value: string; copyDisabled?: boolean }) => {
	const [copied, setCopied] = useState(false);

	const copyToClipboard = async () => {
		if (copyDisabled) return;

		await navigator.clipboard.writeText(value);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
	};

	return (
		<div onClick={copyToClipboard} className='cursor-pointer flex items-center gap-2 font-bold'>
			<Code color='gray' variant='soft' size='4' className='text-nowrap'>
				{value}
			</Code>
			{!copyDisabled ? (
				<div className='flex justify-center items-center hover:opacity-75 min-w-5 w-5 min-h-5 h-5'>
					{copied ? <CheckIcon width={40} height={40} color='green' /> : <CopyIcon width={40} height={40} color='grey' />}
				</div>
			) : null}
		</div>
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
