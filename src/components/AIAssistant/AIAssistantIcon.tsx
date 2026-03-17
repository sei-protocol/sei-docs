'use client';

export function AIAssistantIcon({ size = 18 }: { size?: number }) {
	return (
		<svg width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'>
			<path d='M12 2a7 7 0 0 1 7 7c0 3-1.5 5-4 6.5V18a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-2.5C6.5 14 5 12 5 9a7 7 0 0 1 7-7z' />
			<path d='M9 22h6' />
			<path d='M10 2v1' />
			<path d='M14 2v1' />
			<circle cx='10' cy='9' r='1' fill='currentColor' stroke='none' />
			<circle cx='14' cy='9' r='1' fill='currentColor' stroke='none' />
		</svg>
	);
}
