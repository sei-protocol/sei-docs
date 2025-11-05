'use client';

import * as React from 'react';

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
	const [query, setQuery] = React.useState<string>('');
	const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({});

	const slugify = (value: string): string => {
		return String(value)
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '');
	};

	const toggleSection = (projectName: string) => {
		setOpenSections((prev) => ({ ...prev, [projectName]: !prev[projectName] }));
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
					setOpenSections((prev) => ({ ...prev, [group.projectName]: true }));
					const id = `contract-${slugify(group.projectName)}-${address}`;
					requestAnimationFrame(() => {
						const el = document.getElementById(id);
						if (!el) return;

						// Center the element in the viewport for better visibility (works for both <tr> and card <div>)
						const rect = el.getBoundingClientRect();
						const currentScrollY = window.scrollY || window.pageYOffset;
						const absoluteTop = rect.top + currentScrollY;
						const viewportHeight = window.innerHeight;
						const targetTop = absoluteTop - Math.max(0, (viewportHeight - rect.height) / 2);

						const maxScroll = Math.max(0, (document.documentElement.scrollHeight || document.body.scrollHeight) - viewportHeight);
						const clampedTop = Math.min(Math.max(0, targetTop), maxScroll);

						window.scrollTo({ top: clampedTop, behavior: 'smooth' });
					});
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

			<div className='w-full space-y-3'>
				{groupedData.map((group) => {
					const isOpen = !!openSections[group.projectName];
					const sectionId = `section-${slugify(group.projectName)}`;
					return (
						<div key={group.projectName} className='border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden'>
							<button
								type='button'
								onClick={() => toggleSection(group.projectName)}
								className='w-full flex items-center justify-between px-4 py-3 bg-white dark:!bg-neutral-900 hover:bg-neutral-50 dark:hover:!bg-neutral-800 transition-colors'
								aria-expanded={isOpen}
								aria-controls={sectionId}>
								<span className='flex items-center gap-3 text-left'>
									<span className='text-sm sm:text-base font-semibold text-neutral-900 dark:text-neutral-100'>{group.projectName}</span>
									<span className='text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full'>
										{group.contractCount} contract{group.contractCount !== 1 ? 's' : ''}
									</span>
								</span>
								<span className={`ml-4 inline-block transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden='true'>
									{/* Chevron */}
									<svg width='16' height='16' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg' className='text-neutral-600 dark:text-neutral-300'>
										<path d='M5 8l5 5 5-5' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
									</svg>
								</span>
							</button>
							<div id={sectionId} role='region' className={`${isOpen ? 'block' : 'hidden'}`}>
								<div className='p-4 space-y-4'>
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
													const id = `contract-${slugify(group.projectName)}-${addr}`;
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
																		className='text-red-600 hover:text-red-800 dark:text-red-300 dark:hover:text-red-200 text-xs bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 px-2 py-1 rounded transition-colors no-underline'>
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
											const id = `contract-${slugify(group.projectName)}-${addr}`;
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
																	className='text-red-600 hover:text-red-800 dark:text-red-300 dark:hover:text-red-200 text-xs bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/30 px-2 py-1 rounded transition-colors no-underline'>
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
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}

export default EcosystemContractsTabs;
