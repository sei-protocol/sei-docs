'use client';

import React, { useState, useEffect } from 'react';
import VersionFetcher from './VersionFetcher';
import { CopyButton } from '../CopyButton';

interface VersionTableProps {
	showGenesis?: boolean;
}

const VersionTable: React.FC<VersionTableProps> = ({ showGenesis = true }) => {
	const [mainnetVersion, setMainnetVersion] = useState('');
	const [testnetVersion, setTestnetVersion] = useState('');

	useEffect(() => {
		console.log('showGenesis prop:', showGenesis);
	}, [showGenesis]);

	return (
		<>
			<VersionFetcher chainId='pacific-1' rpcEndpoint='https://rpc.sei-apis.com' setVersion={setMainnetVersion} />
			<VersionFetcher chainId='atlantic-2' rpcEndpoint='https://rpc.atlantic-2.seinetwork.io' setVersion={setTestnetVersion} />

			<table className='min-w-full divide-y divide-neutral-200 dark:divide-neutral-800'>
				<thead className='bg-neutral-50 dark:bg-neutral-900/50'>
					<tr>
						<th className='px-4 py-3 text-left text-sm font-medium text-neutral-900 dark:text-neutral-100'>Network</th>
						<th className='px-4 py-3 text-left text-sm font-medium text-neutral-900 dark:text-neutral-100'>Version</th>
						<th className='px-4 py-3 text-left text-sm font-medium text-neutral-900 dark:text-neutral-100'>Chain ID</th>
						{showGenesis && <th className='px-4 py-3 text-left text-sm font-medium text-neutral-900 dark:text-neutral-100'>Genesis File</th>}
					</tr>
				</thead>
				<tbody className='divide-y divide-neutral-200 dark:divide-neutral-800 bg-neutral-50 dark:bg-neutral-900/30'>
					<tr>
						<td className='px-4 py-3 text-sm font-medium text-neutral-900 dark:text-neutral-100'>Mainnet</td>
						<td className='px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400'>{mainnetVersion || 'Fetching...'}</td>
						<td className='px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400'>pacific-1</td>
						{showGenesis && (
							<td className='px-4 py-3 text-sm'>
								<div className='inline-flex items-center space-x-2'>
									<a
										href='https://raw.githubusercontent.com/sei-protocol/testnet/main/pacific-1/genesis.json'
										className='text-red-600 hover:text-red-800 dark:text-red-300 dark:hover:text-red-200 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 px-2 py-0.5 rounded'>
										Genesis
									</a>
									<CopyButton textToCopy='https://raw.githubusercontent.com/sei-protocol/testnet/main/pacific-1/genesis.json' />
								</div>
							</td>
						)}
					</tr>

					<tr>
						<td className='px-4 py-3 text-sm font-medium text-neutral-900 dark:text-neutral-100'>Testnet</td>
						<td className='px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400'>{testnetVersion || 'Fetching...'}</td>
						<td className='px-4 py-3 text-sm text-neutral-600 dark:text-neutral-400'>atlantic-2</td>
						{showGenesis && (
							<td className='px-4 py-3 text-sm'>
								<div className='inline-flex items-center space-x-2'>
									<a
										href='https://raw.githubusercontent.com/sei-protocol/testnet/main/atlantic-2/genesis.json'
										className='text-red-600 hover:text-red-800 dark:text-red-300 dark:hover:text-red-200 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 px-2 py-0.5 rounded'>
										Genesis
									</a>
									<CopyButton textToCopy='https://raw.githubusercontent.com/sei-protocol/testnet/main/atlantic-2/genesis.json' />
								</div>
							</td>
						)}
					</tr>
				</tbody>
			</table>
		</>
	);
};

export default VersionTable;
