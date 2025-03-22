'use client';

import React, { useState } from 'react';
import { IconSearch, IconArrowRight, IconArrowsExchange } from '@tabler/icons-react';

type Explorer = 'seitrace' | 'seiscan';

export const CompactExplorerSearch = () => {
	const [address, setAddress] = useState('');
	const [error, setError] = useState('');
	const [selectedExplorer, setSelectedExplorer] = useState<Explorer>('seitrace');

	const isValidAddress = (addr: string) => {
		const seiPattern = /^sei[a-z0-9]{8,}$/i;
		const evmPattern = /^0x[a-fA-F0-9]{40}$/;
		return seiPattern.test(addr) || evmPattern.test(addr);
	};

	const getExplorerUrl = (addr: string) => {
		const chainParam = '?chain=pacific-1';
		return selectedExplorer === 'seitrace' ? `https://seitrace.com/address/${addr}${chainParam}` : `https://www.seiscan.app/address/${addr}${chainParam}`;
	};

	const toggleExplorer = () => {
		setSelectedExplorer(selectedExplorer === 'seitrace' ? 'seiscan' : 'seitrace');
		setError('');
	};

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		const trimmedAddress = address.trim();

		if (!trimmedAddress) {
			setError('Please enter an address');
			return;
		}

		if (!isValidAddress(trimmedAddress)) {
			setError('Invalid Sei or EVM address');
			return;
		}

		window.open(getExplorerUrl(trimmedAddress), '_blank');
		setError('');
	};

	return (
		<div className='my-6 relative'>
			<div className='flex items-center mb-3'>
				<div className='flex-1 flex items-center'>
					<IconSearch className='w-4 h-4 text-neutral-500 dark:text-neutral-400 mr-2' />
					<span className='text-sm font-medium text-neutral-700 dark:text-neutral-300'>Search the blockchain</span>
				</div>

				<div className='flex items-center gap-3 text-xs'>
					<button
						onClick={() => setSelectedExplorer('seitrace')}
						className={`px-2 py-0.5 rounded-full transition-colors ${
							selectedExplorer === 'seitrace'
								? 'bg-red-9/10 text-red-9 dark:bg-red-7/20 dark:text-red-7 font-medium'
								: 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
						}`}>
						SeiTrace
					</button>

					<span className='text-neutral-300 dark:text-neutral-600'>|</span>

					<button
						onClick={() => setSelectedExplorer('seiscan')}
						className={`px-2 py-0.5 rounded-full transition-colors ${
							selectedExplorer === 'seiscan'
								? 'bg-red-9/10 text-red-9 dark:bg-red-7/20 dark:text-red-7 font-medium'
								: 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300'
						}`}>
						SeiScan
					</button>
				</div>
			</div>

			<form onSubmit={handleSearch} className='relative'>
				<div className='relative'>
					<input
						type='text'
						placeholder={`Enter Sei or EVM address to search ${selectedExplorer === 'seitrace' ? 'SeiTrace' : 'SeiScan'}`}
						value={address}
						onChange={(e) => {
							setAddress(e.target.value);
							if (error) setError('');
						}}
						className={`w-full py-2.5 pl-3 pr-12 rounded-md border ${
							error
								? 'border-red-9/50 dark:border-red-7/50 focus:ring-red-9/30 dark:focus:ring-red-7/30'
								: 'border-neutral-200 dark:border-neutral-800 focus:ring-neutral-300 dark:focus:ring-neutral-700'
						} bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 transition-all`}
					/>
					<button
						type='submit'
						className='absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-md bg-red-9 dark:bg-red-7 text-white hover:bg-red-10 dark:hover:bg-red-8 transition-colors'>
						<IconArrowRight className='w-4 h-4' />
					</button>
				</div>

				{error && (
					<div className='absolute left-0 -bottom-6 text-xs text-red-9 dark:text-red-7 flex items-center'>
						<span className='inline-block w-1 h-1 rounded-full bg-red-9 dark:bg-red-7 mr-1.5'></span>
						{error}
					</div>
				)}
			</form>
		</div>
	);
};

export default CompactExplorerSearch;
