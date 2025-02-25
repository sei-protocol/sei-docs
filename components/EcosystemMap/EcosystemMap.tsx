'use client';

import { useEffect, useState } from 'react';
import { groupBy } from 'underscore';
import { EcosystemSection, EcosystemSkeleton } from '.';
import { EcosystemItem, EcosystemResponse, getSeiEcosystemAppsData } from '../../data/ecosystemData';
import EcosystemSearchBar from './EcosystemSearchBar';

export default function EcosystemMap() {
	const [apps, setApps] = useState<EcosystemItem[] | null>(null);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');

	useEffect(() => {
		(async () => {
			try {
				const data: EcosystemResponse = await getSeiEcosystemAppsData();
				setApps(data.data);
			} catch (error) {
				console.error('Failed to fetch data:', error);
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	if (loading || !apps) {
		return <EcosystemSkeleton />;
	}

	const filteredApps = apps.filter((app) => {
		const fields = app.fieldData;
		const normalizedSearch = searchTerm.toLowerCase();
		const matchesName = fields.name?.toLowerCase().includes(normalizedSearch);
		const matchesMainCategory = fields.categorie?.toLowerCase().includes(normalizedSearch);
		const matchesSubCategory = fields['categorie-2']?.toLowerCase().includes(normalizedSearch);
		return matchesName || matchesMainCategory || matchesSubCategory;
	});

	const groupedApps = groupBy(filteredApps, (app) => app.fieldData.categorie);
	const mainCategories = Object.keys(groupedApps).sort();

	return (
		<div className='flex flex-col gap-8 mt-6'>
			<div className='text-center'>
				<h1 className='text-4xl font-extrabold mb-2'>Sei Ecosystem Map</h1>
				<p className='max-w-xl mx-auto text-gray-600 dark:text-gray-400'>
					Sei Ecosystem is the epicenter of technological advancement, bringing together creative minds and industry leaders to drive the future of Sei’s blockchain
					technology.
				</p>
				<div className='mt-5 flex flex-row justify-center gap-4'>
					<a href='#' className='px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-semibold'>
						Start Building
					</a>
					<a
						href='#'
						className='px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md hover:opacity-80 transition-opacity font-semibold'>
						Join the Ecosystem
					</a>
				</div>
			</div>
			<div className='max-w-md mx-auto w-full'>
				<EcosystemSearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
			</div>
			<div className='flex flex-col mt-4 gap-12'>
				{mainCategories.map((category) => {
					const appsInCategory = groupedApps[category];
					return (
						<div key={category}>
							<h2 className='text-3xl font-bold mb-6'>{category}</h2>
							<EcosystemSection apps={appsInCategory} />
						</div>
					);
				})}
			</div>
		</div>
	);
}
