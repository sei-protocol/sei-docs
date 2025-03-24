'use client';
import Link from 'next/link';
import Head from 'next/head';

export default function Custom404() {
	return (
		<>
			<Head>
				<meta name='robots' content='noindex, nofollow' />
			</Head>
			<div className='flex flex-col items-center justify-center min-h-screen px-4 bg-white text-black dark:bg-black dark:text-white'>
				<div className='flex items-center space-x-6 mb-8'>
					<h1 className='text-3xl font-bold'>404</h1>
					<div className='h-16 w-px bg-black dark:bg-white'></div>
					<p className='text-xl'>This page could not be found.</p>
				</div>

				<Link
					href='/'
					className='px-6 py-3 mt-6 rounded-md font-medium transition-colors bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200'>
					Go to Home
				</Link>
			</div>
		</>
	);
}
