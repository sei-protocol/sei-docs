'use client';

import * as React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../Tabs';

type GroupedContracts = {
	projectName: string;
	contracts: Record<string, string>[];
	contractCount: number;
};

interface EcosystemContractsTabsProps {
	groupedData: GroupedContracts[];
	nameKey: string;
	addressKey: string;
}

export function EcosystemContractsTabs({ groupedData, nameKey, addressKey }: EcosystemContractsTabsProps) {
	const defaultTab = groupedData[0]?.projectName || 'default';
	const [selectedTab, setSelectedTab] = React.useState<string>(defaultTab);
	const [query, setQuery] = React.useState<string>('');

	const toDomSafe = (s: string) =>
		s
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '');
	const getContractDomId = (groupName: string, addressLower: string) => `contract-${toDomSafe(groupName)}-${addressLower}`;

	const scrollToContract = (groupName: string, addressLower: string) => {
		const rawId = getContractDomId(groupName, addressLower);
		const safeId = typeof CSS !== 'undefined' && (CSS as any).escape ? (CSS as any).escape(rawId) : rawId.replace(/[^a-zA-Z0-9_-]/g, '_');
		let attempts = 0;
		const maxAttempts = 24;

		const tryScroll = () => {
			attempts++;
			const activePanel = document.querySelector("[role='tabpanel'][data-state='active']") as HTMLElement | null;
			if (!activePanel) {
				if (attempts < maxAttempts) requestAnimationFrame(tryScroll);
				return;
			}

			const isVisible = (el: HTMLElement) => el.getClientRects().length > 0 && window.getComputedStyle(el).visibility !== 'hidden';
			const panel = activePanel as HTMLElement; // narrow for callbacks below

			const inPanel = Array.from(panel.querySelectorAll(`#${safeId}`)) as HTMLElement[];
			let target: HTMLElement | null = inPanel.filter((el) => !el.closest('[data-search-content]') && isVisible(el))[0] || null;
			if (!target) {
				// Fallback: search globally, prefer visible element inside active panel
				const allMatches = Array.from(document.querySelectorAll(`#${safeId}`)) as HTMLElement[];
				target =
					allMatches.find((el) => panel.contains(el) && !el.closest('[data-search-content]') && isVisible(el)) ||
					allMatches.find((el) => !el.closest('[data-search-content]') && isVisible(el)) ||
					null;
			}

			if (target) {
				let offset = 0;
				const stickyTabs = document.querySelector('[data-sticky-tabs="true"]') as HTMLElement | null;
				if (stickyTabs) offset += stickyTabs.getBoundingClientRect().height + 12;
				const header = (document.querySelector('header') || document.querySelector('nav')) as HTMLElement | null;
				if (header) {
					const style = window.getComputedStyle(header);
					if (style.position === 'fixed' || style.position === 'sticky') {
						offset += header.getBoundingClientRect().height;
					}
				}

				const rect = target.getBoundingClientRect();
				const top = window.scrollY + rect.top - Math.max(offset, 80);
				window.scrollTo({ top, behavior: 'smooth' });
				return;
			}

			if (attempts < maxAttempts) requestAnimationFrame(tryScroll);
		};

		requestAnimationFrame(tryScroll);
	};

	const handleSearchSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const q = query.trim().toLowerCase();
		if (!q) return;

		for (const group of groupedData) {
			for (const contract of group.contracts) {
				const name = String(contract[nameKey] || '').toLowerCase();
				const address = String(contract[addressKey] || '').toLowerCase();
				if (name.includes(q) || address.includes(q)) {
					setSelectedTab(group.projectName);
					// Scroll to the visible contract row (exclude hidden indexing duplicates)
					scrollToContract(group.projectName, address);
					return;
				}
			}
		}
	};

	return (
		<div className='space-y-4'>
			<form onSubmit={handleSearchSubmit} className='flex gap-2 items-center'>
				<input
					type='text'
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder='Search by contract name or address'
					aria-label='Search by contract name or address'
					autoComplete='off'
					className='w-full px-3 py-2 rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:!bg-neutral-900 text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-red-500/25 dark:focus:ring-red-500/20 focus:border-red-500 dark:focus:border-red-500 transition-colors'
				/>
				<button
					type='submit'
					className='px-3 py-2 rounded bg-red-600 text-white text-sm hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/30 dark:focus:ring-red-500/20'>
					Search
				</button>
			</form>

			<Tabs value={selectedTab} onValueChange={setSelectedTab} defaultValue={defaultTab} className='w-full'>
				<TabsList
					data-sticky-tabs='true'
					className='sticky top-16 z-30 flex w-full border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-x-auto overflow-y-hidden flex-nowrap mb-4 bg-white/80 dark:bg-neutral-900/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-neutral-900/60'>
					{groupedData.map((group) => (
						<TabsTrigger key={group.projectName} value={group.projectName}>
							{group.projectName}
							<span className='ml-2 text-xs text-neutral-500'>({group.contractCount})</span>
						</TabsTrigger>
					))}
				</TabsList>

				{groupedData.map((group, groupIndex) => (
					<TabsContent key={group.projectName} value={group.projectName}>
						<div className='space-y-4'>
							<div className='flex items-center justify-between'>
								<div className='flex items-center gap-3'>
									<h3 className='text-lg font-bold text-gray-900 dark:text-white'>{group.projectName}</h3>
									<span className='text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full'>
										{group.contractCount} contract{group.contractCount !== 1 ? 's' : ''}
									</span>
								</div>
							</div>

							{/* Desktop table view */}
							<div className='hidden sm:block overflow-x-auto'>
								<table className='w-full border-collapse border border-gray-200 dark:border-gray-700 rounded-lg'>
									<thead>
										<tr className='bg-gray-50 dark:bg-gray-800'>
											<th className='border border-gray-200 dark:border-gray-700 px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white'>
												Contract Name
											</th>
											<th className='border border-gray-200 dark:border-gray-700 px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white'>
												Contract Address
											</th>
										</tr>
									</thead>
									<tbody>
										{group.contracts.map((contract, contractIndex) => {
											const addr = String(contract[addressKey] || '').toLowerCase();
											const id = `contract-${group.projectName
												.toLowerCase()
												.replace(/[^a-z0-9]+/g, '-')
												.replace(/^-+|-+$/g, '')}-${addr}`;
											return (
												<tr key={contractIndex} id={id} className='transition-colors'>
													<td className='border border-gray-200 dark:border-gray-700 px-4 py-3 text-sm text-gray-900 dark:text-white font-medium'>
														{contract[nameKey] || 'Unnamed Contract'}
													</td>
													<td className='border border-gray-200 dark:border-gray-700 px-4 py-3 text-sm'>
														<div className='flex items-center gap-2'>
															<code className='text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono'>{contract[addressKey]}</code>
															<a
																href={`https://seiscan.io/address/${contract[addressKey]}`}
																target='_blank'
																rel='noopener noreferrer'
																className='text-red-600 hover:text-red-800 text-xs bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition-colors no-underline'>
																SeiScan ↗
															</a>
														</div>
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							</div>

							{/* Mobile card view */}
							<div className='block sm:hidden space-y-3'>
								{group.contracts.map((contract, contractIndex) => {
									const addr = String(contract[addressKey] || '').toLowerCase();
									const id = `contract-${group.projectName
										.toLowerCase()
										.replace(/[^a-z0-9]+/g, '-')
										.replace(/^-+|-+$/g, '')}-${addr}`;
									return (
										<div key={contractIndex} id={id} className='border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800'>
											<div className='space-y-2'>
												<div>
													<span className='text-xs text-gray-500 dark:text-gray-400 block mb-1'>Contract Name</span>
													<span className='text-sm font-medium text-gray-900 dark:text-white'>{contract[nameKey] || 'Unnamed Contract'}</span>
												</div>
												<div>
													<span className='text-xs text-gray-500 dark:text-gray-400 block mb-1'>Contract Address</span>
													<div className='flex items-center gap-2'>
														<code className='text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded font-mono'>{contract[addressKey]}</code>
														<a
															href={`https://seiscan.io/address/${contract[addressKey]}`}
															target='_blank'
															rel='noopener noreferrer'
															className='text-red-600 hover:text-red-800 text-xs bg-red-50 hover:bg-red-100 px-2 py-1 rounded transition-colors no-underline'>
															SeiScan ↗
														</a>
													</div>
												</div>
											</div>
										</div>
									);
								})}
							</div>
						</div>
					</TabsContent>
				))}
			</Tabs>
		</div>
	);
}
