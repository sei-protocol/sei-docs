'use client';

import React, { useEffect, useState } from 'react';
import { IconExternalLink, IconChevronRight } from '@tabler/icons-react';

type TabType = 'mainnet' | 'testnet' | 'devnet' | 'localnet';

interface NetworkTabsProps {}

export function NetworkTabs({}: NetworkTabsProps) {
	const [activeTab, setActiveTab] = useState<TabType>('mainnet');

	useEffect(() => {
		const hash = window.location.hash.substring(1);
		if (['mainnet', 'testnet', 'devnet', 'localnet'].includes(hash)) {
			setActiveTab(hash as TabType);
		}

		const handleHashChange = () => {
			const hash = window.location.hash.substring(1);
			if (['mainnet', 'testnet', 'devnet', 'localnet'].includes(hash)) {
				setActiveTab(hash as TabType);
			}
		};

		window.addEventListener('hashchange', handleHashChange);
		return () => window.removeEventListener('hashchange', handleHashChange);
	}, []);

	const handleCopy = (value: string): void => {
		navigator.clipboard.writeText(value);
	};

	const tabButtonClass = (tab: TabType): string =>
		`px-3 py-1.5 text-sm rounded-md transition-colors ${
			activeTab === tab
				? 'bg-neutral-200 dark:bg-neutral-800/80 text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-700'
				: 'bg-neutral-100 dark:bg-neutral-800/50 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700/50 hover:bg-neutral-200 dark:hover:bg-neutral-700/70 hover:text-neutral-900 dark:hover:text-white'
		}`;

	const sectionTitleClass = 'font-medium text-neutral-900 dark:text-white';
	const statusIndicatorClass = 'w-2 h-2 rounded-full';
	const labelClass = 'text-neutral-500 dark:text-neutral-500 mb-1';
	const valueClass = 'text-neutral-700 dark:text-neutral-300';
	const linkClass = 'text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white transition-colors truncate max-w-[180px]';
	const iconButtonClass = 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300 transition-colors';
	const visitLinkClass = 'text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white flex items-center transition-colors';

	return (
		<div className='network-tabs'>
			<div className='flex flex-wrap gap-2 mb-6'>
				<a href='#mainnet' onClick={() => setActiveTab('mainnet')} className={tabButtonClass('mainnet')}>
					Mainnet
				</a>
				<a href='#testnet' onClick={() => setActiveTab('testnet')} className={tabButtonClass('testnet')}>
					Testnet (atlantic-2)
				</a>
				<a href='#devnet' onClick={() => setActiveTab('devnet')} className={tabButtonClass('devnet')}>
					Devnet (arctic-1)
				</a>
				<a href='#localnet' onClick={() => setActiveTab('localnet')} className={tabButtonClass('localnet')}>
					Local Environment
				</a>
			</div>

			{activeTab === 'mainnet' && (
				<div className='tab-content'>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
						<div>
							<div className='flex items-center gap-2 mb-4'>
								<div className={`${statusIndicatorClass} bg-green-500`}></div>
								<h3 className={sectionTitleClass}>EVM Network</h3>
							</div>

							<div className='space-y-4'>
								<div className='flex flex-col'>
									<div className={labelClass}>Chain ID:</div>
									<div className='flex items-center justify-between'>
										<span className={valueClass}>1329 (0x531)</span>
										<button className={iconButtonClass} title='Copy to clipboard' aria-label='Copy Chain ID' onClick={() => handleCopy('1329')}>
											<IconExternalLink className='w-4 h-4' />
										</button>
									</div>
								</div>

								<div className='flex flex-col'>
									<div className={labelClass}>RPC URL:</div>
									<div className='flex items-center justify-between'>
										<a href='https://evm-rpc.sei-apis.com' target='_blank' rel='noopener noreferrer' className={linkClass}>
											https://evm-rpc.sei-apis.com
										</a>
										<button
											className={iconButtonClass}
											title='Copy to clipboard'
											aria-label='Copy RPC URL'
											onClick={() => handleCopy('https://evm-rpc.sei-apis.com')}>
											<IconExternalLink className='w-4 h-4' />
										</button>
									</div>
								</div>

								<div className='flex flex-col'>
									<div className={labelClass}>Explorer:</div>
									<div className='flex items-center justify-between'>
										<span className={valueClass}>seitrace.com</span>
										<a href='https://seitrace.com' target='_blank' rel='noopener noreferrer' className={visitLinkClass}>
											Visit
											<IconChevronRight className='w-4 h-4 ml-1' />
										</a>
									</div>
								</div>
							</div>
						</div>

						<div>
							<div className='flex items-center gap-2 mb-4'>
								<div className={`${statusIndicatorClass} bg-green-500`}></div>
								<h3 className={sectionTitleClass}>Cosmos Network</h3>
							</div>

							<div className='space-y-4'>
								<div className='flex flex-col'>
									<div className={labelClass}>Chain ID:</div>
									<div className='flex items-center justify-between'>
										<span className={valueClass}>pacific-1</span>
										<button className={iconButtonClass} title='Copy to clipboard' aria-label='Copy Chain ID' onClick={() => handleCopy('pacific-1')}>
											<IconExternalLink className='w-4 h-4' />
										</button>
									</div>
								</div>

								<div className='flex flex-col'>
									<div className={labelClass}>RPC URL:</div>
									<div className='flex items-center justify-between'>
										<a href='https://rpc.pacific-1.sei.io' target='_blank' rel='noopener noreferrer' className={linkClass}>
											https://rpc.pacific-1.sei.io
										</a>
										<button
											className={iconButtonClass}
											title='Copy to clipboard'
											aria-label='Copy RPC URL'
											onClick={() => handleCopy('https://rpc.pacific-1.sei.io')}>
											<IconExternalLink className='w-4 h-4' />
										</button>
									</div>
								</div>

								<div className='flex flex-col'>
									<div className={labelClass}>Explorer:</div>
									<div className='flex items-center justify-between'>
										<span className={valueClass}>seiscan.app</span>
										<a href='https://www.seiscan.app/pacific-1' target='_blank' rel='noopener noreferrer' className={visitLinkClass}>
											Visit
											<IconChevronRight className='w-4 h-4 ml-1' />
										</a>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{activeTab === 'testnet' && (
				<div className='tab-content'>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
						<div>
							<div className='flex items-center gap-2 mb-4'>
								<div className={`${statusIndicatorClass} bg-blue-500`}></div>
								<h3 className={sectionTitleClass}>EVM Network</h3>
							</div>

							<div className='space-y-4'>
								<div className='flex flex-col'>
									<div className={labelClass}>Chain ID:</div>
									<div className='flex items-center justify-between'>
										<span className={valueClass}>1328 (0x530)</span>
										<button className={iconButtonClass} title='Copy to clipboard' aria-label='Copy Chain ID' onClick={() => handleCopy('1328')}>
											<IconExternalLink className='w-4 h-4' />
										</button>
									</div>
								</div>

								<div className='flex flex-col'>
									<div className={labelClass}>RPC URL:</div>
									<div className='flex items-center justify-between'>
										<a href='https://evm-rpc-atlantic-2.sei-apis.com' target='_blank' rel='noopener noreferrer' className={linkClass}>
											https://evm-rpc-atlantic-2.sei-apis.com
										</a>
										<button
											className={iconButtonClass}
											title='Copy to clipboard'
											aria-label='Copy RPC URL'
											onClick={() => handleCopy('https://evm-rpc-atlantic-2.sei-apis.com')}>
											<IconExternalLink className='w-4 h-4' />
										</button>
									</div>
								</div>

								<div className='flex flex-col'>
									<div className={labelClass}>Explorer:</div>
									<div className='flex items-center justify-between'>
										<span className={valueClass}>seitrace.com</span>
										<a href='https://seitrace.com/?chain=atlantic-2' target='_blank' rel='noopener noreferrer' className={visitLinkClass}>
											Visit
											<IconChevronRight className='w-4 h-4 ml-1' />
										</a>
									</div>
								</div>
							</div>
						</div>

						<div>
							<div className='flex items-center gap-2 mb-4'>
								<div className={`${statusIndicatorClass} bg-blue-500`}></div>
								<h3 className={sectionTitleClass}>Cosmos Network</h3>
							</div>

							<div className='space-y-4'>
								<div className='flex flex-col'>
									<div className={labelClass}>Chain ID:</div>
									<div className='flex items-center justify-between'>
										<span className={valueClass}>atlantic-2</span>
										<button className={iconButtonClass} title='Copy to clipboard' aria-label='Copy Chain ID' onClick={() => handleCopy('atlantic-2')}>
											<IconExternalLink className='w-4 h-4' />
										</button>
									</div>
								</div>

								<div className='flex flex-col'>
									<div className={labelClass}>RPC URL:</div>
									<div className='flex items-center justify-between'>
										<a href='https://rpc.atlantic-2.sei.io' target='_blank' rel='noopener noreferrer' className={linkClass}>
											https://rpc.atlantic-2.sei.io
										</a>
										<button
											className={iconButtonClass}
											title='Copy to clipboard'
											aria-label='Copy RPC URL'
											onClick={() => handleCopy('https://rpc.atlantic-2.sei.io')}>
											<IconExternalLink className='w-4 h-4' />
										</button>
									</div>
								</div>

								<div className='flex flex-col'>
									<div className={labelClass}>Explorer:</div>
									<div className='flex items-center justify-between'>
										<span className={valueClass}>seiscan.app</span>
										<a href='https://www.seiscan.app/atlantic-2' target='_blank' rel='noopener noreferrer' className={visitLinkClass}>
											Visit
											<IconChevronRight className='w-4 h-4 ml-1' />
										</a>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{activeTab === 'devnet' && (
				<div className='tab-content'>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
						<div>
							<div className='flex items-center gap-2 mb-4'>
								<div className={`${statusIndicatorClass} bg-purple-500`}></div>
								<h3 className={sectionTitleClass}>EVM Network</h3>
							</div>

							<div className='space-y-4'>
								<div className='flex flex-col'>
									<div className={labelClass}>Chain ID:</div>
									<div className='flex items-center justify-between'>
										<span className={valueClass}>1327 (0x52F)</span>
										<button className={iconButtonClass} title='Copy to clipboard' aria-label='Copy Chain ID' onClick={() => handleCopy('1327')}>
											<IconExternalLink className='w-4 h-4' />
										</button>
									</div>
								</div>

								<div className='flex flex-col'>
									<div className={labelClass}>RPC URL:</div>
									<div className='flex items-center justify-between'>
										<a href='https://evm-rpc-arctic-1.sei-apis.com' target='_blank' rel='noopener noreferrer' className={linkClass}>
											https://evm-rpc-arctic-1.sei-apis.com
										</a>
										<button
											className={iconButtonClass}
											title='Copy to clipboard'
											aria-label='Copy RPC URL'
											onClick={() => handleCopy('https://evm-rpc-arctic-1.sei-apis.com')}>
											<IconExternalLink className='w-4 h-4' />
										</button>
									</div>
								</div>

								<div className='flex flex-col'>
									<div className={labelClass}>Explorer:</div>
									<div className='flex items-center justify-between'>
										<span className={valueClass}>seitrace.com</span>
										<a href='https://seitrace.com/?chain=arctic-1' target='_blank' rel='noopener noreferrer' className={visitLinkClass}>
											Visit
											<IconChevronRight className='w-4 h-4 ml-1' />
										</a>
									</div>
								</div>
							</div>
						</div>

						<div>
							<div className='flex items-center gap-2 mb-4'>
								<div className={`${statusIndicatorClass} bg-purple-500`}></div>
								<h3 className={sectionTitleClass}>Cosmos Network</h3>
							</div>

							<div className='space-y-4'>
								<div className='flex flex-col'>
									<div className={labelClass}>Chain ID:</div>
									<div className='flex items-center justify-between'>
										<span className={valueClass}>arctic-1</span>
										<button className={iconButtonClass} title='Copy to clipboard' aria-label='Copy Chain ID' onClick={() => handleCopy('arctic-1')}>
											<IconExternalLink className='w-4 h-4' />
										</button>
									</div>
								</div>

								<div className='flex flex-col'>
									<div className={labelClass}>RPC URL:</div>
									<div className='flex items-center justify-between'>
										<a href='https://rpc.arctic-1.sei.io' target='_blank' rel='noopener noreferrer' className={linkClass}>
											https://rpc.arctic-1.sei.io
										</a>
										<button
											className={iconButtonClass}
											title='Copy to clipboard'
											aria-label='Copy RPC URL'
											onClick={() => handleCopy('https://rpc.arctic-1.sei.io')}>
											<IconExternalLink className='w-4 h-4' />
										</button>
									</div>
								</div>

								<div className='flex flex-col'>
									<div className={labelClass}>Explorer:</div>
									<div className='flex items-center justify-between'>
										<span className={valueClass}>seiscan.app</span>
										<a href='https://www.seiscan.app/arctic-1' target='_blank' rel='noopener noreferrer' className={visitLinkClass}>
											Visit
											<IconChevronRight className='w-4 h-4 ml-1' />
										</a>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{activeTab === 'localnet' && (
				<div className='tab-content'>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
						<div>
							<div className='flex items-center gap-2 mb-4'>
								<div className={`${statusIndicatorClass} bg-orange-500`}></div>
								<h3 className={sectionTitleClass}>EVM Network</h3>
							</div>

							<div className='space-y-4'>
								<div className='flex flex-col'>
									<div className={labelClass}>Chain ID:</div>
									<div className='flex items-center justify-between'>
										<span className={valueClass}>4242 (0x1092)</span>
										<button className={iconButtonClass} title='Copy to clipboard' aria-label='Copy Chain ID' onClick={() => handleCopy('4242')}>
											<IconExternalLink className='w-4 h-4' />
										</button>
									</div>
								</div>

								<div className='flex flex-col'>
									<div className={labelClass}>RPC URL:</div>
									<div className='flex items-center justify-between'>
										<span className={valueClass}>http://localhost:8545</span>
										<button className={iconButtonClass} title='Copy to clipboard' aria-label='Copy RPC URL' onClick={() => handleCopy('http://localhost:8545')}>
											<IconExternalLink className='w-4 h-4' />
										</button>
									</div>
								</div>

								<div className='flex flex-col'>
									<div className={labelClass}>Explorer:</div>
									<div className='flex items-center justify-between'>
										<span className={valueClass}>N/A</span>
									</div>
								</div>
							</div>
						</div>

						<div>
							<div className='flex items-center gap-2 mb-4'>
								<div className={`${statusIndicatorClass} bg-orange-500`}></div>
								<h3 className={sectionTitleClass}>Cosmos Network</h3>
							</div>

							<div className='space-y-4'>
								<div className='flex flex-col'>
									<div className={labelClass}>Chain ID:</div>
									<div className='flex items-center justify-between'>
										<span className={valueClass}>sei-local</span>
										<button className={iconButtonClass} title='Copy to clipboard' aria-label='Copy Chain ID' onClick={() => handleCopy('sei-local')}>
											<IconExternalLink className='w-4 h-4' />
										</button>
									</div>
								</div>

								<div className='flex flex-col'>
									<div className={labelClass}>RPC URL:</div>
									<div className='flex items-center justify-between'>
										<span className={valueClass}>http://localhost:26657</span>
										<button className={iconButtonClass} title='Copy to clipboard' aria-label='Copy RPC URL' onClick={() => handleCopy('http://localhost:26657')}>
											<IconExternalLink className='w-4 h-4' />
										</button>
									</div>
								</div>

								<div className='flex flex-col'>
									<div className={labelClass}>Explorer:</div>
									<div className='flex items-center justify-between'>
										<span className={valueClass}>N/A</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
