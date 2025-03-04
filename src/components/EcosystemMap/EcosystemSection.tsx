import type { EcosystemItem } from '../../data/ecosystemData';
import AppCardV2 from '../AppCard/AppCard.v2';

interface EcosystemSectionProps {
	apps: EcosystemItem[];
}

export function EcosystemSection({ apps }: EcosystemSectionProps) {
	if (!apps || apps.length === 0) {
		return <p className='text-gray-500 dark:text-gray-400 mt-4'>No results found.</p>;
	}

	return (
		<div className='overflow-x-auto'>
			<div className='flex gap-4 pb-2 flex-wrap'>
				{apps.map((app) => (
					<AppCardV2 key={app.id} app={app} />
				))}
			</div>
		</div>
	);
}

export default EcosystemSection;
