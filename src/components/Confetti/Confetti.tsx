'use client';

import React from 'react';
import ReactConfetti from 'react-confetti';

export const Confetti = () => {
	// We need window size for react-confetti to work properly full screen
	// If react-use is not available we might need a custom hook or just 100vw/100vh
	// Let's check if react-use is installed, otherwise fallback to CSS approach or basic hook

	const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });

	React.useEffect(() => {
		const updateDimensions = () => {
			setDimensions({
				width: window.innerWidth,
				height: window.innerHeight
			});
		};

		// Initial set
		updateDimensions();

		window.addEventListener('resize', updateDimensions);
		return () => window.removeEventListener('resize', updateDimensions);
	}, []);

	return (
		<div className='fixed inset-0 w-screen h-screen z-0 pointer-events-none'>
			<ReactConfetti width={dimensions.width} height={dimensions.height} numberOfPieces={50} recycle={true} />
		</div>
	);
};
