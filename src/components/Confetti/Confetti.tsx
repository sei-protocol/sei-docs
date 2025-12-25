'use client';

import React from 'react';
import ReactConfetti from 'react-confetti';
import { useWindowSize } from 'react-use';

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
		<ReactConfetti
			width={dimensions.width}
			height={dimensions.height}
			style={{
				position: 'fixed',
				zIndex: 50,
				pointerEvents: 'none'
			}}
			numberOfPieces={200}
			recycle={true}
		/>
	);
};
