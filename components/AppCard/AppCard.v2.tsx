import { IconLink } from '@tabler/icons-react';
import Image from 'next/image';
import type { EcosystemItem } from '../../data/ecosystemData';
import Link from 'next/link';

interface AppCardV2Props {
	app: EcosystemItem;
}

export default function AppCardV2({ app }: AppCardV2Props) {
	if (!app) return null;

	const { name, logo, link, 'short-description': desc, 'integration-guide-link': integration } = app.fieldData;

	if (!logo) return null;

	return (
		<a
			href={link || '#'}
			target='_blank'
			rel='noopener noreferrer'
			className='group flex flex-col w-[250px] min-h-[330px] h-fit flex-shrink-0 bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-lg overflow-hidden transition-transform hover:opacity-80'>
			<div className='relative flex items-center justify-center aspect-square border-b border-b-neutral-300 dark:border-b-neutral-800'>
				<Image src={logo.url} alt={name} width={250} height={250} className='mx-auto transition-transform max-h-[250px]' />
			</div>

			<div className='p-4 flex flex-col justify-between grow'>
				<h3 className='text-md font-semibold flex items-center gap-2'>{name}</h3>
				{desc && <p className='text-sm opacity-75'>{desc}</p>}

				{integration && (
					<Link
						href={integration}
						target='_blank'
						rel='noopener noreferrer'
						className='text-black mt-2 inline-flex items-center gap-1 px-2 py-1 bg-white border border-neutral-200 dark:border-neutral-800 text-sm rounded hover:opacity-80 transition-opacity'>
						Integration Guide <IconLink className='w-4 h-4' />
					</Link>
				)}
			</div>
		</a>
	);
}
