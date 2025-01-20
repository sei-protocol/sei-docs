import { ExternalLinkIcon } from 'lucide-react';
import Image from 'next/image';
import type { EcosystemItem } from '../../data/ecosystemData';

interface AppCardV2Props {
	app: EcosystemItem;
}

export default function AppCardV2({ app }: AppCardV2Props) {
	if (!app) return null;
	const { name, logo, link, 'short-description': desc, 'integration-guide-link': integration } = app.fieldData;

	if (!logo) return null;

	return (
		<div className='group flex flex-col w-[180px] flex-shrink-0 rounded-lg overflow-hidden bg-[#121212] border border-[#2c2c2c] hover:border-[#424242] transition-colors'>
			<div className='relative aspect-square flex items-center justify-center bg-black'>
				{link ? (
					<a href={link} target='_blank' rel='noopener noreferrer'>
						<Image src={logo.url} alt={`${name} logo`} width={100} height={100} className='p-4 mx-auto transition-transform group-hover:scale-105' />
					</a>
				) : (
					<Image src={logo.url} alt={`${name} logo`} width={100} height={100} className='p-4 mx-auto' />
				)}
			</div>
			<div className='p-3 text-white flex flex-col gap-1'>
				<h3 className='text-sm font-semibold line-clamp-1' title={name}>
					{name}
				</h3>
				{desc && <p className='text-xs text-gray-300 line-clamp-3'>{desc}</p>}
				{integration && (
					<a
						href={integration}
						target='_blank'
						rel='noopener noreferrer'
						className='mt-2 inline-flex items-center gap-1 px-2 py-1 bg-white text-black text-xs rounded hover:opacity-80 transition-opacity'>
						Integration
						<ExternalLinkIcon className='w-3 h-3' />
					</a>
				)}
			</div>
		</div>
	);
}
