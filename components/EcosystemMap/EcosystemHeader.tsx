import React from 'react';

interface EcosystemHeaderProps {
	searchTerm: string;
	setSearchTerm: (val: string) => void;
}

export default function EcosystemHeader({ searchTerm, setSearchTerm }: EcosystemHeaderProps) {
	return (
		<div className='bg-black text-white px-6 py-10'>
			<h1 className='text-4xl font-bold'>Sei Ecosystem Map</h1>
			<p className='mt-2 max-w-2xl text-gray-300'>
				Sei Ecosystem is the epicenter of technological advancement, bringing together creative minds and industry leaders to drive the future of Sei’s blockchain
				technology.
			</p>
			<div className='mt-6 flex flex-wrap gap-4'>
				<a
					href='/'
					className='inline-flex items-center justify-center rounded-md border-2 border-white px-4 py-2 text-white hover:bg-white hover:text-black transition-colors'>
					Start Building
				</a>
				<a
					href='https://sei-forms.typeform.com/join-ecosystem?typeform-source=p12rt1ecint.typeform.com'
					target='_blank'
					rel='noopener noreferrer'
					className='inline-flex items-center justify-center rounded-md border-2 border-white px-4 py-2 text-white hover:bg-white hover:text-black transition-colors'>
					Join the Ecosystem
				</a>
			</div>
			<div className='mt-8 max-w-md'>
				<input
					type='search'
					placeholder='Search for apps...'
					value={searchTerm}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
					className='w-full px-4 py-2 bg-black text-white border-2 border-red-600 rounded-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-black'
				/>
			</div>
		</div>
	);
}
