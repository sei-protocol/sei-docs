'use client';

import { useEffect, useState } from 'react';
import { groupBy } from 'underscore';
import { EcosystemSection, EcosystemSkeleton } from '.';
import { EcosystemItem, EcosystemResponse, getSeiEcosystemAppsData } from '../../data/ecosystemData';

interface EcosystemDynamicSectionProps {
	category: string;
	searchTerm: string | undefined;
}

export default function EcosystemDynamicSection({ category, searchTerm }: EcosystemDynamicSectionProps) {
	const [apps, setApps] = useState<EcosystemItem[] | null>(null);
	const [loading, setLoading] = useState(true);
	const [activeSubCat, setActiveSubCat] = useState<string | null>(null);

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

	if (loading) {
		return <EcosystemSkeleton />;
	}

	if (!apps) {
		return <EcosystemSkeleton />;
	}

	const activeApps = activeSubCat && grouped[activeSubCat] ? grouped[activeSubCat] : [];

	return (
		<div className='mt-4'>
			<div className='flex gap-4 overflow-x-auto pb-2 mb-4'>
				{subCats.map((sc) => {
					const isActive = sc === activeSubCat;
					return (
						<button
							key={sc}
							onClick={() => setActiveSubCat(sc)}
							className={`whitespace-nowrap px-3 py-1 rounded-sm text-sm font-medium transition-colors ${
								isActive ? 'bg-gray-700 text-white' : 'bg-gray-800 text-gray-200 hover:bg-gray-700'
							}`}>
							{sc}
						</button>
					);
				})}
			</div>
			<EcosystemSection apps={activeApps} />
		</div>
	);
}
