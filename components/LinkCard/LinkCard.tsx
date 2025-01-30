import React, { type ReactNode } from 'react';
import Link from 'next/link';

interface LinkCardProps {
	title: string;
	link: string;
	description?: string;
	icon?: ReactNode;
}

export default function LinkCard({ title, link, description, icon }: LinkCardProps) {
	return (
		<div className='relative h-full'>
			<Link
				href={link}
				className='block h-full overflow-hidden rounded-lg bg-black text-white transition-transform duration-200 hover:scale-[1.02] border border-white/20 hover:border-white/30'>
				<div className='relative h-full p-6'>
					{icon && <div className='text-white/80 text-xl'>{icon}</div>}

					<div className='mt-4'>
						<h3 className='text-base font-normal text-white mb-2'>{title}</h3>
						{description && <p className='text-sm text-white/60 leading-relaxed'>{description}</p>}
					</div>

					<div className='mt-4 text-sm text-white/60'>Build Now</div>
				</div>
			</Link>
		</div>
	);
}
