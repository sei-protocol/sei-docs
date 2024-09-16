import { useEffect, useState } from 'react';
import { EcosystemDocsCategory, EcosystemResponse, getSeiEcosystemAppByCategory } from '../../data/ecosystemData';
import { EcosystemSkeleton } from '../EcosystemMap';
import AppCardV2 from './AppCard.v2';

// TODO: need to operate on the description field and then display small grid of apps

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
			<div className='grid grid-cols-1 lg:grid-cols-4 gap-4 my-4'>
				{apps.map((app) => (
					<AppCardV2 key={app.id} app={app} />
				))}
			</div>
			<small className='opacity-75'>
				Projects listed here are developed by the Sei community. Inclusion on this site does not constitute endorsement. For questions related to each, please
				contact the project directly.
			</small>
		</div>
	);
}

export default AppCardsGridCategory;
