'use client';

import React, { useEffect, useState } from 'react';
import { IconExternalLink, IconChevronRight } from '@tabler/icons-react';
import { CopyButton } from '../CopyButton';

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

	// Helper function to render tab content
	const renderTabContent = (tab: TabType, isVisible: boolean = true) => {
		const contentClass = isVisible ? 'tab-content' : 'sr-only';
		const ariaHidden = !isVisible;

		switch (tab) {
			case 'mainnet':
				return (
					<div className={contentClass} aria-hidden={ariaHidden} data-search-content data-tab-value='mainnet'>
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
											<CopyButton textToCopy='1329' />
										</div>
									</div>

									<div className='flex flex-col'>
										<div className={labelClass}>RPC URL:</div>
										<div className='flex items-center justify-between'>
											<a href='https://evm-rpc.sei-apis.com' target='_blank' rel='noopener noreferrer' className={linkClass}>
												https://evm-rpc.sei-apis.com
											</a>
											<CopyButton textToCopy='https://evm-rpc.sei-apis.com' />
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
											<CopyButton textToCopy='pacific-1' />
										</div>
									</div>

									<div className='flex flex-col'>
										<div className={labelClass}>RPC URL:</div>
										<div className='flex items-center justify-between'>
											<a href='https://rpc.pacific-1.sei.io' target='_blank' rel='noopener noreferrer' className={linkClass}>
												https://rpc.pacific-1.sei.io
											</a>
											<CopyButton textToCopy='https://rpc.pacific-1.sei.io' />
										</div>
									</div>

									<div className='flex flex-col'>
										<div className={labelClass}>Explorer:</div>
										<div className='flex items-center justify-between'>
											<span className={valueClass}>seitrace.com</span>
											<a href='https://seitrace.com/?chain=pacific-1' target='_blank' rel='noopener noreferrer' className={visitLinkClass}>
												Visit
												<IconChevronRight className='w-4 h-4 ml-1' />
											</a>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				);
			case 'testnet':
				return (
					<div className={contentClass} aria-hidden={ariaHidden} data-search-content data-tab-value='testnet'>
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
											<CopyButton textToCopy='1328' />
										</div>
									</div>

									<div className='flex flex-col'>
										<div className={labelClass}>RPC URL:</div>
										<div className='flex items-center justify-between'>
											<a href='https://evm-rpc-testnet.sei-apis.com' target='_blank' rel='noopener noreferrer' className={linkClass}>
												https://evm-rpc-testnet.sei-apis.com
											</a>
											<CopyButton textToCopy='https://evm-rpc-testnet.sei-apis.com' />
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
									<div className='flex flex-col'>
										<div className={labelClass}>Faucet:</div>
										<div className='flex items-center justify-between'>
											<span className={valueClass}>Testnet faucet</span>
											<a href='/learn/faucet' rel='noopener noreferrer' className={visitLinkClass}>
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
											<CopyButton textToCopy='atlantic-2' />
										</div>
									</div>

									<div className='flex flex-col'>
										<div className={labelClass}>RPC URL:</div>
										<div className='flex items-center justify-between'>
											<a href='https://rpc-testnet.sei-apis.com' target='_blank' rel='noopener noreferrer' className={linkClass}>
												https://rpc-testnet.sei-apis.com
											</a>
											<CopyButton textToCopy='https://rpc-testnet.sei-apis.com' />
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
									<div className='flex flex-col'>
										<div className={labelClass}>Faucet:</div>
										<div className='flex items-center justify-between'>
											<span className={valueClass}>Testnet faucet</span>
											<a href='/learn/faucet' rel='noopener noreferrer' className={visitLinkClass}>
												Visit
												<IconChevronRight className='w-4 h-4 ml-1' />
											</a>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				);
			case 'localnet':
				return (
					<div className={contentClass} aria-hidden={ariaHidden} data-search-content data-tab-value='localnet'>
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
											<span className={valueClass}>713714 (0xAE3F2)</span>
											<CopyButton textToCopy='713714' />
										</div>
									</div>

									<div className='flex flex-col'>
										<div className={labelClass}>RPC URL:</div>
										<div className='flex items-center justify-between'>
											<span className={valueClass}>http://localhost:8545</span>
											<CopyButton textToCopy='http://localhost:8545' />
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
											<CopyButton textToCopy='sei-local' />
										</div>
									</div>

									<div className='flex flex-col'>
										<div className={labelClass}>RPC URL:</div>
										<div className='flex items-center justify-between'>
											<span className={valueClass}>http://localhost:26657</span>
											<CopyButton textToCopy='http://localhost:26657' />
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
				);
			default:
				return null;
		}
	};

	return (
		<div className='network-tabs'>
			<div className='flex flex-wrap gap-2 mb-6'>
				<a href='#mainnet' onClick={() => setActiveTab('mainnet')} className={tabButtonClass('mainnet')}>
					Mainnet
				</a>
				<a href='#testnet' onClick={() => setActiveTab('testnet')} className={tabButtonClass('testnet')}>
					Testnet (atlantic-2)
				</a>
				<a href='#localnet' onClick={() => setActiveTab('localnet')} className={tabButtonClass('localnet')}>
					Local Environment
				</a>
			</div>

			{/* Visible content for active tab */}
			{renderTabContent(activeTab, true)}

			{/* Hidden content for search indexing - render all tabs */}
			{(['mainnet', 'testnet', 'localnet'] as TabType[]).map((tab) => (tab !== activeTab ? renderTabContent(tab, false) : null))}
		</div>
	);
}
