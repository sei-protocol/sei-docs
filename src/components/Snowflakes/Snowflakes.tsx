'use client';

import React, { useEffect, useState } from 'react';
import styles from './Snowflakes.module.css';

interface Snowflake {
	id: number;
	left: number;
	animationDuration: number;
	animationDelay: number;
	opacity: number;
	size: number;
}

export const Snowflakes = () => {
	const [snowflakes, setSnowflakes] = useState<Snowflake[]>([]);

	useEffect(() => {
		// Generate snowflakes only on client side to avoid hydration mismatch
		const flakes: Snowflake[] = Array.from({ length: 50 }).map((_, i) => ({
			id: i,
			left: Math.random() * 100,
			animationDuration: Math.random() * 3 + 5, // 5-8 seconds
			animationDelay: Math.random() * 5,
			opacity: Math.random() * 0.5 + 0.3,
			size: Math.random() * 10 + 10
		}));
		setSnowflakes(flakes);
	}, []);

	return (
		<div aria-hidden='true'>
			{snowflakes.map((flake) => (
				<div
					key={flake.id}
					className={styles.snowflake}
					style={{
						left: `${flake.left}vw`,
						animationDuration: `${flake.animationDuration}s`,
						animationDelay: `${flake.animationDelay}s`,
						opacity: flake.opacity,
						fontSize: `${flake.size}px`
					}}>
					❄
				</div>
			))}
		</div>
	);
};
