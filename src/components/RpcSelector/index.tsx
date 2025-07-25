'use client';

import React, { useState } from 'react';
import { IconExternalLink, IconCopy, IconCheck, IconArrowRight, IconSearch, IconChevronDown, IconServer, IconInfoCircle, IconChevronUp } from '@tabler/icons-react';

type EndpointType = 'public' | 'premium' | 'community';
type Network = 'mainnet' | 'testnet' | 'localnet';

interface RpcEndpoint {
	url: string;
	type: EndpointType;
	provider: string;
	network: Network;
	description: string;
	latency?: string;
	rateLimit?: string;
	notes?: string;
}

// Sample RPC endpoints data - this could come from an API or config file
const rpcEndpoints: RpcEndpoint[] = [
	{
		url: 'https://evm-rpc.sei-apis.com',
		type: 'public',
		provider: 'Sei Foundation',
		network: 'mainnet',
		description: 'Official Sei RPC endpoint for mainnet',
		latency: 'Low',
		rateLimit: '10 req/s',
		notes: 'Recommended for development'
	},
	{
		url: 'https://evm-rpc-sei.stingray.plus',
		type: 'public',
		provider: 'Staketab',
		network: 'mainnet',
		description: 'Community maintained RPC endpoint',
		latency: 'Medium'
	},
	{
		url: 'https://sei-evm-rpc.publicnode.com',
		type: 'public',
		provider: 'PublicNode',
		network: 'mainnet',
		description: 'Community maintained RPC endpoint',
		latency: 'Medium',
		rateLimit: '5 req/s'
	},
	{
		url: 'https://seievm-rpc.polkachu.com',
		type: 'public',
		provider: 'Polkachu',
		network: 'mainnet',
		description: 'Community maintained RPC endpoint',
		latency: 'Medium'
	},
	{
		url: 'https://evm-rpc-testnet.sei-apis.com',
		type: 'public',
		provider: 'Sei Foundation',
		network: 'testnet',
		description: 'Official Sei RPC endpoint for atlantic-2 testnet',
		latency: 'Low',
		rateLimit: '20 req/s',
		notes: 'Recommended for testing'
	},
	{
		url: 'https://evm-rpc-testnet-sei.stingray.plus',
		type: 'public',
		provider: 'Staketab',
		network: 'testnet',
		description: 'Community maintained RPC endpoint',
		latency: 'Medium'
	},
	{
		url: 'https://seievm-testnet-rpc.polkachu.com',
		type: 'public',
		provider: 'Polkachu',
		network: 'testnet',
		description: 'Community maintained RPC endpoint',
		latency: 'Medium'
	},
	{
		url: 'https://sei-testnet.drpc.org',
		type: 'public',
		provider: 'dRPC',
		network: 'testnet',
		description: 'Community maintained RPC endpoint',
		latency: 'Medium'
	},
	{
		url: 'http://localhost:8545',
		type: 'public',
		provider: 'Local Node',
		network: 'localnet',
		description: 'Local development endpoint',
		latency: 'Very Low',
		notes: 'For local development only'
	}
];

