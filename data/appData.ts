import { StaticImageData } from 'next/image';

import gamblinoLogo from "../public/assets/ecosystem/gamblino.jpeg";
import dragonswapLogo from "../public/assets/ecosystem/dragonswap.jpeg";
import carbondefiLogo from "../public/assets/ecosystem/carbondefi.jpeg";
import belugasLogo from "../public/assets/ecosystem/belugas.png";
import squaredLabsLogo from "../public/assets/ecosystem/squared-labs.jpeg";
import seijinLogo from "../public/assets/ecosystem/seijin.png";
import predxLogo from "../public/assets/ecosystem/predx.jpeg";
import yakaLogo from "../public/assets/ecosystem/yaka.jpeg";
import webumpLogo from "../public/assets/ecosystem/webump.jpeg";
import accumulatedLogo from "../public/assets/ecosystem/accumulated.jpeg";
import mambaLogo from "../public/assets/ecosystem/mamba.png";
import jellyverseLogo from "../public/assets/ecosystem/jellyverse.png";
import seicasinoLogo from "../public/assets/ecosystem/seicasino.png";
import superSeiyanBotLogo from "../public/assets/ecosystem/superseiyanbot.jpeg";
import nfts2meLogo from "../public/assets/ecosystem/nfts2me.png";
import stafiLogo from "../public/assets/ecosystem/stafi.png";
import siloLogo from "../public/assets/ecosystem/silo.jpeg";
import vermillionLogo from "../public/assets/ecosystem/vermillion.jpeg";
import nukeemLogo from "../public/assets/ecosystem/nukeem.jpeg";
import jaspervaultLogo from "../public/assets/ecosystem/jaspervault.jpeg";
import monnaLogo from "../public/assets/ecosystem/monna.png";
import kawaLogo from "../public/assets/ecosystem/kawa.jpeg";
import fidropLogo from "../public/assets/ecosystem/fidrop.jpeg";

interface App {
    title: string;
    description: string;
    href: string;
    image: StaticImageData;
    tags: Tag[];
}

export enum Tag {
    BET = 'Betting', // apps/games including betting/wagers
    BOT = 'Bots', // automated trading or utility bots
    BRIDGE = 'Bridge', // cross-chain bridging apps
    DEFI = 'DeFi', // decentralized finance applications [generic, add other specific tags]
    DEX = 'Exchange', // decentralized exchanges
    GAMES = 'Gaming', // games or gaming platforms
    GOV = 'Governance', // governance and voting applications or informational dashboards
    INDEX = 'Indexer', // data indexing services
    LAUNCH = 'Launchpad', // platforms for launching new projects or tokens
    LEND = 'Lending', // lending/borrowing platforms
    LIQ = 'Liquidity', // liquidity provision and management [vault protocols for example]
    LST = 'Liquid Staking', // liquid staking solutions
    MKT = 'Marketplace', // decentralized marketplaces [non-standard markets like NFT, services markets]
    MEV = 'MEV', // applications dealing with arbitrage or block auctioning, etc.
    NFT = 'NFT', // NFT platforms [generic, add other specific tags]
    STAKE = 'Staking', // staking dashboards, automation, and other tools
    STATS = 'Statistics/Metrics', // on-chain statistics and metrics tracking
    TOOL = 'Tool', // utilities for builders or research, etc.
    TRADE = 'Trading', // trading platforms and services [non-standard, peer/OTC swaps, NFT trading]
    WS = 'Workshop' // educational and workshop platforms
}

// Map pretty names to each tag
export const tagPrettyNames: { [key in Tag]: string[] } = {
    [Tag.BET]: ['Betting', 'Wagering', 'Gambling'],
    [Tag.BOT]: ['Bots', 'Automation', 'Trading Bot'],
    [Tag.BRIDGE]: ['Bridge', 'Cross-chain'],
    [Tag.DEFI]: ['DeFi', 'Decentralized Finance'],
    [Tag.DEX]: ['Exchange', 'DEX', 'Decentralized Exchange'],
    [Tag.GAMES]: ['Gaming', 'Games'],
    [Tag.GOV]: ['Governance', 'Voting', 'Governance Dashboard'],
    [Tag.INDEX]: ['Indexer', 'Data Indexing'],
    [Tag.LAUNCH]: ['Launchpad', 'Project Launch'],
    [Tag.LEND]: ['Lending', 'Borrowing'],
    [Tag.LIQ]: ['Liquidity', 'Liquidity Management'],
    [Tag.LST]: ['Liquid Staking', 'Staking Solutions'],
    [Tag.MKT]: ['Marketplace', 'Market'],
    [Tag.MEV]: ['MEV', 'Arbitrage', 'Block Auctioning'],
    [Tag.NFT]: ['NFT', 'Non-Fungible Token'],
    [Tag.STAKE]: ['Staking', 'Staking Tools'],
    [Tag.STATS]: ['Statistics', 'Metrics', 'On-chain Metrics'],
    [Tag.TOOL]: ['Tool', 'Utility'],
    [Tag.TRADE]: ['Trading', 'Trade', 'Swaps'],
    [Tag.WS]: ['Workshop', 'Educational Platform']
};

