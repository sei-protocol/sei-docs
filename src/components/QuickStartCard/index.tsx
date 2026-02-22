'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { IconArrowRight } from '@tabler/icons-react';

interface QuickStartCardProps {
	title: string;
	href: string;
	icon?: ReactNode;
	description?: string;
}

export function QuickStartCard({ title, href, icon, description }: QuickStartCardProps) {
	const isExternalLink = href.startsWith('http');

	const CardContent = () => (
		<div className='p-4 h-full relative overflow-hidden'>
			<div className='absolute inset-0 bg-white/60 dark:bg-neutral-900/60 opacity-80'></div>
			<div className='absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-sei-maroon-100/30 via-sei-maroon-100/10 to-transparent'></div>
			<div className='relative flex items-start'>
				{icon && (
					<div className='flex-shrink-0 mr-3'>
						<div className='w-9 h-9 rounded-full bg-neutral-100/80 dark:bg-neutral-800/80 flex items-center justify-center transform group-hover:bg-sei-maroon-100/10 dark:group-hover:bg-sei-maroon-100/20 transition-colors duration-300'>
							{icon}
						</div>
					</div>
				)}
				<div className='flex-grow'>
					<h3 className='text-sm font-medium mb-1 text-neutral-800 dark:text-neutral-200 group-hover:text-sei-maroon-100 dark:group-hover:text-sei-maroon-25 transition-colors duration-300'>
						{title}
					</h3>
					{description && <p className='text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2'>{description}</p>}
				</div>
			</div>
			<div className='absolute bottom-3 right-3 opacity-50 group-hover:opacity-100 transition-opacity duration-300'>
				<IconArrowRight className='w-3 h-3 text-sei-maroon-100 dark:text-sei-maroon-25 group-hover:text-sei-maroon-100 dark:group-hover:text-sei-maroon-25' />
			</div>
		</div>
	);

	const cardClasses =
		'block w-full h-full backdrop-blur-sm bg-white/70 dark:bg-neutral-900/60 border border-neutral-200/40 dark:border-neutral-800/40 rounded-sm shadow-sm hover:shadow transition-all duration-300 group hover:border-sei-maroon-100/20 dark:hover:border-sei-maroon-100/20 relative overflow-hidden hover:-translate-y-[1px] animate-fadeIn odd:animate-fadeIn-400 even:animate-fadeIn-500 [&:nth-child(3n)]:animate-fadeIn-600';

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
}

export function QuickStartCardContainer({ children }: { children: ReactNode }) {
	return <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 my-4'>{children}</div>;
}

export default QuickStartCard;
