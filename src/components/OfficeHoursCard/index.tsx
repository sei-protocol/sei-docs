'use client';

import { useEffect, useState } from 'react';
import { IconClock } from '@tabler/icons-react';

export const OfficeHoursCard = () => {
	const [localTime, setLocalTime] = useState('');

	useEffect(() => {
		const pacificTime = new Date();
		pacificTime.setUTCHours(17, 0, 0, 0);

		const localTimeString = pacificTime.toLocaleTimeString([], {
			hour: 'numeric',
			minute: '2-digit',
			timeZoneName: 'short'
		});

		setLocalTime(localTimeString);
	}, []);

	return (
		<a
			href='https://discord.gg/sei'
			target='_blank'
			rel='noopener noreferrer'
			className='my-6 block border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-xl shadow-sm transition-all duration-200 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-md group'>
			<div className='flex items-center gap-4 p-4'>
				<div className='bg-red-3 dark:bg-neutral-800 p-3 rounded-full flex-shrink-0 transition-all duration-200 group-hover:bg-red-4 dark:group-hover:bg-neutral-700'>
					<IconClock className='w-5 h-5 text-red-9 dark:text-red-7' />
				</div>
				<div>
					<h3 className='text-base font-medium text-neutral-900 dark:text-neutral-100 flex items-center'>
						<span>Developer Office Hours</span>
						<span className='ml-2 px-2 py-0.5 text-xs bg-red-3 dark:bg-neutral-800 rounded-full text-red-9 dark:text-red-7 border border-red-4 dark:border-neutral-700'>
							Weekly
						</span>
					</h3>
					<p className='text-sm text-neutral-600 dark:text-neutral-400'>Join our Discord every Wednesday @ 9 AM Pacific ({localTime})</p>
				</div>
			</div>
		</a>
	);
};

export default OfficeHoursCard;
