'use client';

import { Layout, Navbar } from 'nextra-theme-docs';
import dynamic from 'next/dynamic';
import { AskAIAssistant } from '../components/AskAIAssistant/AskAIAssistant';
import { Logo, LogoMobile } from '../components/Logo';
import { useState, useEffect } from 'react';
import { Footer } from '../components/Footer/Footer';
import { Theme } from '@radix-ui/themes';
import { ThemeSwitch } from 'nextra-theme-docs';
import { usePathname } from 'next/navigation';
import { Snowflakes, Confetti } from '../components/SeasonalEffects';

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
		setIsMobile((prev) => (prev !== mql.matches ? mql.matches : prev));
		mql.addEventListener('change', onChange);
		return () => mql.removeEventListener('change', onChange);
	}, []);

	if (!pageMap) return <div className='bg-black h-full w-full' />;

	const ConditionalNavbar = () => {
		const pathname = usePathname();
		const isHomepage = pathname === '/' || pathname === '/index';

		return isMobile ? (
			<Navbar
				logo={<LogoMobile />}
				logoLink='/'
				className='sei-nav flex items-center w-full'
				children={
					<div className='flex items-center gap-2'>
						<AskAIAssistant />
						<SearchDynamic placeholder='Search...' />
					</div>
				}
			/>
		) : (
			<Navbar
				logo={<Logo />}
				logoLink='/'
				className='sei-nav flex items-center justify-between w-full px-4 lg:px-8'
				children={
					<div className='sei-nav flex items-center justify-between gap-6'>
						<div className='flex-grow flex justify-start'>
							<AskAIAssistant />
						</div>
						<SearchDynamic placeholder='Search...' />
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
				nextThemes={{ attribute: 'class', defaultTheme: 'dark' }}
				pageMap={pageMap}>
				{isMobile && <ConditionalNavbar />}
				<Theme accentColor='red' grayColor='gray' scaling='100%'>
					<Snowflakes />
					<Confetti />
					{!isMobile && <ConditionalNavbar />}
					<div className='relative z-10'>{children}</div>
				</Theme>
			</Layout>
		</>
	);
}
