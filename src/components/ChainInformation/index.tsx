'use client';

import { Flex, Table } from '@radix-ui/themes';
import React from 'react';
import { CopyButton } from '../CopyText';
import { addOrSwitchSeiNetwork, networks } from './config';
import { IconChevronRight } from '@tabler/icons-react';

type NetworkType = 'Cosmos' | 'EVM';

export const ChainInformation = ({ networkType }: { networkType: NetworkType }) => {
	return (
		<Table.Root size='3' variant='surface' className='mt-8'>
			<Table.Header>
				<Table.Row>
					<Table.ColumnHeaderCell>Network Type</Table.ColumnHeaderCell>
					<Table.ColumnHeaderCell>Chain Id</Table.ColumnHeaderCell>
					<Table.ColumnHeaderCell>RPC URL</Table.ColumnHeaderCell>
					<Table.ColumnHeaderCell className='text-nowrap'>Explorer URL</Table.ColumnHeaderCell>
				</Table.Row>
			</Table.Header>

			<React.Fragment key={networkType}>
				<Table.Header>
					<Table.Row>
						<Table.RowHeaderCell colSpan={4} className='p-4 text-xl font-bold text-left'>
							{networkType}
						</Table.RowHeaderCell>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{networks
						.filter((net) => net.type === networkType)
						.map((net) => (
							<Table.Row key={net.name}>
								<Table.RowHeaderCell>{net.name}</Table.RowHeaderCell>
								<Table.RowHeaderCell>
									<Flex direction='column' gap='2'>
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
							</Table.Row>
						))}
				</Table.Body>
			</React.Fragment>

			<Table.Body>
				<Table.Row>
					<Table.RowHeaderCell />
					<Table.RowHeaderCell />
					<Table.Cell>
						<a href={`/learn/rpc-providers`} className='text-[#9e1f19] !underline'>
							View more RPC providers
						</a>
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
};

export const AddSeiButton = () => {
	const onClick = async (e: React.MouseEvent) => {
		e.preventDefault();
		try {
			await addOrSwitchSeiNetwork();
			console.log('Sei Network added/switched!');
		} catch (err) {
			console.error('Failed to add/switch network:', err);
		}
	};

	return (
		<a
			href='#'
			onClick={onClick}
			className='flex items-center text-sm text-neutral-700 dark:text-neutral-300 hover:text-red-500 dark:hover:text-red-400 transition-colors'>
			<IconChevronRight className='h-3 w-3 mr-1' />
			<span>Add Sei EVM to MetaMask</span>
		</a>
	);
};
