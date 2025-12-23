'use client';

import React from 'react';
import Snowfall from 'react-snowfall';

export const Snowflakes = () => {
	return (
		<Snowfall
			style={{
				position: 'fixed',
				width: '100vw',
				height: '100vh',
				zIndex: 50,
				pointerEvents: 'none'
			}}
			snowflakeCount={200}
		/>
	);
};
