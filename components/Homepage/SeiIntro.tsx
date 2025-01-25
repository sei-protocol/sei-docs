import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '../../public/assets/header.png';

export default function SeiIntro() {
	return (
		<section
			className='
      min-h-[25vh] 
      flex 
      flex-col 
      items-center 
      justify-center 
      text-center 
      p-8 
      pb-12 
      text-black 
      border-b 
      border-black/10 
      mb-8 
      dark:text-white 
      dark:border-white/10
    '>
			<div className='relative w-[600px] mb-6'>
				<Image src={Header} alt='Docs header' width={1728} height={875} priority />
			</div>

			<h2
				className='
        mb-2 
        font-semibold 
        text-[clamp(1.7rem,3vw,2.5rem)] 
        leading-[1.2] 
        text-black 
        dark:text-white
      '>
				Sei Documentation
			</h2>

			<p
				className='
        mb-6 
        text-base 
        text-[rgba(0,0,0,0.7)] 
        dark:text-[rgba(236,237,238,0.9)]
      '>
				Sei is the first parallelized EVM blockchain delivering unmatched scalability.
			</p>

			<div className='flex gap-8 justify-center items-center mt-4'>
				<Link
					href='/learn/user-quickstart'
					className='
            font-medium 
            flex 
            items-center 
            gap-1 
            border 
            border-black 
            text-black 
            hover:bg-[rgba(0,0,0,0.12)]
            p-2 
            rounded 
            dark:border-[#ecedee] 
            dark:text-[#ecedee] 
            dark:hover:bg-[rgba(236,237,238,0.12)]
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
            border-black 
            text-black 
            hover:bg-[rgba(0,0,0,0.12)]
            p-2 
            rounded 
            dark:border-[#ecedee] 
            dark:text-[#ecedee] 
            dark:hover:bg-[rgba(236,237,238,0.12)]
          '>
					About Sei
				</Link>
			</div>
		</section>
	);
}
