'use client';

import React from 'react';

export const GlobalStyles = () => {
	return (
		<style jsx global>{`
			.quick-start-card {
				transition: all 0.2s ease-out;
			}

			.quick-start-card:hover {
				transform: translateY(-1px);
			}

			@keyframes fadeIn {
				from {
					opacity: 0;
				}
				to {
					opacity: 1;
				}
			}

			.quick-start-card:hover svg {
				color: #e2333e;
				transition: color 0.3s ease;
			}

			.quick-start-card:nth-child(odd) {
				animation: fadeIn 0.4s ease-out;
			}

			.quick-start-card:nth-child(even) {
				animation: fadeIn 0.5s ease-out;
			}

			.quick-start-card:nth-child(3n) {
				animation: fadeIn 0.6s ease-out;
			}
		`}</style>
	);
};

export default GlobalStyles;
