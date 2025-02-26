'use client';

import { Flex, Link, Table } from '@radix-ui/themes';
import React from 'react';
import { CopyButton, CopyText } from '../CopyText';
import { networks } from './config';

export const ChainInformation = () => {
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

			{['EVM', 'Cosmos'].map((networkType) => (
				<React.Fragment key={networkType}>
					<Table.Header>
						<Table.Row className='flex p-4 !justify-start !items-start text-nowrap py-4 text-xl font-bold h-fit'>{networkType} Chains</Table.Row>
					</Table.Header>
					<Table.Body>
						{networks
							.filter((net) => net.type === networkType)
							.map((net) => (
								<Table.Row key={net.name}>
									<Table.RowHeaderCell>{net.name}</Table.RowHeaderCell>
									<Table.RowHeaderCell>
										<Flex direction='column' gap='1'>
											<CopyButton value={net.chainId} />
											{net.hexChainId && <CopyText label='(hex)' value={net.hexChainId} />}
										</Flex>
									</Table.RowHeaderCell>
									<Table.Cell>
										<CopyButton copyDisabled={false} value={net.rpcUrl} />
									</Table.Cell>
									<Table.Cell>
										<Flex direction='column' className='gap-2'>
											{net.explorerLinks.map((explorer) => (
												<Link key={explorer.name} href={explorer.url} target='_blank' className='!underline hover:!opacity-50'>
													{explorer.name}
												</Link>
											))}
										</Flex>
									</Table.Cell>
								</Table.Row>
							))}
					</Table.Body>
				</React.Fragment>
			))}

			<Table.Body>
				<Table.Row>
					<Table.RowHeaderCell />
					<Table.RowHeaderCell />
					<Table.Cell>
						<Link href={`/providers/rpc-providers`} className='!underline'>
							View more RPC providers
						</Link>
					</Table.Cell>
					<Table.Cell>
						<Link href='/providers/explorers' className='text-[#780000] underline'>
							See more explorers
						</Link>
					</Table.Cell>
				</Table.Row>
			</Table.Body>
		</Table.Root>
	);
};
