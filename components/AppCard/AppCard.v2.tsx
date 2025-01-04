import { ExternalLinkIcon } from 'lucide-react';
import Image from 'next/image';
import type { EcosystemItem } from '../../data/ecosystemData';

interface AppCardProps {
  app: EcosystemItem;
}

const AppCardV2 = ({ app }: AppCardProps) => {
	if (!app) return null;
	const fields = app.fieldData;
	const { name, logo, link, 'integration-guide-link': integration, 'short-description': shortDescription } = fields;
	if (!logo) {
		return null;
	}
	return (
		<div className='group flex flex-col'>
			<div className='border dark:border-gray-800 rounded-lg  overflow-hidden flex flex-row lg:flex-col grow h-ull'>
				<div className='relative overflow-hidden grid place-items-center aspect-square border-r lg:border-b lg:border-r-0 dark:border-gray-800'>
					<a href={link} rel='noopener noreferrer' target='_blank' className='group'>
						<Image src={logo.url} alt={`${name} logo`} width={300} height={300} className='transition-all group-hover:scale-[1.15]' />
					</a>
				</div>
				<div className='px-3 pt-2 pb-3 bg-gray-100 dark:bg-gray-800 w-full flex flex-col grow space-y-1'>
					<h3 className='text-lg font-semibold inline-flex items-center gap-2' title={name}>
						{name}
					</h3>
					{shortDescription && (
						<p className='opacity-75 text-sm line-clamp-4' title={shortDescription}>
							{shortDescription}
						</p>
					)}
					{integration && (
						<a
							href={integration}
							rel='noopener noreferrer'
							target='_blank'
							className='inline-flex items-center gap-2 bg-black text-white dark:bg-white dark:text-black px-3 py-1 self-start rounded-lg mt-2 text-sm font-medium tracking-tight'>
							Integration <ExternalLinkIcon className='inline-block w-3 h-4 hover:underline' />
						</a>
					)}
				</div>
			</div>
		</div>
	);
};

export default AppCardV2;
