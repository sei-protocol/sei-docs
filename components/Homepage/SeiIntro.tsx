import React from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import Header from '../../public/assets/header.png';

export default function SeiIntro() {
	return (
		<section
			className='
        w-full
        flex
        flex-col
        items-center
        justify-center
        text-center
        py-12
        px-4
        bg-transparent
        text-white
      '>
			{/* Smaller swirl */}
			<div className='relative w-[320px] mb-8 mx-auto'>
				<NextImage src={Header} alt='Docs header' width={800} height={800} priority className='w-full h-auto' />
			</div>

			<h1
				className='
          mb-3
          font-semibold
          text-4xl
          md:text-5xl
          leading-tight
        '>
				Sei Documentation
			</h1>

			<p
				className='
          mb-6
          text-base
          md:text-lg
          text-white/80
        '>
				Sei is the first parallelized EVM blockchain delivering unmatched scalability.
			</p>

			<div className='flex gap-6 justify-center items-center mt-4'>
				<Link
					href='/learn/user-quickstart'
					className='
            font-medium
            flex
            items-center
            gap-1
            border
            border-white
            text-white
            px-5
            py-2
            hover:bg-white/10
            transition-colors
          '>
					Quickstart
				</Link>

				<Link
					href='/learn/general-overview'
					className='
            font-medium
            flex
            items-center
            gap-1
            border
            border-white
            text-white
            px-5
            py-2
            hover:bg-white/10
            transition-colors
          '>
					About Sei
				</Link>
			</div>
		</section>
	);
}
