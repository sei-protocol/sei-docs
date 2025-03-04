'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
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
			className='mt-16 block bg-gradient-to-r from-[#9e1f19] to-red-700 text-white p-6 rounded-2xl shadow-lg flex items-center gap-4 border border-white/20 transition-transform duration-150 hover:scale-[1.02]'>
			<div className='bg-white/20 p-3 rounded-full'>
				<IconClock className='w-10 h-10 text-white' />
			</div>
			<div>
				<h2 className='text-2xl font-bold'>Developer Office Hours</h2>
				<p className='text-sm opacity-90'>Questions? Join us every week for office hours in the Sei Discord.</p>
				<p className='mt-2 font-medium'>📅 Wednesdays @ 9 AM Pacific ({localTime})</p>
			</div>
		</a>
	);
};

export default OfficeHoursCard;
