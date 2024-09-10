import AppCardV2 from '../AppCard/AppCard.v2';

const EcosystemSection = ({ apps }: { apps: any[] }) => {
	return (
		<div className='grid grid-cols-2 lg:grid-cols-4 gap-6 mt-8'>
			{apps.map((app) => {
				return <AppCardV2 key={app.id} app={app} />;
			})}
		</div>
	);
};

export default EcosystemSection;
