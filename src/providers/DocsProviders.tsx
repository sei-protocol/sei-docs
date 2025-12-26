'use client';

import { Layout, Navbar } from 'nextra-theme-docs';
import dynamic from 'next/dynamic';
import { AskAIAssistant } from '../components/AskAIAssistant/AskAIAssistant';
import { Logo, LogoMobile } from '../components/Logo';
import React, { useState, useEffect } from 'react';
import { Footer } from '../components/Footer/Footer';
import { Theme } from '@radix-ui/themes';
import { ThemeSwitch } from 'nextra-theme-docs';
import { usePathname } from 'next/navigation';
import { Snowflakes } from '../components/Snowflakes/Snowflakes';
import { Confetti } from '../components/Confetti/Confetti';
import { ENABLE_CHRISTMAS_THEME, ENABLE_NEW_YEAR_THEME } from '../constants/featureFlags';

// Defer Nextra Search until user clicks the trigger (client-only wrapper)
const SearchDynamic = dynamic(() => import('../components/NextraSearch/NextraSearch'), { ssr: false, loading: () => <div /> });

export default function DocsProviders({ children, pageMap }) {
	const [isMobile, setIsMobile] = useState(() => {
		if (typeof window === 'undefined') return true;
		return window.matchMedia('(max-width: 767px)').matches;
	});

	useEffect(() => {
		const mql = window.matchMedia('(max-width: 767px)');
		const onChange = (e) => {
			setIsMobile((prev) => (prev !== e.matches ? e.matches : prev));
		};
		// Sync once on mount without forcing extra renders if unchanged
		setIsMobile((prev) => (prev !== mql.matches ? mql.matches : prev));
		mql.addEventListener('change', onChange);
		return () => mql.removeEventListener('change', onChange);
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
								<AskAIAssistant />
								<SearchDynamic placeholder='Search docs...' />
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
				className='flex items-center justify-between w-full dark:bg-neutral-900 bg-neutral-100 px-2 lg:px-4'
				children={
					<div className='flex items-center justify-between gap-4'>
						<div className='flex-grow flex justify-start'>
							<AskAIAssistant />
						</div>
						<SearchDynamic placeholder='Search docs...' />
						{isHomepage && <ThemeSwitch />}
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
					{ENABLE_CHRISTMAS_THEME && <Snowflakes />}
					{ENABLE_NEW_YEAR_THEME && <Confetti />}
					<div className='relative z-10'>
						{!isMobile && <ConditionalNavbar />}
						{children}
					</div>
				</Theme>
			</Layout>
		</>
	);
}
