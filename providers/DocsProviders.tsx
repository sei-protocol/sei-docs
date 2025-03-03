'use client';

import { Layout, Navbar } from 'nextra-theme-docs';
import { AskCookbook, Logo } from '../components';
import React from 'react';
import { Footer } from '../components/Footer/Footer';
import { Theme } from '@radix-ui/themes';
import { Search } from 'nextra/components';
import { DefaultSeo } from 'next-seo';

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
				<DefaultSeo
					titleTemplate='%s - Sei Docs'
					description='Documentation for Sei Network'
					openGraph={{
						type: 'website',
						locale: 'en_US',
						siteName: 'Sei Docs',
						description: 'Documentation for Sei Network',
						images: [
							{
								url: 'https://www.docs.sei.io/assets/sei-v2-banner.jpg',
								width: 1600,
								height: 900,
								alt: 'Sei V2 Overview',
								type: 'image/jpg'
							}
						]
					}}
					twitter={{ site: '@SeiNetwork', cardType: 'summary_large_image' }}
					additionalLinkTags={[
						{ rel: 'icon', href: '/favicon.ico' },
						{
							rel: 'icon',
							type: 'image/png',
							sizes: '16x16',
							href: '/favicon-16x16.png'
						},
						{
							rel: 'icon',
							type: 'image/png',
							sizes: '32x32',
							href: '/favicon-32x32.png'
						},
						{ rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' }
					]}
				/>
				{children}
			</Theme>
		</Layout>
	);
}
