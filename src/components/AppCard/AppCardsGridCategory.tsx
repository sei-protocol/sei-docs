'use client';

import { EcosystemDocsCategory, EcosystemItem } from '../../data/ecosystemData';
import ecosystemData from '../../data/ecosystem-cache.json';
import AppCardV2 from './AppCard.v2';

// Ensure the data is typed correctly
const appsData = (ecosystemData as { data: EcosystemItem[] }).data;

function AppCardsGridCategory({ category }: { category: EcosystemDocsCategory }) {
	const apps = appsData.filter((app) => app.fieldData['docs-category'] === category);

	if (!apps || apps.length === 0) return null;

	return (
		<div>
			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-2'>
				{apps.map((app) => (
					<AppCardV2 key={app.id} app={app} />
				))}
			</div>
		</div>
	);
}

export default AppCardsGridCategory;