export function RpcSelector() {
	const [selectedNetwork, setSelectedNetwork] = useState<Network>('mainnet');
	const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>(null);
	const [showAllEndpoints, setShowAllEndpoints] = useState(false);

	const handleCopy = (url: string) => {
		navigator.clipboard.writeText(url);
		setCopiedUrl(url);
		setTimeout(() => setCopiedUrl(null), 2000);
	};

	const toggleEndpointDetails = (url: string) => {
		if (expandedEndpoint === url) {
			setExpandedEndpoint(null);
		} else {
			setExpandedEndpoint(url);
		}
	};

	const filteredEndpoints = rpcEndpoints.filter(
		(endpoint) =>
			endpoint.network === selectedNetwork &&
			(searchTerm === '' || endpoint.url.toLowerCase().includes(searchTerm.toLowerCase()) || endpoint.provider.toLowerCase().includes(searchTerm.toLowerCase()))
	);

	// Display only 3 endpoints by default
	const displayedEndpoints = showAllEndpoints || searchTerm !== '' ? filteredEndpoints : filteredEndpoints.slice(0, 3);
	const hasMoreEndpoints = filteredEndpoints.length > 3 && !showAllEndpoints && searchTerm === '';

	return (
		<div className='flex flex-col'>
			<div className='flex justify-end mb-6'>
				<a href='/evm/reference' className='text-sm text-red-500 hover:text-red-600 dark:hover:text-red-400 flex items-center transition-colors'>
					View full RPC reference
					<IconArrowRight className='h-4 w-4 ml-1' />
				</a>
			</div>

			<div className='flex flex-col sm:flex-row gap-4 mb-6'>
				<div className='flex items-center bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 px-3 py-1.5 w-full sm:max-w-md'>
					<IconSearch className='h-4 w-4 text-neutral-400 mr-2' />
					<input
						type='text'
						placeholder='Search by URL or provider...'
						className='bg-transparent border-none outline-none text-neutral-800 dark:text-neutral-200 text-sm w-full'
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>

				<div className='flex space-x-2'>
					<button
						onClick={() => {
							setSelectedNetwork('mainnet');
							setShowAllEndpoints(false);
						}}
						className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
							selectedNetwork === 'mainnet'
								? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white'
								: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
						}`}>
						Mainnet
					</button>
					<button
						onClick={() => {
							setSelectedNetwork('testnet');
							setShowAllEndpoints(false);
						}}
						className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
							selectedNetwork === 'testnet'
								? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white'
								: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
						}`}>
						Testnet
					</button>
				</div>
			</div>

			<div className='bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden'>
				<div className='px-4 py-3 bg-neutral-50 dark:bg-neutral-800/50 border-b border-neutral-200 dark:border-neutral-800 grid grid-cols-12 text-sm font-medium text-neutral-500 dark:text-neutral-400'>
					<div className='col-span-6 sm:col-span-5'>Endpoint URL</div>
					<div className='col-span-4 sm:col-span-3'>Provider</div>
					<div className='hidden sm:block sm:col-span-3'>Type</div>
					<div className='col-span-2 sm:col-span-1'>Action</div>
				</div>

				<div className='divide-y divide-neutral-200 dark:divide-neutral-800'>
					{displayedEndpoints.length > 0 ? (
						<>
							{displayedEndpoints.map((endpoint) => (
								<div key={endpoint.url} className='hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors'>
									<div className='px-4 py-3 grid grid-cols-12 items-center text-sm'>
										<div className='col-span-6 sm:col-span-5 truncate'>
											<code className='text-neutral-800 dark:text-neutral-300 font-mono text-xs'>{endpoint.url}</code>
										</div>
										<div className='col-span-4 sm:col-span-3 text-neutral-700 dark:text-neutral-400'>{endpoint.provider}</div>
										<div className='hidden sm:block sm:col-span-3'>
											<span
												className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
													endpoint.type === 'public'
														? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
														: endpoint.type === 'premium'
															? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
															: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
												}`}>
												{endpoint.type}
											</span>
										</div>
										<div className='col-span-2 sm:col-span-1 flex justify-end'>
											<div className='flex space-x-2'>
												<button
													onClick={() => handleCopy(endpoint.url)}
													className='p-1 rounded-md text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50 transition-colors'
													title='Copy to clipboard'>
													{copiedUrl === endpoint.url ? <IconCheck className='h-4 w-4 text-green-500' /> : <IconCopy className='h-4 w-4' />}
												</button>
												<button
													onClick={() => toggleEndpointDetails(endpoint.url)}
													className='p-1 rounded-md text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50 transition-colors'
													title='Show details'>
													<IconChevronDown className={`h-4 w-4 transform transition-transform ${expandedEndpoint === endpoint.url ? 'rotate-180' : ''}`} />
												</button>
											</div>
										</div>
									</div>

									{expandedEndpoint === endpoint.url && (
										<div className='px-4 py-3 bg-neutral-50 dark:bg-neutral-800/30 text-sm'>
											<div className='flex flex-col space-y-2'>
												<div>
													<span className='text-neutral-500 dark:text-neutral-400'>Description:</span>
													<span className='ml-2 text-neutral-800 dark:text-neutral-300'>{endpoint.description}</span>
												</div>
												<div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
													{endpoint.latency && (
														<div>
															<span className='text-neutral-500 dark:text-neutral-400'>Latency:</span>
															<span className='ml-2 text-neutral-800 dark:text-neutral-300'>{endpoint.latency}</span>
														</div>
													)}
													{endpoint.rateLimit && (
														<div>
															<span className='text-neutral-500 dark:text-neutral-400'>Rate Limit:</span>
															<span className='ml-2 text-neutral-800 dark:text-neutral-300'>{endpoint.rateLimit}</span>
														</div>
													)}
												</div>
												{endpoint.notes && (
													<div className='flex items-start'>
														<IconInfoCircle className='h-4 w-4 text-blue-500 mr-2 mt-0.5' />
														<span className='text-neutral-700 dark:text-neutral-300'>{endpoint.notes}</span>
													</div>
												)}
											</div>
										</div>
									)}
								</div>
							))}
							{hasMoreEndpoints && (
								<div className='px-4 py-3 flex justify-center'>
									<button
										onClick={() => setShowAllEndpoints(true)}
										className='flex items-center text-sm text-neutral-700 dark:text-neutral-300 hover:text-red-500 dark:hover:text-red-400 transition-colors font-medium'>
										<span>Show more</span>
										<IconChevronDown className='h-4 w-4 ml-1' />
									</button>
								</div>
							)}
							{showAllEndpoints && (
								<div className='px-4 py-3 flex justify-center'>
									<button
										onClick={() => setShowAllEndpoints(false)}
										className='flex items-center text-sm text-neutral-700 dark:text-neutral-300 hover:text-red-500 dark:hover:text-red-400 transition-colors font-medium'>
										<span>Show fewer RPC endpoints</span>
										<IconChevronUp className='h-4 w-4 ml-1' />
									</button>
								</div>
							)}
						</>
					) : (
						<div className='px-4 py-6 text-center text-neutral-600 dark:text-neutral-400'>No endpoints found for your search criteria.</div>
					)}
				</div>
			</div>
		</div>
	);
}
