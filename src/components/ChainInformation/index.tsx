'use client';

import { Flex, Table } from '@radix-ui/themes';
import React from 'react';
import { CopyButton } from '../CopyText';
import { addOrSwitchSeiNetwork, networks } from './config';
import { IconChevronRight } from '@tabler/icons-react';
import { NetworkEntry } from './types';

type NetworkType = 'Cosmos' | 'EVM';

export const ChainInformation = ({ networkType }: { networkType: NetworkType }) => (
	<Table.Root size='3' variant='surface' className='mt-8'>
		{/* top‑level header */}
		<Table.Header>
			<Table.Row>
				<Table.ColumnHeaderCell>Network Type</Table.ColumnHeaderCell>
				<Table.ColumnHeaderCell>Chain Id</Table.ColumnHeaderCell>
				<Table.ColumnHeaderCell>RPC URL</Table.ColumnHeaderCell>
				<Table.ColumnHeaderCell className='text-nowrap'>Explorer URL</Table.ColumnHeaderCell>
				<Table.ColumnHeaderCell className='text-nowrap'>MetaMask</Table.ColumnHeaderCell>
			</Table.Row>
		</Table.Header>

		{/* body */}
		<Table.Body>
			{networks
				.filter((net) => net.type === networkType)
				.map((net: NetworkEntry) => (
					<Table.Row key={net.name}>
						<Table.RowHeaderCell>{net.name}</Table.RowHeaderCell>

						<Table.RowHeaderCell>
							<Flex direction='column' className='gap-2'>
								<CopyButton value={net.chainId} />
								{net.hexChainId && <CopyButton value={net.hexChainId} />}
							</Flex>
						</Table.RowHeaderCell>

						<Table.Cell>
							<CopyButton copyDisabled={false} value={net.rpcUrl} />
						</Table.Cell>

						<Table.Cell>
							<Flex direction='column' className='gap-2'>
								{net.explorerLinks.map((explorer) => (
									<a key={explorer.name} href={explorer.url} target='_blank' className='!underline hover:!opacity-50'>
										{explorer.name}
									</a>
								))}
							</Flex>
						</Table.Cell>
						<Table.Cell>
							<Flex direction='column' className='gap-2'>
								{/* only for EVM rows */}
								{net.type === 'EVM' && net.chainParams && <AddSeiButton chainParams={net.chainParams} label={`Add Sei ${net.name} to MetaMask`} />}
							</Flex>
						</Table.Cell>
					</Table.Row>
				))}
		</Table.Body>

		<Table.Body>
			<Table.Row>
				<Table.RowHeaderCell />
				<Table.RowHeaderCell />
				<Table.Cell>
					<Flex direction='column' className='gap-2'>
						<a href='/learn/rpc-providers' className='text-[#9e1f19] !underline'>
							View more RPC providers
						</a>
					</Flex>
				</Table.Cell>
				<Table.Cell>
					<a href='/learn/explorers' className='text-[#9e1f19] !underline'>
						See more explorers
					</a>
				</Table.Cell>
			</Table.Row>
		</Table.Body>
	</Table.Root>
);

export const AddSeiInlineButton = (chainParams: any) => {
	const onClick = async (e: React.MouseEvent) => {
		e.preventDefault();
		try {
			await addOrSwitchSeiNetwork(chainParams);
			console.log('Sei network added/switched!');
		} catch (err) {
			console.error('Failed to add/switch network:', err);
		}
	};

	return (
		<a
			href='#'
			onClick={onClick}
			className='flex items-center text-sm text-neutral-700 dark:text-neutral-300
				   hover:text-red-500 dark:hover:text-red-400 transition-colors'>
			<IconChevronRight className='h-3 w-3 mr-1' />
			<span>{'Add Sei to Metamask'}</span>
		</a>
	);
};

export function AddSeiButton({ chainParams, label }: { chainParams: any; label: string }) {
	const onClick = async (e: React.MouseEvent) => {
		e.preventDefault();
		try {
			await addOrSwitchSeiNetwork(chainParams);
			console.info('Sei network added or switched.');
		} catch (err) {
			console.error('Failed to add/switch network', err);
		}
	};

	return (
		<button
			onClick={onClick}
			className='inline-flex items-center gap-1 rounded-full bg-neutral-700/50 px-2 py-1 text-xs font-medium text-neutral-200 transition-colors hover:bg-red-600/80 hover:text-white'>
			{label}
		</button>
	);
}
