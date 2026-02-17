'use client';

import React, { useState, useEffect } from 'react';
import {
	IconExternalLink,
	IconCopy,
	IconCheck,
	IconArrowRight,
	IconSearch,
	IconChevronDown,
	IconServer,
	IconInfoCircle,
	IconChevronUp,
	IconAlertCircle
} from '@tabler/icons-react';

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

interface BaseHeightInfo {
	baseHeight: number | null;
	loading: boolean;
	error: boolean;
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
		url: 'https://jsonrpc.lavenderfive.com:443/sei',
		type: 'public',
		provider: 'LavenderFive',
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
	const [baseHeights, setBaseHeights] = useState<Record<string, BaseHeightInfo>>({});

	const handleCopy = (url: string) => {
		navigator.clipboard.writeText(url);
		setCopiedUrl(url);
		setTimeout(() => setCopiedUrl(null), 2000);
	};

	const fetchBaseHeight = async (url: string): Promise<number | null> => {
		try {
			console.log('Fetching base height for:', url);

			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					jsonrpc: '2.0',
					method: 'eth_getBlockByNumber',
					params: ['0x1', false],
					id: 1
				}),
				mode: 'cors'
			});

			console.log('Response status:', response.status);

			if (!response.ok) {
				console.error('Response not OK:', response.status, response.statusText);
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			console.log('Response data:', data);

			if (data.error && data.error.message) {
				console.log('Error message found:', data.error.message);
				// Extract base height from error message
				// Example: "height is not available (requested height: 0, base height: 161939999)"
				const match = data.error.message.match(/base height:\s*(\d+)/);
				if (match) {
					const baseHeight = parseInt(match[1], 10);
					console.log('Extracted base height:', baseHeight);
					return baseHeight;
				}
			}

			// If no error, the endpoint has full history
			console.log('No error found, full history available');
			return null;
		} catch (error) {
			console.error(`Failed to fetch base height for ${url}:`, error);
			throw error;
		}
	};

	const toggleEndpointDetails = (url: string) => {
		if (expandedEndpoint === url) {
			setExpandedEndpoint(null);
		} else {
			setExpandedEndpoint(url);
			// Fetch base height when expanding if not already fetched
			if (!baseHeights[url]) {
				setBaseHeights((prev) => ({
					...prev,
					[url]: { baseHeight: null, loading: true, error: false }
				}));

				fetchBaseHeight(url)
					.then((baseHeight) => {
						setBaseHeights((prev) => ({
							...prev,
							[url]: { baseHeight, loading: false, error: false }
						}));
					})
					.catch(() => {
						setBaseHeights((prev) => ({
							...prev,
							[url]: { baseHeight: null, loading: false, error: true }
						}));
					});
			}
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
				<a href='/evm/reference' className='text-sm text-[#600014] hover:text-[#600014] dark:hover:text-[#b99ba1] flex items-center transition-colors'>
					View full RPC reference
					<IconArrowRight className='h-4 w-4 ml-1' />
				</a>
			</div>

			<div className='flex flex-col sm:flex-row gap-4 mb-6'>
				<div className='flex items-center bg-neutral-50 dark:bg-neutral-800/60 rounded-sm border border-neutral-200 dark:border-neutral-700 px-3 py-1.5 w-full sm:max-w-md'>
					<IconSearch className='h-4 w-4 text-neutral-400 mr-2' />
					<input
						type='text'
						placeholder='Search by URL or provider...'
						className='bg-transparent border-none outline-none text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 text-sm w-full'
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
						className={`px-3 py-1.5 text-sm rounded-sm transition-colors ${
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
						className={`px-3 py-1.5 text-sm rounded-sm transition-colors ${
							selectedNetwork === 'testnet'
								? 'bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white'
								: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
						}`}>
						Testnet
					</button>
				</div>
			</div>

			<div className='bg-neutral-50 dark:bg-neutral-900/40 rounded-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden'>
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
								<div key={endpoint.url} className='bg-neutral-50 dark:bg-transparent hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors'>
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
													className='p-1 rounded-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50 transition-colors'
													title='Copy to clipboard'>
													{copiedUrl === endpoint.url ? <IconCheck className='h-4 w-4 text-green-500' /> : <IconCopy className='h-4 w-4' />}
												</button>
												<button
													onClick={() => toggleEndpointDetails(endpoint.url)}
													className='p-1 rounded-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-200/50 dark:hover:bg-neutral-700/50 transition-colors'
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
												<div>
													<span className='text-neutral-500 dark:text-neutral-400'>Historical Data:</span>
													{baseHeights[endpoint.url]?.loading ? (
														<span className='ml-2 text-neutral-600 dark:text-neutral-400 italic'>Checking availability...</span>
													) : baseHeights[endpoint.url]?.error ? (
														<span className='ml-2 text-orange-600 dark:text-orange-400'>Unable to verify</span>
													) : baseHeights[endpoint.url]?.baseHeight ? (
														<span className='ml-2 text-neutral-800 dark:text-neutral-300'>
															Available from block {baseHeights[endpoint.url]?.baseHeight?.toLocaleString()}
														</span>
													) : baseHeights[endpoint.url] ? (
														<span className='ml-2 text-green-600 dark:text-green-400'>Full history available</span>
													) : (
														<span className='ml-2 text-neutral-600 dark:text-neutral-400 italic'>Click to check</span>
													)}
												</div>
												{baseHeights[endpoint.url]?.baseHeight && (
													<div className='flex items-start bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-sm p-2'>
														<IconAlertCircle className='h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0' />
														<span className='text-xs text-orange-800 dark:text-orange-300'>
															Historical blocks before {baseHeights[endpoint.url]?.baseHeight?.toLocaleString()} are not available on this endpoint.
														</span>
													</div>
												)}
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
										className='flex items-center text-sm text-neutral-700 dark:text-neutral-300 hover:text-[#600014] dark:hover:text-[#b99ba1] transition-colors font-medium'>
										<span>Show more</span>
										<IconChevronDown className='h-4 w-4 ml-1' />
									</button>
								</div>
							)}
							{showAllEndpoints && (
								<div className='px-4 py-3 flex justify-center'>
									<button
										onClick={() => setShowAllEndpoints(false)}
										className='flex items-center text-sm text-neutral-700 dark:text-neutral-300 hover:text-[#600014] dark:hover:text-[#b99ba1] transition-colors font-medium'>
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
