import { StaticImageData } from 'next/image';

import gamblinoLogo from "../public/assets/ecosystem/gamblino.jpeg";
import dragonswapLogo from "../public/assets/ecosystem/dragonswap.jpeg";
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
import hoyuLogo from "../public/assets/ecosystem/hoyu.jpeg";
import superSeiyanBotLogo from "../public/assets/ecosystem/superseiyanbot.jpeg";
import nfts2meLogo from "../public/assets/ecosystem/nfts2me.png";
import stafiLogo from "../public/assets/ecosystem/stafi.png";
import siloLogo from "../public/assets/ecosystem/silo.jpeg";
import vermillionLogo from "../public/assets/ecosystem/vermillion.jpeg";
import nukeemLogo from "../public/assets/ecosystem/nukeem.jpeg";
import jaspervaultLogo from "../public/assets/ecosystem/jaspervault.jpeg";
import monnaLogo from "../public/assets/ecosystem/monna.png";
import kawaLogo from "../public/assets/ecosystem/kawa.jpeg";

interface App {
    title: string;
    description: string;
    href: string;
    image: StaticImageData;
    tags: string[];
}

export const appData: App[] = [
    {
        title: "DragonSwap",
        description: "The native DEX on SEI",
        href: "https://test.dragonswap.app/",
        image: dragonswapLogo,
        tags: ["DeFi", "Trading", "Swap"]
    },
    {
        title: "SeiCasino",
        description: "Full-featured casino built natively on Sei",
        href: "https://seicasino.io",
        image: seicasinoLogo,
        tags: ["Betting", "Games", "Gaming"]
    },
    {
        title: "WeBump",
        description: "Sei native NFT launchpad",
        href: "https://webump.xyz/",
        image: webumpLogo,
        tags: ["NFT", "Launchpad", "Workshop"]
    },
    {
        title: "Seijin",
        description: "Launchpad on Sei",
        href: "https://seijin.app/staking",
        image: seijinLogo,
        tags: ["Launchpad", "Staking"]
    },
    {
        title: "Squared Labs",
        description: "Quadratic price exposure on perpetual futures",
        href: "https://squaredlabs.io/app/btc",
        image: squaredLabsLogo,
        tags: ["DeFi", "Futures", "Trading", "Swap"]
    },
    {
        title: "PredX",
        description: "Prediction Market",
        href: "https://events.predx.ai/",
        image: predxLogo,
        tags: ["Betting", "Market", "Games", "Gaming"]
    },
    {
        title: "Gamblino",
        description: "GambleFi protocol covering crypto, sportsbook and classic games of chance",
        href: "https://test.gamblino.app/",
        image: gamblinoLogo,
        tags: ["Betting", "Games", "Gaming"]
    },
    {
        title: "Silo",
        description: "Liquid staking and MEV on Sei",
        href: "https://silo-evm.dc37hw5o72ljt.amplifyapp.com/",
        image: siloLogo,
        tags: ["Liquid Staking", "MEV"]
    },
    {
        title: "Vermillion",
        description: "Next-gen AMM and stablecoin",
        href: "https://app.vermillion.finance/swap",
        image: vermillionLogo,
        tags: ["DEX", "DeFi", ]
    },
    {
        title: "Belugas",
        description: "Decentralized Marketplace for lenders and borrowers",
        href: "https://www.belugas.io/",
        image: belugasLogo,
        tags: ["Market", "DeFi", "Lending"]
    },
    {
        title: "Yaka",
        description: "Algebra Integral fork on Sei",
        href: "https://test.yaka.finance/",
        image: yakaLogo,
        tags: ["Launchpad", "Workshop", "DeFi"]
    },
    {
        title: "Accumulated",
        description: "Liquid staking protocol",
        href: "https://testnet.accumulated.finance/stake/sei",
        image: accumulatedLogo,
        tags: ["Liquidity", "Liquid Staking", "DeFi"]
    },
    {
        title: "Mamba Defi",
        description: "Defi and memecoin ecosystem",
        href: "https://www.mambaswap.io/",
        image: mambaLogo,
        tags: ["DeFi", "Workshop", "Market"]
    },
    {
        title: "JellyVerse",
        description: "Smart order router",
        href: "https://jelly-verse-sei.vercel.app/jellyswap",
        image: jellyverseLogo,
        tags: ["DeFi", "Trading", "Swap", "Liquidity"]
    },
    {
        title: "Hoyu",
        description: "DeFi protocol uniting lending and trading Marketplaces to give every token new utility as safe collateral",
        href: "https://arctic.hoyu.io",
        image: hoyuLogo,
        tags: ["DeFi", "Liquidity", "Lending"]
    },
    {
        title: "Super Seiyan Bot",
        description: "Sei native telegram trading bot",
        href: "https://t.me/SSeiyanEvmBot",
        image: superSeiyanBotLogo,
        tags: ["Trading", "Swap", "Bots", "DeFi"]
    },
    {
        title: "NFTs2ME",
        description: "No-code NFT creation tool",
        href: "https://nfts2me.com/app/sei-devnet/",
        image: nfts2meLogo,
        tags: ["NFT", "Workshop", "Launchpad"]
    },
    {
        title: "Stafi",
        description: "LST protocol",
        href: "https://test-app.stafi.io/gallery/evm/SEI/?net=SEI",
        image: stafiLogo,
        tags: ["DeFi", "Liquid Staking"]
    },
    {
        title: "Nuk'Em Loans",
        description: "DeFi marketplace",
        href: "https://app.nukem.loans/",
        image: nukeemLogo,
        tags: ["DeFi", "Lending"]
    },
    {
        title: "JasperVault",
        description: "Fully decentralised options trading",
        href: "https://alpha.jasper.finance/trade/sei",
        image: jaspervaultLogo,
        tags: ["DeFi", "Trading"]
    },
    {
        title: "Monna",
        description: "The standard for leveraged lending",
        href: "https://app.monna.io/",
        image: monnaLogo,
        tags: ["DeFi", "Lending"]
    },
    {
        title: "Kawa",
        description: "Decentralised cross-chain lending",
        href: "https://v2.beta.kawa.finance/lend",
        image: kawaLogo,
        tags: ["DeFi", "Lending"]
    },
]

export default appData;
