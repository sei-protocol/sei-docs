'use client';

import React, { useState } from 'react';
import { Button, Flex } from '@radix-ui/themes';
import { ExternalLinkIcon } from '@radix-ui/react-icons';

const SeiTraceSearch = () => {
	const [address, setAddress] = useState('');
	const [error, setError] = useState('');

	const isValidAddress = (addr: string) => {
		const seiPattern = /^sei[a-z0-9]{8,}$/i;
		const evmPattern = /^0x[a-fA-F0-9]{40}$/;
		return seiPattern.test(addr) || evmPattern.test(addr);
	};

	const getSeiTraceUrl = (addr: string) => {
		const chainParam = '?chain=pacific-1';
		return `https://seitrace.com/address/${addr}${chainParam}`;
	};

	const handleSearch = () => {
		const trimmedAddress = address.trim();
		if (!trimmedAddress) {
			setError('Please enter an address.');
			return;
		}
		if (!isValidAddress(trimmedAddress)) {
			setError('Invalid Sei or EVM address.');
			return;
		}

		window.open(getSeiTraceUrl(trimmedAddress), '_blank');
		setError('');
	};

	return (
		<div className='w-full max-w-2xl border border-muted bg-card rounded-full px-4 py-2 flex items-center gap-3 mt-8 mb-2'>
			<input
				id='addressInput'
				type='text'
				placeholder='Search SeiTrace (Sei / EVM Address)'
				value={address}
				onChange={(e) => setAddress(e.target.value)}
				className='w-full bg-transparent outline-none text-foreground'
			/>

			<Button variant='soft' className='px-4 flex items-center gap-2 rounded-full' onClick={handleSearch}>
				Search <ExternalLinkIcon className='w-4 h-4' />
			</Button>

			{error && <p className='text-red-500 text-sm mt-2 absolute'>{error}</p>}
		</div>
	);
};

export default SeiTraceSearch;
