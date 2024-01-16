import React from "react";
import { DocsThemeConfig } from "nextra-theme-docs";

const config: DocsThemeConfig = {
  logo: <span>Sei</span>,
  project: {
    link: "https://github.com/sei-protocol",
  },
  chat: {
    link: "https://discord.gg/sei",
  },
  docsRepositoryBase: "https://github.com/sei-protocol/sei-docs",
  footer: {
    text: "Sei Docs © 2024",
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
      // additionalLinkTags: [
      //   {
      //     rel: "icon",
      //     href: "/favicon.ico",
      //   },
      //   {
      //     href: "/favicon-96x96.png",
      //     rel: "icon",
      //     sizes: "96x96",
      //     type: "image/png",
      //   },
      //   {
      //     href: "/apple-icon-180x180.png",
      //     rel: "apple-touch-icon",
      //     sizes: "180x180",
      //   },
      // ],
    };
  },
};

export default config;
