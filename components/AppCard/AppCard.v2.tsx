import { ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { EcosystemItem } from '../../data/ecosystemData';

interface AppCardProps {
	app: EcosystemItem;
}
const AppCardV2 = ({ app }: AppCardProps) => {
	if (!app) return null;
	const fields = app.fieldData;
	const { name, logo, link } = fields;
	return (
		<a href={link} target='_blank' rel='noopener noreferrer' className='group flex flex-col'>
			<div className='border dark:border-gray-800 rounded-lg  overflow-hidden flex flex-row lg:flex-col grow h-ull'>
				<div className='relative overflow-hidden grid place-items-center aspect-square border-r lg:border-b lg:border-r-0 dark:border-gray-800'>
					<Image src={logo.url} alt={logo.alt} width={300} height={300} />
				</div>
				<div className='p-4 bg-gray-100 dark:bg-gray-800 w-full flex flex-col grow space-y-2'>
					<h3 className='text-lg font-semibold inline-flex items-center gap-2'>
						{name} <ExternalLink className='inline-block w-4  h-4' />
					</h3>
				</div>
			</div>
		</a>
	);
};

export default AppCardV2;
