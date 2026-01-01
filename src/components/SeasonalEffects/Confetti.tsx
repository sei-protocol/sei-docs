'use client';

import ReactConfetti from 'react-confetti';

export const Confetti = () => {
	return (
		<div className='fixed inset-0 w-screen h-screen z-40 pointer-events-none'>
			<ReactConfetti
				style={{
					position: 'absolute',
					width: '100%',
					height: '100%'
				}}
				numberOfPieces={50}
				recycle={true}
			/>
		</div>
	);
};
