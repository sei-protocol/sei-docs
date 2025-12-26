'use client';

import React from 'react';
import Snowfall from 'react-snowfall';

export const Snowflakes = () => {
	return (
		<div className='fixed inset-0 w-screen h-screen z-0 pointer-events-none'>
			<Snowfall
				style={{
					position: 'absolute',
					width: '100%',
					height: '100%'
				}}
				snowflakeCount={150}
			/>
		</div>
	);
};
