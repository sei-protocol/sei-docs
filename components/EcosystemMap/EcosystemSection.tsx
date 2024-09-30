import _ from 'lodash';
import { EcosystemItem } from '../../data/ecosystemData';
import AppCardV2 from '../AppCard/AppCard.v2';

const EcosystemSection = ({ apps }: { apps: EcosystemItem[] }) => {
	const groupedApps = _.groupBy(apps, (app) => app.fieldData['categorie-2']);
	const keys = Object.keys(groupedApps);

	return (
		<section>
			{keys.map((key) => {
				return (
					<div key={key} className='flex flex-col gap-4 mt-12'>
						<h2 className='text-2xl font-semibold'>{key}</h2>
						<div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
							{groupedApps[key].map((app) => (
								<AppCardV2 key={app.id} app={app} />
							))}
						</div>
					</div>
				);
			})}
		</section>
	);
};

export default EcosystemSection;
