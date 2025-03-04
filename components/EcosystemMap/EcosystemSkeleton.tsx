export function EcosystemSkeleton() {
	return (
		<div className='flex flex-col gap-6 pt-8'>
			<div className='w-1/3 h-8 bg-neutral-200 dark:bg-neutral-800 rounded-md animate-pulse' />
			<div className='flex gap-4 overflow-x-auto'>
				{Array.from({ length: 3 }).map((_, i) => (
					<div key={i} className='w-[175px] min-h-[233px] bg-neutral-200 dark:bg-neutral-800 rounded-md animate-pulse flex-shrink-0' />
				))}
			</div>
		</div>
	);
}
