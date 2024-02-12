import React from "react";
import { DocsThemeConfig } from "nextra-theme-docs";
import { Logo } from "./components";

const config: DocsThemeConfig = {
  logo: <Logo />,
  project: {
    link: "https://github.com/sei-protocol",
  },
  chat: {
    link: "https://discord.gg/sei",
  },
  docsRepositoryBase: "https://github.com/sei-protocol/sei-docs/tree/main",
  footer: {
    text: "Sei Docs © 2024",
  },
  editLink: {
    component: null,
  },
  feedback: {
    content: null,
  },
  useNextSeoProps() {
    return {
      titleTemplate: "%s - Sei Docs",
      description: "Documentation for Sei Network",
      openGraph: {
        type: "website",
        locale: "en_US",
        siteName: "Sei Docs",
        description: "Documentation for Sei Network",
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
};

export default config;
