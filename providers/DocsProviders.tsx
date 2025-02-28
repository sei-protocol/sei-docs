import { Layout, Navbar } from 'nextra-theme-docs';
import { AskCookbook, Logo } from '../components';
import React from 'react';
import { Footer } from '../components/Footer/Footer';
import { Theme } from '@radix-ui/themes';
import { Search } from 'nextra/components';

export default function DocsProviders({ children, pageMap }) {
	if (!pageMap) return <div className='bg-neutral-950 h-full w-full' />;

	return (
		<Layout
			docsRepositoryBase='https://github.com/sei-protocol/sei-docs/tree/main'
			sidebar={{ defaultMenuCollapseLevel: 1, toggleButton: true }}
			editLink='Edit this page'
			feedback={{ content: 'Question? Give us feedback →', labels: 'https://github.com/sei-protocol/sei-docs/issues/new' }}
			footer={<Footer />}
			darkMode={true}
			search={null}
			nextThemes={{ attribute: 'class' }}
			navbar={
				<Navbar
					logo={<Logo />}
					logoLink='/'
					className='flex items-center justify-between px-4 w-full'
					children={
						<div className='flex items-center justify-between gap-4'>
							<AskCookbook />
							<Search placeholder='Search docs...' />
						</div>
					}
				/>
			}
			pageMap={pageMap}>
			<Theme accentColor='red' grayColor='gray' scaling='100%'>
				{children}
			</Theme>
		</Layout>
	);
}
