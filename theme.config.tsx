import React from "react";
import type { DocsThemeConfig } from "nextra-theme-docs";
import { Logo } from "./components/Logo";

const config: DocsThemeConfig = {
	logo: <Logo />,
	navigation: true,
	primaryHue: {
		dark: 0,
		light: 0,
	},
	search: {
		placeholder: "Search documentation...",
	},
	project: {
		link: "https://github.com/sei-protocol",
	},
	chat: {
		link: "https://discord.gg/sei",
	},
	navbar: {
		extraContent: null,
	},
	feedback: {
		content: "Question? Give us feedback →",
		useLink: () => "https://github.com/sei-protocol/sei-docs/issues/new",
	},
	editLink: {
		text: "Edit this page",
	},
	footer: {
		text: "Sei Docs © 2024",
	},
	sidebar: {
		defaultMenuCollapseLevel: 1,
		toggleButton: true,
	},
	darkMode: true,
	useNextSeoProps() {
		return {
			titleTemplate: "%s - Sei Docs",
			description: "Documentation for Sei Network",
			openGraph: {
				type: "website",
				locale: "en_US",
				siteName: "Sei Docs",
				description: "Documentation for Sei Network",
				images: [
					{
						url: "https://www.docs.sei.io/assets/sei-v2-banner.jpg",
						width: 1600,
						height: 900,
						alt: "Sei V2 Overview",
						type: "image/jpg",
					},
				],
			},
			twitter: {
				site: "@SeiNetwork",
			},
			additionalLinkTags: [
				{
					rel: "icon",
					href: "/favicon.ico",
				},
				{
					href: "/favicon-16x16.png",
					rel: "icon",
					sizes: "16x16",
					type: "image/png",
				},
				{
					href: "/favicon-32x32.png",
					rel: "icon",
					sizes: "32x32",
					type: "image/png",
				},
				{
					href: "/apple-touch-icon.png",
					rel: "apple-touch-icon",
					sizes: "180x180",
				},
			],
		};
	},
	head: <></>,
};

export default config;
