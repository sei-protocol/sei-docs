'use client';

import React from 'react';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';

interface CollapsibleProps {
	title: string;
	icon?: React.ReactNode;
	children: React.ReactNode;
}

export function Collapsible({ title, icon, children }: CollapsibleProps) {
	return (
		<details className='border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden mb-4 group'>
			<summary className='p-4 flex items-center justify-between bg-neutral-50 dark:bg-neutral-900 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer'>
				<div className='flex items-center'>
					{icon}
					<span className='font-semibold ml-2'>{title}</span>
				</div>
				<div className='flex items-center'>
					<IconChevronDown className='w-5 h-5 text-neutral-500 group-open:hidden' />
					<IconChevronUp className='w-5 h-5 text-neutral-500 hidden group-open:block' />
				</div>
			</summary>
			<div className='p-4 bg-white dark:bg-neutral-900'>{children}</div>
		</details>
	);
}
