'use client';

import React, { useState } from 'react';
import VersionFetcher from './VersionFetcher';

const VersionTable: React.FC = () => {
	const [mainnetVersion, setMainnetVersion] = useState('');
	const [testnetVersion, setTestnetVersion] = useState('');

	return (
		<>
			<VersionFetcher chainId='pacific-1' rpcEndpoint='https://rpc.sei-apis.com' setVersion={setMainnetVersion} />
			<VersionFetcher chainId='atlantic-2' rpcEndpoint='https://rpc-testnet.sei-apis.com/' setVersion={setTestnetVersion} />

			<table className='min-w-full divide-y divide-neutral-200 dark:divide-neutral-800'>
				<thead className='bg-neutral-50 dark:bg-neutral-900/50'>
					<tr>
						<th className='px-4 py-3 text-left text-sm font-medium text-neutral-900 dark:text-neutral-100'>Network</th>
						<th className='px-4 py-3 text-left text-sm font-medium text-neutral-900 dark:text-neutral-100'>Version</th>
						<th className='px-4 py-3 text-left text-sm font-medium text-neutral-900 dark:text-neutral-100'>Chain ID</th>
						<th className='px-4 py-3 text-left text-sm font-medium text-neutral-900 dark:text-neutral-100'>EVM Chain ID</th>
					</tr>
				</thead>
				<tbody className='divide-y divide-neutral-200 dark:divide-neutral-800 bg-neutral-50 dark:bg-neutral-900/30'>
					<tr>
						<td className='px-4 py-3 text-sm font-medium text-neutral-900 dark:text-neutral-100'>Mainnet</td>
						<td className='px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400'>{mainnetVersion || 'Fetching...'}</td>
						<td className='px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400'>pacific-1</td>
						<td className='px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400'>1329</td>
					</tr>

					<tr>
						<td className='px-4 py-3 text-sm font-medium text-neutral-900 dark:text-neutral-100'>Testnet</td>
						<td className='px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400'>{testnetVersion || 'Fetching...'}</td>
						<td className='px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400'>atlantic-2</td>
						<td className='px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400'>1328</td>
					</tr>
				</tbody>
			</table>
		</>
	);
};

export default VersionTable;
