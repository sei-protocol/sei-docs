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

			<div className='overflow-x-auto'>
				<table className='w-full border border-gray-700 rounded-lg shadow-lg'>
					<thead className='bg-gray-900 text-white uppercase tracking-wide'>
						<tr>
							<th className='px-6 py-3 text-left'>Network</th>
							<th className='px-6 py-3 text-left'>Version</th>
							<th className='px-6 py-3 text-left'>Chain ID</th>
							<th className='px-6 py-3 text-left'>Genesis URL</th>
						</tr>
					</thead>
					<tbody className='bg-gray-800 text-gray-300'>
						<tr className='border-b border-gray-700 hover:bg-gray-700'>
							<td className='px-6 py-4'>Mainnet</td>
							<td className='px-6 py-4'>{mainnetVersion}</td>
							<td className='px-6 py-4'>pacific-1</td>
							<td className='px-6 py-4'>
								<a href='https://raw.githubusercontent.com/sei-protocol/testnet/main/pacific-1/genesis.json' className='text-blue-400 hover:underline'>
									Genesis
								</a>
							</td>
						</tr>
						<tr className='border-b border-gray-700 hover:bg-gray-700'>
							<td className='px-6 py-4'>Testnet</td>
							<td className='px-6 py-4'>{testnetVersion}</td>
							<td className='px-6 py-4'>atlantic-2</td>
							<td className='px-6 py-4'>
								<a href='https://raw.githubusercontent.com/sei-protocol/testnet/main/atlantic-2/genesis.json' className='text-blue-400 hover:underline'>
									Genesis
								</a>
							</td>
						</tr>
						<tr className='hover:bg-gray-700'>
							<td className='px-6 py-4'>Devnet</td>
							<td className='px-6 py-4'>{devnetVersion}</td>
							<td className='px-6 py-4'>arctic-1</td>
							<td className='px-6 py-4'>
								<a href='https://raw.githubusercontent.com/sei-protocol/testnet/main/arctic-1/genesis.json' className='text-blue-400 hover:underline'>
									Genesis
								</a>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</>
	);
};

export default VersionTable;
