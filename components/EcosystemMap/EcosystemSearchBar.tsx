import React from 'react';

interface EcosystemSearchBarProps {
	searchTerm: string;
	setSearchTerm: (val: string) => void;
}

export default function EcosystemSearchBar({ searchTerm, setSearchTerm }: EcosystemSearchBarProps) {
	return (
		<input
			type='search'
			placeholder='Search for apps...'
			value={searchTerm}
			onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
			className='w-full px-4 py-2 bg-gray-900 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500'
		/>
	);
}
