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
};

export default config;
