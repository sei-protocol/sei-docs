'use client';

import Link from 'next/link';

export default function NotFound() {
	return (
		<div className='mx-auto flex min-h-[60vh] max-w-2xl flex-col items-start gap-4 px-6 py-16 text-left sm:px-8'>
			<h1 className='text-3xl font-semibold text-neutral-900 dark:text-neutral-100'>Page not found</h1>
			<p className='text-neutral-600 dark:text-neutral-300'>
				The page you&apos;re looking for doesn&apos;t exist. Check the URL or return to the documentation home.
			</p>
			<Link href='/' className='rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-400'>
				Back to docs
			</Link>
		</div>
	);
}
