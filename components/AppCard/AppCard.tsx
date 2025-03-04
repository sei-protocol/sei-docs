import { IconLink } from '@tabler/icons-react';
import Image from 'next/image';
import { App } from '../../data/appData';

interface AppCardProps {
	app: App;
}
const AppCard = ({ app }: AppCardProps) => {
	if (!app) return null;
	const { title, description, href, image } = app;
	return (
		<a href={href} target='_blank' rel='noopener noreferrer' className='group flex flex-col'>
			<div className='border border-neutral-300 dark:border-neutral-800  bg-neutral-100 dark:bg-neutral-900 rounded-lg  overflow-hidden flex flex-row lg:flex-col grow h-full'>
				<div className='relative overflow-hidden grid place-items-center aspect-square lg:border-b-neutral-300 lg:aspect-video border-r lg:border-b lg:border-r-0 dark:border-neutral-800'>
					<div className='absolute z-10'>
						<Image src={image} alt={title} width={175} height={175} className='group-hover:scale-[0.85] scale-75 transition-all' />
					</div>
					<div className='opacity-50 h-full w-full blur-3xl overflow-hidden'>
						<Image src={image} alt={title} width={100} height={100} className='object-cover w-full h-full' />
					</div>
				</div>
				<div className='p-4 w-full flex flex-col grow'>
					<h3 className='text-lg font-semibold mb-2 inline-flex items-center gap-2'>
						{title} <IconLink className='inline-block w-4  h-4' />
					</h3>
					<p className='opacity-75'>{description}</p>
				</div>
			</div>
		</a>
	);
};

export default AppCard;
