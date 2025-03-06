import { Callout } from 'nextra/components';
import { Tag, appData } from '../../data/appData';
import AppCard from './AppCard';

const AppCardsGrid = ({ tags }: { tags?: Tag[] }) => {
	const filteredData = (() => {
		if (!tags) return appData;

		return appData.filter((app) => tags.some((tag) => app.tags.includes(tag)));
	})();

	return (
		<div>
			<Callout type='info'>
				<p>
					Projects listed here are developed by the Sei community. Inclusion on this site does not constitute endorsement. For questions related to each, please
					contact the project directly.
				</p>
			</Callout>
			<div className='grid grid-cols-1 lg:grid-cols-2 gap-4 my-4'>
				{filteredData.map((app, index) => (
					<AppCard key={index} app={app} />
				))}
			</div>
		</div>
	);
};

export default AppCardsGrid;
