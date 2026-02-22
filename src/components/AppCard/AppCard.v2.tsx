import Image from 'next/image';
import { IconExternalLink, IconWorld } from '@tabler/icons-react';
import { EcosystemFieldData } from '../../data/ecosystemData';

interface AppCardV2Props {
	app?: { fieldData: EcosystemFieldData };
	title?: string;
	description?: string;
	href?: string;
	icon?: React.ReactNode;
	logoUrl?: string;
}

export default function AppCardV2({ app, title, description, href, icon, logoUrl: logoUrlOverride }: AppCardV2Props) {
	if (!app && !title) return null;

	let name = title;
	let desc = description;
	let finalIntegrationLink = href;
	let logoUrl: string | undefined = logoUrlOverride;
	let linkText = 'Visit Website';

	if (app) {
		const { name: appName, logo, link, 'short-description': appDesc, 'integration-guide-link': integration } = app.fieldData;
		name = appName;
		desc = appDesc;
		logoUrl = logoUrlOverride || logo?.url;

		const integrationGuideOverrides: Record<string, string> = {
			'The Graph': '/evm/indexer-providers/the-graph',
			Covalent: '/evm/indexer-providers/goldrush',
			Goldsky: '/evm/indexer-providers/goldsky',
			Alchemy: '/evm/indexer-providers/alchemy'
		};

		finalIntegrationLink = integrationGuideOverrides[appName] || integration;
		const isExternalLinkData = finalIntegrationLink && !finalIntegrationLink.startsWith('/');
		linkText = isExternalLinkData ? 'Documentation' : 'Integration Guide';

		if (!logoUrl) return null;
	}

	const isExternalLink = finalIntegrationLink && !finalIntegrationLink.startsWith('/');

	return (
		<div className='group relative overflow-hidden transition-all duration-300 ease-out transform-gpu will-change-transform hover:scale-[1.02] hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/30 rounded-sm border backdrop-blur-sm bg-neutral-50/80 dark:bg-neutral-900/80 border-neutral-200/50 dark:border-neutral-800/50 hover:bg-white dark:hover:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700 p-5 h-full flex flex-col'>
			<div className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/10 via-transparent to-transparent dark:from-white/5 dark:via-transparent dark:to-transparent pointer-events-none rounded-sm' />

			<div className='absolute inset-0 rounded-sm opacity-0 group-hover:opacity-100 transition-all duration-700 bg-gradient-to-r from-sei-maroon-200/15 via-sei-maroon-200/10 to-sei-maroon-200/15 dark:from-sei-maroon-100/20 dark:via-sei-maroon-100/15 dark:to-sei-maroon-100/20 blur-sm -z-10 transform scale-105' />

			<div className='flex flex-col gap-4 relative z-10'>
				<div className='flex items-start justify-between'>
					<figure className='w-12 h-12 rounded-sm overflow-hidden flex-shrink-0 bg-neutral-200/50 dark:bg-neutral-800/50 group-hover:bg-sei-maroon-200/10 dark:group-hover:bg-sei-maroon-100/20 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 flex items-center justify-center'>
						{logoUrl ? (
							<Image
								src={logoUrl}
								alt={name || ''}
								width={48}
								height={48}
								className='object-cover w-full h-full transform transition-all duration-300 group-hover:scale-110'
							/>
						) : (
							icon || <IconWorld className='text-neutral-500 group-hover:text-sei-maroon-100 transition-colors duration-300' size={24} />
						)}
					</figure>
				</div>

				<div className='flex flex-col gap-2 flex-grow'>
					<h3 className='text-base font-bold text-neutral-800 dark:text-neutral-200 group-hover:text-sei-maroon-200 dark:group-hover:text-sei-maroon-25 transition-colors duration-300 leading-tight'>
						{name}
					</h3>
					{desc && <p className='text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed line-clamp-2 flex-grow'>{desc}</p>}
				</div>

				{finalIntegrationLink && (
					<div className='flex items-center mt-auto pt-2'>
						<a
							href={finalIntegrationLink}
							target={isExternalLink ? '_blank' : '_self'}
							rel={isExternalLink ? 'noopener noreferrer' : undefined}
							className='inline-flex items-center gap-1.5 text-sm font-medium text-sei-maroon-200 dark:text-sei-maroon-25 hover:text-sei-maroon-200 dark:hover:text-sei-cream transition-colors duration-200 group/link'>
							<span>{linkText}</span>
							<IconExternalLink size={14} className='transition-all duration-300 group-hover/link:ml-1 group-hover/link:scale-110' />
						</a>
					</div>
				)}

				<div className='w-full h-0.5 bg-gradient-to-r from-transparent via-sei-maroon-200/20 dark:via-sei-maroon-25/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
			</div>
		</div>
	);
}
