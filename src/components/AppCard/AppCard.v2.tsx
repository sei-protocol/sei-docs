import Image from 'next/image';
import { IconExternalLink } from '@tabler/icons-react';
import { EcosystemFieldData } from '../../data/ecosystemData';

interface AppCardV2Props {
	app: { fieldData: EcosystemFieldData };
}

export default function AppCardV2({ app }: AppCardV2Props) {
	if (!app) return null;

	const { name, logo, link, 'short-description': desc, 'integration-guide-link': integration, priority } = app.fieldData;

	const integrationGuideOverrides: Record<string, string> = {
		'The Graph': '/evm/indexer-providers/the-graph',
		'Covalent': '/evm/indexer-providers/goldrush',
		'Goldsky': '/evm/indexer-providers/goldsky',
		'Alchemy': '/evm/indexer-providers/alchemy',
		'Envio': 'https://docs.envio.dev/docs/HyperIndex/getting-started',
		'Sonarverse': 'https://docs.sonarplatform.io/',
		'Ormi': 'https://docs.orai.io/developer-guides/overview/subquery'
	};

	const finalIntegrationLink = integrationGuideOverrides[name] || integration;
	const isExternalLink = finalIntegrationLink && !finalIntegrationLink.startsWith('/');
	const linkText = isExternalLink ? 'Documentation' : 'Integration Guide';

	if (!logo) return null;

	return (
		<div className='group relative overflow-hidden transition-all duration-300 ease-out transform-gpu will-change-transform hover:scale-[1.02] hover:shadow-xl hover:shadow-black/10 dark:hover:shadow-black/30 rounded-xl border backdrop-blur-sm bg-neutral-50/80 dark:bg-neutral-900/80 border-neutral-200/50 dark:border-neutral-800/50 hover:bg-white dark:hover:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700 p-5 h-full flex flex-col'>
			<div className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-white/10 via-transparent to-transparent dark:from-white/5 dark:via-transparent dark:to-transparent pointer-events-none rounded-xl' />
			
			<div className='absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-700 bg-gradient-to-r from-red-900/15 via-red-800/10 to-red-900/15 dark:from-red-800/20 dark:via-red-700/15 dark:to-red-800/20 blur-sm -z-10 transform scale-105' />
			
			<div className='flex flex-col gap-4 relative z-10'>
				<div className='flex items-start justify-between'>
					<figure className='w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-neutral-200/50 dark:bg-neutral-800/50 group-hover:bg-red-900/10 dark:group-hover:bg-red-800/20 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 flex items-center justify-center'>
						<Image 
							src={logo.url} 
							alt={name} 
							width={48} 
							height={48} 
							className='object-cover w-full h-full transform transition-all duration-300 group-hover:scale-110' 
						/>
					</figure>
				</div>
				
				<div className='flex flex-col gap-2 flex-grow'>
					<h3 className='text-base font-bold text-neutral-800 dark:text-neutral-200 group-hover:text-red-800 dark:group-hover:text-red-300 transition-colors duration-300 leading-tight'>{name}</h3>
					{desc && (
						<p className='text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed line-clamp-2 flex-grow'>
							{desc}
						</p>
					)}
				</div>
				
				{finalIntegrationLink && (
					<div className='flex items-center mt-auto pt-2'>
						<a
							href={finalIntegrationLink}
							target={isExternalLink ? '_blank' : '_self'}
							rel={isExternalLink ? 'noopener noreferrer' : undefined}
							className='inline-flex items-center gap-1.5 text-sm font-medium text-red-800 dark:text-red-300 hover:text-red-900 dark:hover:text-red-200 transition-colors duration-200 group/link'
						>
							<span>{linkText}</span>
							<IconExternalLink 
								size={14} 
								className="transition-all duration-300 group-hover/link:ml-1 group-hover/link:scale-110" 
							/>
						</a>
					</div>
				)}
				
				<div className="w-full h-0.5 bg-gradient-to-r from-transparent via-red-800/20 dark:via-red-300/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
			</div>
		</div>
	);
}
