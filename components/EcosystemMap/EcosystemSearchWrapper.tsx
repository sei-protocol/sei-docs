import { useSearch } from './SearchContext';

export default function EcosystemSearchWrapper() {
	const { searchTerm, setSearchTerm } = useSearch();

	return (
		<div className='my-4'>
			<input
				type='text'
				placeholder='Search all teams or categories...'
				value={searchTerm}
				onChange={(e) => setSearchTerm(e.target.value)}
				className='border p-2 rounded w-full 
                   border-gray-300 dark:border-gray-700
                   bg-white dark:bg-gray-900
                   text-gray-800 dark:text-gray-100
                   focus:outline-none focus:border-gray-400 
                   dark:focus:border-gray-500'
			/>
		</div>
	);
}
