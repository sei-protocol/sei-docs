'use client';

import { useEffect, useState } from 'react';
import { EcosystemDocsCategory, EcosystemResponse, getSeiEcosystemAppByCategory } from '../../data/ecosystemData';
import { EcosystemSkeleton } from '../EcosystemMap';
import AppCardV2 from './AppCard.v2';

function AppCardsGridCategory({ category }: { category: EcosystemDocsCategory }) {
	const [apps, setApps] = useState<EcosystemResponse['data']>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		getSeiEcosystemAppByCategory(category).then((res) => {
			const data = res.data;
			setApps(data);
			setLoading(false);
		});
	}, [category]);

	if (!apps || loading) return <EcosystemSkeleton />;

	if (apps.length === 0) return null;

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