export const appData: App[] = [
    {
        title: "DragonSwap",
        description: "The native DEX on SEI",
        href: "https://test.dragonswap.app/",
        image: dragonswapLogo,
        tags: [Tag.DEFI, Tag.TRADE, Tag.DEX]
    },
    {
        title: "SeiCasino",
        description: "Full-featured casino built natively on Sei",
        href: "https://seicasino.io",
        image: seicasinoLogo,
        tags: [Tag.BET, Tag.GAMES]
    },
    {
        title: "WeBump",
        description: "Sei native NFT launchpad",
        href: "https://webump.xyz/",
        image: webumpLogo,
        tags: [Tag.NFT, Tag.LAUNCH, Tag.WS]
    },
    {
        title: "Seijin",
        description: "Launchpad on Sei",
        href: "https://seijin.app/staking",
        image: seijinLogo,
        tags: [Tag.LAUNCH, Tag.STAKE]
    },
    {
        title: "Squared Labs",
        description: "Quadratic price exposure on perpetual futures",
        href: "https://squaredlabs.io/app/btc",
        image: squaredLabsLogo,
        tags: [Tag.DEFI, Tag.TRADE, Tag.DEX]
    },
    {
        title: "PredX",
        description: "Prediction Market",
        href: "https://events.predx.ai/",
        image: predxLogo,
        tags: [Tag.BET, Tag.MKT, Tag.GAMES]
    },
    {
        title: "Gamblino",
        description: "GambleFi protocol covering crypto, sportsbook and classic games of chance",
        href: "https://test.gamblino.app/",
        image: gamblinoLogo,
        tags: [Tag.BET, Tag.GAMES]
    },
    {
        title: "Silo",
        description: "Liquid staking and MEV on Sei",
        href: "https://silo-evm.dc37hw5o72ljt.amplifyapp.com/",
        image: siloLogo,
        tags: [Tag.LST, Tag.MEV]
    },
    {
        title: "Vermillion",
        description: "Next-gen AMM and stablecoin",
        href: "https://app.vermillion.finance/swap",
        image: vermillionLogo,
        tags: [Tag.DEX, Tag.DEFI]
    },
    {
        title: "Belugas",
        description: "Decentralized Marketplace for lenders and borrowers",
        href: "https://www.belugas.io/",
        image: belugasLogo,
        tags: [Tag.MKT, Tag.DEFI, Tag.LEND]
    },
    {
        title: "Yaka",
        description: "Algebra Integral fork on Sei",
        href: "https://test.yaka.finance/",
        image: yakaLogo,
        tags: [Tag.LAUNCH, Tag.WS, Tag.DEFI]
    },
    {
        title: "Accumulated",
        description: "Liquid staking protocol",
        href: "https://testnet.accumulated.finance/stake/sei",
        image: accumulatedLogo,
        tags: [Tag.LIQ, Tag.LST, Tag.DEFI]
    },
    {
        title: "Mamba Defi",
        description: "Defi and memecoin ecosystem",
        href: "https://www.mambaswap.io/",
        image: mambaLogo,
        tags: [Tag.DEFI, Tag.WS, Tag.MKT]
    },
    {
        title: "JellyVerse",
        description: "Smart order router",
        href: "https://jelly-verse-sei.vercel.app/jellyswap",
        image: jellyverseLogo,
        tags: [Tag.DEFI, Tag.TRADE, Tag.LIQ]
    },
    {
        title: "Super Seiyan Bot",
        description: "Sei native telegram trading bot",
        href: "https://t.me/SSeiyanEvmBot",
        image: superSeiyanBotLogo,
        tags: [Tag.TRADE, Tag.BOT, Tag.DEFI]
    },
    {
        title: "NFTs2ME",
        description: "No-code NFT creation tool",
        href: "https://nfts2me.com/app/sei-devnet/",
        image: nfts2meLogo,
        tags: [Tag.NFT, Tag.WS, Tag.LAUNCH]
    },
    {
        title: "Stafi",
        description: "LST protocol",
        href: "https://test-app.stafi.io/gallery/evm/SEI/?net=SEI",
        image: stafiLogo,
        tags: [Tag.DEFI, Tag.LST]
    },
    {
        title: "Nuk'Em Loans",
        description: "DeFi marketplace",
        href: "https://app.nukem.loans/",
        image: nukeemLogo,
        tags: [Tag.DEFI, Tag.LEND]
    },
    {
        title: "JasperVault",
        description: "Fully decentralised options trading",
        href: "https://alpha.jasper.finance/trade/sei",
        image: jaspervaultLogo,
        tags: [Tag.DEFI, Tag.TRADE]
    },
    {
        title: "Monna",
        description: "The standard for leveraged lending",
        href: "https://app.monna.io/",
        image: monnaLogo,
        tags: [Tag.DEFI, Tag.LEND]
    },
    {
        title: "Kawa",
        description: "Decentralised cross-chain lending",
        href: "https://v2.beta.kawa.finance/lend",
        image: kawaLogo,
        tags: [Tag.DEFI, Tag.LEND]
    },
    {
        title: "Fidrop",
        description: "Platform that powers token creation, claiming, drops, and mints",
        href: "https://fidrop.com/signin?callbackUrl=%2F",
        image: fidropLogo,
        tags: [Tag.NFT, Tag.LAUNCH]
    },
    {
        title: "Carbon DeFi",
        description: "An orderbook-like DEX with full automation and built-in 24/7 trading bot",
        href: "https://sei.carbondefi.xyz/",
        image: carbondefiLogo,
        tags: [Tag.DEFI, Tag.DEX, Tag.LIQ, Tag.TRADE]
    },
];

export default appData;
