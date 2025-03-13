'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { IconArrowRight } from '@tabler/icons-react';
import GlobalStyles from './GlobalStyles';

interface QuickStartCardProps {
	title: string;
	href: string;
	icon?: ReactNode;
	description?: string;
}

export const QuickStartCard = ({ title, href, icon, description }: QuickStartCardProps) => {
	const isExternalLink = href.startsWith('http');

	const CardContent = () => (
		<div className='p-4 h-full relative overflow-hidden'>
			<div className='absolute inset-0 bg-white/60 dark:bg-neutral-900/60 opacity-80'></div>
			<div className='absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-red-7/30 via-red-7/10 to-transparent'></div>
			<div className='relative flex items-start'>
				{icon && (
					<div className='flex-shrink-0 mr-3'>
						<div className='w-9 h-9 rounded-full bg-neutral-100/80 dark:bg-neutral-800/80 flex items-center justify-center transform group-hover:bg-red-7/10 dark:group-hover:bg-red-7/20 transition-colors duration-300'>
							{icon}
						</div>
					</div>
				)}
				<div className='flex-grow'>
					<h3 className='text-sm font-medium mb-1 text-neutral-800 dark:text-neutral-200 group-hover:text-red-9 dark:group-hover:text-red-7 transition-colors duration-300'>
						{title}
					</h3>
					{description && <p className='text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2'>{description}</p>}
				</div>
			</div>
			<div className='absolute bottom-3 right-3 opacity-50 group-hover:opacity-100 transition-opacity duration-300'>
				<IconArrowRight className='w-3 h-3 text-red-9 dark:text-red-7' />
			</div>
		</div>
	);

	const cardClasses =
		'quick-start-card block w-full h-full backdrop-blur-sm bg-white/70 dark:bg-neutral-900/60 border border-neutral-200/40 dark:border-neutral-800/40 rounded-lg shadow-sm hover:shadow transition-all duration-300 group hover:border-red-9/20 dark:hover:border-red-7/20 relative overflow-hidden';

	if (isExternalLink) {
		return (
			<a href={href} target='_blank' rel='noopener noreferrer' className={cardClasses}>
				<CardContent />
			</a>
		);
	}

	return (
		<Link href={href} className={cardClasses}>
			<CardContent />
		</Link>
	);
};

export const QuickStartCardContainer = ({ children }: { children: ReactNode }) => {
	return <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 my-4'>{children}</div>;
};

export { GlobalStyles };
export default QuickStartCard;
