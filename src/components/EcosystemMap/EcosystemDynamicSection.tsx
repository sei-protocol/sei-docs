'use client';

import { useEffect, useState } from 'react';
import { groupBy } from 'underscore';
import { EcosystemSection, EcosystemSkeleton } from './index';
import { EcosystemItem, EcosystemResponse, getSeiEcosystemAppsData } from '../../data/ecosystemData';
import { useAtomValue } from 'jotai/index';
import { searchTermAtom } from './EcosystemSearchBar';
import { Button } from '@radix-ui/themes';

interface EcosystemDynamicSectionProps {
	category: string;
}

export function EcosystemDynamicSection({ category }: EcosystemDynamicSectionProps) {
	const [apps, setApps] = useState<EcosystemItem[] | null>(null);
	const [loading, setLoading] = useState(true);
	const [activeSubCat, setActiveSubCat] = useState<string | null>(null);

	const searchTerm = useAtomValue(searchTermAtom);

	useEffect(() => {
		(async () => {
			try {
				const data: EcosystemResponse = await getSeiEcosystemAppsData();
				setApps(data.data);
			} catch (err) {
				console.error('Failed to fetch data:', err);
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	let subCats: string[] = [];
	let grouped: Record<string, EcosystemItem[]> = {};

	if (apps) {
		const catLower = category.toLowerCase();
		const categoryApps = apps.filter((app) => (app.fieldData.categorie?.toLowerCase() || '') === catLower);
		const normSearch = (searchTerm ?? '').toLowerCase();
		const filtered = categoryApps.filter((app) => {
			if (!normSearch) return true;
			const name = app.fieldData.name?.toLowerCase() || '';
			const subCat = app.fieldData['categorie-2']?.toLowerCase() || '';
			return name.includes(normSearch) || subCat.includes(normSearch);
		});
		grouped = groupBy(filtered, (a) => a.fieldData['categorie-2'] || 'Other');
		subCats = Object.keys(grouped).sort();
	}

	useEffect(() => {
		if (!apps) return;
		if (!activeSubCat && subCats.length > 0) {
			setActiveSubCat(subCats[0]);
		} else if (activeSubCat && !grouped[activeSubCat]) {
			setActiveSubCat(subCats[0] ?? null);
		}
	}, [apps, subCats, activeSubCat, grouped]);

	if (loading || !apps) {
		return <EcosystemSkeleton />;
	}

	const activeApps = activeSubCat && grouped[activeSubCat] ? grouped[activeSubCat] : [];

	return (
		<div className='mt-4'>
			<div className='flex gap-4 overflow-x-auto pb-2 mb-4'>
				{subCats.map((sc) => (
					<Button
						variant={sc === activeSubCat ? 'solid' : 'outline'}
						key={sc}
						onClick={() => setActiveSubCat(sc)}
						className={`whitespace-nowrap px-3 py-1 !rounded-full text-sm font-medium transition-colors`}>
						{sc}
					</Button>
				))}
			</div>
			<EcosystemSection apps={activeApps} />
		</div>
	);
}
