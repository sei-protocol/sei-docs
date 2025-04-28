'use client';

import React, { useState } from 'react';
import VersionFetcher from './VersionFetcher';

const VersionTable: React.FC = () => {
	const [mainnetVersion, setMainnetVersion] = useState('');
	const [testnetVersion, setTestnetVersion] = useState('');
	const [devnetVersion, setDevnetVersion] = useState('');

	return (
		<>
			<VersionFetcher chainId='pacific-1' rpcEndpoint='https://rpc.sei-apis.com' setVersion={setMainnetVersion} />
			<VersionFetcher chainId='atlantic-2' rpcEndpoint='https://rpc.atlantic-2.seinetwork.io' setVersion={setTestnetVersion} />
			<VersionFetcher chainId='arctic-1' rpcEndpoint='https://rpc-arctic-1.sei-apis.com' setVersion={setDevnetVersion} />

			<table className='min-w-full divide-y divide-neutral-200 dark:divide-neutral-800'>
				<thead className='bg-neutral-50 dark:bg-neutral-900/50'>
					<tr>
						<th className='px-4 py-3 text-left text-sm font-medium text-neutral-900 dark:text-neutral-100'>Network</th>
						<th className='px-4 py-3 text-left text-sm font-medium text-neutral-900 dark:text-neutral-100'>Version</th>
						<th className='px-4 py-3 text-left text-sm font-medium text-neutral-900 dark:text-neutral-100'>Chain ID</th>
						<th className='px-4 py-3 text-left text-sm font-medium text-neutral-900 dark:text-neutral-100'>Genesis File</th>
					</tr>
				</thead>
				<tbody className='divide-y divide-neutral-200 dark:divide-neutral-800 bg-white dark:bg-neutral-900/30'>
					<tr>
						<td className='px-4 py-3 text-sm font-medium text-neutral-900 dark:text-neutral-100'>Mainnet</td>
						<td className='px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400'>{mainnetVersion || 'Fetching...'}</td>
						<td className='px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400'>pacific-1</td>
						<td className='px-4 py-3 text-sm'>
							<a
								href='https://raw.githubusercontent.com/sei-protocol/testnet/main/pacific-1/genesis.json'
								className='text-red-500 hover:text-red-600 dark:hover:text-red-400'>
								Get Genesis
							</a>
						</td>
					</tr>
					<tr>
						<td className='px-4 py-3 text-sm font-medium text-neutral-900 dark:text-neutral-100'>Testnet</td>
						<td className='px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400'>{testnetVersion || 'Fetching...'}</td>
						<td className='px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400'>atlantic-2</td>
						<td className='px-4 py-3 text-sm'>
							<a
								href='https://raw.githubusercontent.com/sei-protocol/testnet/main/atlantic-2/genesis.json'
								className='text-red-500 hover:text-red-600 dark:hover:text-red-400'>
								Get Genesis
							</a>
						</td>
					</tr>
					<tr>
						<td className='px-4 py-3 text-sm font-medium text-neutral-900 dark:text-neutral-100'>Devnet</td>
						<td className='px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400'>{devnetVersion || 'Fetching...'}</td>
						<td className='px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400'>arctic-1</td>
						<td className='px-4 py-3 text-sm'>
							<a
								href='https://raw.githubusercontent.com/sei-protocol/testnet/main/arctic-1/genesis.json'
								className='text-red-500 hover:text-red-600 dark:hover:text-red-400'>
								Get Genesis
							</a>
						</td>
					</tr>
				</tbody>
			</table>
		</>
	);
};

export default VersionTable;
