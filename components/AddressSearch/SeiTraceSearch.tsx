import React, { useState } from 'react';

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

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const trimmedAddress = address.trim();
		if (trimmedAddress) {
			if (isValidAddress(trimmedAddress)) {
				const url = getSeiTraceUrl(trimmedAddress);
				window.open(url, '_blank');
				setError('');
			} else {
				setError('Please enter a valid Sei or EVM address.');
			}
		}
	};

	return (
		<form onSubmit={handleSubmit} className='mt-4'>
			<div className='flex mt-2'>
				<input
					id='addressInput'
					type='text'
					placeholder='Enter address'
					value={address}
					onChange={(e) => setAddress(e.target.value)}
					className={`
            flex-1
            py-3
            px-4
            text-base
            rounded-l-full
            bg-[#1a1a1a]
            text-white
            outline-none
            transition-colors
            placeholder:text-[#666]
            focus:outline-none
            ${error ? 'bg-[#2a1a1a] shadow-[inset_0_0_0_2px_#e74c3c]' : 'shadow-[inset_0_0_0_2px_#333]'}
          `}
				/>
				<button
					type='submit'
					className='
            py-3
            px-6
            text-base
            rounded-r-full
            bg-[#1a1a1a]
            text-white
            cursor-pointer
            transition-colors
            shadow-[inset_0_0_0_2px_#333]
            hover:bg-[#333]
            outline-none
            focus:outline-none
          '>
					View on SEITRACE
				</button>
			</div>
			{error && <div className='text-[#e74c3c] mt-2 text-sm'>{error}</div>}
		</form>
	);
};

export default SeiTraceSearch;
