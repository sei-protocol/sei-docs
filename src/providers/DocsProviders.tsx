'use client';

import { Layout, Navbar } from 'nextra-theme-docs';
import { AskAI } from '../components';
import { Logo, LogoMobile } from '../components/Logo';
import React, { useState, useEffect } from 'react';
import { Footer } from '../components/Footer/Footer';
import { Theme } from '@radix-ui/themes';
import { Search } from 'nextra/components';
import { ThemeSwitch } from 'nextra-theme-docs';
import { usePathname } from 'next/navigation';

export default function DocsProviders({ children, pageMap }) {
	const [isMobile, setIsMobile] = useState(true);

	useEffect(() => {
		const checkIfMobile = () => {
			setIsMobile(window.innerWidth < 768);
		};

		checkIfMobile();
		window.addEventListener('resize', checkIfMobile);

		return () => window.removeEventListener('resize', checkIfMobile);
	}, []);

	if (!pageMap) return <div className='bg-neutral-950 h-full w-full' />;

	const ConditionalNavbar = () => {
		const pathname = usePathname();
		const isHomepage = pathname === '/' || pathname === '/index';

		return isMobile ? (
			<>
				<Navbar
					logo={<LogoMobile />}
					logoLink='/'
					className='flex items-center w-full dark:bg-neutral-900 bg-neutral-100'
					children={
						<>
							<div className='flex items-center gap-2'>
								<a
									href='https://support.sei.io/hc/en-us'
									target='_blank'
									rel='noopener noreferrer'
									className='order-1 text-sm hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors'
									style={{ textDecoration: 'none' }}>
									Support
								</a>
								<AskAI className='order-2' />
								<div className='order-3'>
									<Search placeholder='Search docs...' />
								</div>
							</div>
						</>
					}
				/>
			</>
		) : (
			<Navbar
				logo={<Logo />}
				logoLink='/'
				/* Remove excessive horizontal padding on small/medium screens; restore on large */
				className='flex items-center w-full dark:bg-neutral-900 bg-neutral-100 px-2 lg:px-4'
				children={
					<div className='flex items-center gap-4 w-full'>
						<div className='ml-auto flex items-center gap-4'>
							<a
								href='https://support.sei.io/hc/en-us'
								target='_blank'
								rel='noopener noreferrer'
								className='text-sm hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors'
								style={{ textDecoration: 'none' }}>
								Support
							</a>
							<AskAI />
							<div>
								<Search placeholder='Search docs...' />
							</div>
							{isHomepage && <ThemeSwitch />}
						</div>
					</div>
				}
			/>
		);
	};

	return (
		<>
			<Layout
				docsRepositoryBase='https://github.com/sei-protocol/sei-docs/tree/main'
				sidebar={{ defaultMenuCollapseLevel: 1, toggleButton: true }}
				editLink='Edit this page'
				feedback={{ content: 'Question? Give us feedback →', labels: 'https://github.com/sei-protocol/sei-docs/issues/new' }}
				footer={<Footer />}
				darkMode={true}
				search={null}
				nextThemes={{ attribute: 'class', defaultTheme: 'system' }}
				pageMap={pageMap}>
				{isMobile && <ConditionalNavbar />}
				<Theme accentColor='red' grayColor='gray' scaling='100%'>
					{!isMobile && <ConditionalNavbar />}
					{children}
				</Theme>
			</Layout>
		</>
	);
}
