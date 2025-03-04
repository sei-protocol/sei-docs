'use client';

import React, { useState } from 'react';
import VersionFetcher from './VersionFetcher';
import { Table } from '@radix-ui/themes';
import Link from 'next/link';

const VersionTable: React.FC = () => {
	const [mainnetVersion, setMainnetVersion] = useState('');
	const [testnetVersion, setTestnetVersion] = useState('');
	const [devnetVersion, setDevnetVersion] = useState('');

	return (
		<>
			<VersionFetcher chainId='pacific-1' rpcEndpoint='https://rpc.sei-apis.com' setVersion={setMainnetVersion} />
			<VersionFetcher chainId='atlantic-2' rpcEndpoint='https://rpc.atlantic-2.seinetwork.io' setVersion={setTestnetVersion} />
			<VersionFetcher chainId='arctic-1' rpcEndpoint='https://rpc-arctic-1.sei-apis.com' setVersion={setDevnetVersion} />

			<Table.Root size='3' variant='surface' className='mt-8'>
				<Table.Header>
					<Table.Row>
						<Table.ColumnHeaderCell>Network</Table.ColumnHeaderCell>
						<Table.ColumnHeaderCell>Version</Table.ColumnHeaderCell>
						<Table.ColumnHeaderCell>Chain ID</Table.ColumnHeaderCell>
						<Table.ColumnHeaderCell>Genesis URL</Table.ColumnHeaderCell>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					<Table.Row>
						<Table.RowHeaderCell>Mainnet</Table.RowHeaderCell>
						<Table.Cell>{mainnetVersion || 'Fetching...'}</Table.Cell>
						<Table.Cell>pacific-1</Table.Cell>
						<Table.Cell className='text-red-600 hover:underline'>
							<a href='https://raw.githubusercontent.com/sei-protocol/testnet/main/pacific-1/genesis.json'>Genesis</a>
						</Table.Cell>
					</Table.Row>
					<Table.Row>
						<Table.RowHeaderCell>Testnet</Table.RowHeaderCell>
						<Table.Cell>{testnetVersion || 'Fetching...'}</Table.Cell>
						<Table.Cell>atlantic-2</Table.Cell>
						<Table.Cell className='text-red-600 hover:underline'>
							<a href='https://raw.githubusercontent.com/sei-protocol/testnet/main/atlantic-2/genesis.json'>Genesis</a>
						</Table.Cell>
					</Table.Row>
					<Table.Row>
						<Table.RowHeaderCell>Devnet</Table.RowHeaderCell>
						<Table.Cell>{devnetVersion || 'Fetching...'}</Table.Cell>
						<Table.Cell>arctic-1</Table.Cell>
						<Table.Cell className='text-red-600 hover:underline'>
							<a href='https://raw.githubusercontent.com/sei-protocol/testnet/main/arctic-1/genesis.json'>Genesis</a>
						</Table.Cell>
					</Table.Row>
				</Table.Body>
			</Table.Root>
		</>
	);
};

export default VersionTable;
