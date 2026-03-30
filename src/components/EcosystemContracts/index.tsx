'use client';

import { useMemo } from 'react';
import EcosystemContractsTabs from './TabsView';
import { ECOSYSTEM_CONTRACTS_DATA } from './ecosystem-contracts-data';

export function RemoteSheetData() {
	const groupedData = useMemo(() => {
		const groups: Record<string, Record<string, string>[]> = {};
		for (const row of ECOSYSTEM_CONTRACTS_DATA) {
			const key = row.Protocol;
			if (!groups[key]) groups[key] = [];
			groups[key].push(row);
		}
		return Object.entries(groups).map(([projectName, contracts]) => ({
			projectName,
			contracts,
			contractCount: contracts.length
		}));
	}, []);

	if (groupedData.length === 0) {
		return (
			<div className='my-4 p-4 border border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 text-sm'>
				No contract data available.
			</div>
		);
	}

	return (
		<div className='my-6'>
			<div className='sheet-content'>
				<EcosystemContractsTabs groupedData={groupedData} nameKey='Contract Name' addressKey='Contract Address' />
			</div>
		</div>
	);
}
