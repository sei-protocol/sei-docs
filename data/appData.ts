import { StaticImageData } from 'next/image';

import AxelarLogo from "../public/assets/apps/axelar-logo.png";
import BinanceLogo from "../public/assets/apps/binance-cex.png";
import CoinbaseLogo from "../public/assets/apps/coinbase-cex.png";
import FlipsideLogo from "../public/assets/apps/flipside-logo.png";
import KuCoinLogo from "../public/assets/apps/kucoin-cex.png";
import PolkachuLogo from "../public/assets/apps/polkachu.png";
import PythNetworkLogo from "../public/assets/apps/pyth-network.png";
import QuickNodeLogo from "../public/assets/apps/quicknode.png";
import RhinoLogo from "../public/assets/apps/rhino.png";
import SquidLogo from "../public/assets/apps/squid-logo.png";
import StargateLogo from "../public/assets/apps/stargate-logo.png";
import SubGraphLogo from "../public/assets/apps/subgraph-logo.png";
import TheGraphLogo from "../public/assets/apps/the-graph-logo.png";
import WormholeLogo from "../public/assets/apps/wormhole-logo.png";
import accumulatedLogo from "../public/assets/ecosystem/accumulated.jpeg";
import belugasLogo from "../public/assets/ecosystem/belugas.png";
import dragonswapLogo from "../public/assets/ecosystem/dragonswap.jpeg";
import fidropLogo from "../public/assets/ecosystem/fidrop.jpeg";
import gamblinoLogo from "../public/assets/ecosystem/gamblino.jpeg";
import jaspervaultLogo from "../public/assets/ecosystem/jaspervault.jpeg";
import jellyverseLogo from "../public/assets/ecosystem/jellyverse.png";
import kawaLogo from "../public/assets/ecosystem/kawa.jpeg";
import mambaLogo from "../public/assets/ecosystem/mamba.png";
import monnaLogo from "../public/assets/ecosystem/monna.png";
import nfts2meLogo from "../public/assets/ecosystem/nfts2me.png";
import nukeemLogo from "../public/assets/ecosystem/nukeem.jpeg";
import predxLogo from "../public/assets/ecosystem/predx.jpeg";
import seicasinoLogo from "../public/assets/ecosystem/seicasino.png";
import seijinLogo from "../public/assets/ecosystem/seijin.png";
import siloLogo from "../public/assets/ecosystem/silo.jpeg";
import squaredLabsLogo from "../public/assets/ecosystem/squared-labs.jpeg";
import stafiLogo from "../public/assets/ecosystem/stafi.png";
import superSeiyanBotLogo from "../public/assets/ecosystem/superseiyanbot.jpeg";
import vermillionLogo from "../public/assets/ecosystem/vermillion.jpeg";
import webumpLogo from "../public/assets/ecosystem/webump.jpeg";
import yakaLogo from "../public/assets/ecosystem/yaka.jpeg";

export interface App {
  title: string;
  description: string;
  href: string;
  image: StaticImageData;
  tags: Tag[];
}

export enum Tag {
  BET = "Betting", // apps/games including betting/wagers
  BOT = "Bots", // automated trading or utility bots
  BRIDGE = "Bridge", // cross-chain bridging apps
  DEFI = "DeFi", // decentralized finance applications [generic, add other specific tags]
  DEX = "Exchange", // decentralized exchanges
  CEX = "Centralized Exchange", // centralized exchanges
  GAMES = "Gaming", // games or gaming platforms
  GOV = "Governance", // governance and voting applications or informational dashboards
  INDEX = "Indexer", // data indexing services
  LAUNCH = "Launchpad", // platforms for launching new projects or tokens
  LEND = "Lending", // lending/borrowing platforms
  LIQ = "Liquidity", // liquidity provision and management [vault protocols for example]
  LST = "Liquid Staking", // liquid staking solutions
  MKT = "Marketplace", // decentralized marketplaces [non-standard markets like NFT, services markets]
  MEV = "MEV", // applications dealing with arbitrage or block auctioning, etc.
  NFT = "NFT", // NFT platforms [generic, add other specific tags]
  STAKE = "Staking", // staking dashboards, automation, and other tools
  STATS = "Statistics/Metrics", // on-chain statistics and metrics tracking
  TOOL = "Tool", // utilities for builders or research, etc.
  TRADE = "Trading", // trading platforms and services [non-standard, peer/OTC swaps, NFT trading]
  WS = "Workshop", // educational and workshop platforms
  ORACLE = "Oracle", // oracle services
  RPC = "RPC", // RPC services
}

// Map pretty names to each tag
export const tagPrettyNames: { [key in Tag]: string[] } = {
  [Tag.BET]: ["Betting", "Wagering", "Gambling"],
  [Tag.BOT]: ["Bots", "Automation", "Trading Bot"],
  [Tag.BRIDGE]: ["Bridge", "Cross-chain"],
  [Tag.DEFI]: ["DeFi", "Decentralized Finance"],
  [Tag.DEX]: ["Exchange", "DEX", "Decentralized Exchange"],
  [Tag.GAMES]: ["Gaming", "Games"],
  [Tag.GOV]: ["Governance", "Voting", "Governance Dashboard"],
  [Tag.INDEX]: ["Indexer", "Data Indexing"],
  [Tag.LAUNCH]: ["Launchpad", "Project Launch"],
  [Tag.LEND]: ["Lending", "Borrowing"],
  [Tag.LIQ]: ["Liquidity", "Liquidity Management"],
  [Tag.LST]: ["Liquid Staking", "Staking Solutions"],
  [Tag.MKT]: ["Marketplace", "Market"],
  [Tag.MEV]: ["MEV", "Arbitrage", "Block Auctioning"],
  [Tag.NFT]: ["NFT", "Non-Fungible Token"],
  [Tag.STAKE]: ["Staking", "Staking Tools"],
  [Tag.STATS]: ["Statistics", "Metrics", "On-chain Metrics"],
  [Tag.TOOL]: ["Tool", "Utility"],
  [Tag.TRADE]: ["Trading", "Trade", "Swaps"],
  [Tag.WS]: ["Workshop", "Educational Platform"],
  [Tag.ORACLE]: ["Oracle", "Data Provider"],
  [Tag.CEX]: ["Centralized Exchange", "Exchange"],
  [Tag.RPC]: ["RPC", "Remote Procedure Call"],
};

export const appData: App[] = [
  {
    title: "DragonSwap",
    description: "The native DEX on SEI",
    href: "https://test.dragonswap.app/",
    image: dragonswapLogo,
    tags: [Tag.DEFI, Tag.TRADE, Tag.DEX],
  },
  {
    title: "SeiCasino",
    description: "Full-featured casino built natively on Sei",
    href: "https://seicasino.io",
    image: seicasinoLogo,
    tags: [Tag.BET, Tag.GAMES],
  },
  {
    title: "WeBump",
    description: "Sei native NFT launchpad",
    href: "https://webump.xyz/",
    image: webumpLogo,
    tags: [Tag.NFT, Tag.LAUNCH, Tag.WS],
  },
  {
    title: "Seijin",
    description: "Launchpad on Sei",
    href: "https://seijin.app/staking",
    image: seijinLogo,
    tags: [Tag.LAUNCH, Tag.STAKE],
  },
  {
    title: "Squared Labs",
    description: "Quadratic price exposure on perpetual futures",
    href: "https://squaredlabs.io/app/btc",
    image: squaredLabsLogo,
    tags: [Tag.DEFI, Tag.TRADE, Tag.DEX],
  },
  {
    title: "PredX",
    description: "Prediction Market",
    href: "https://events.predx.ai/",
    image: predxLogo,
    tags: [Tag.BET, Tag.MKT, Tag.GAMES],
  },
  {
    title: "Gamblino",
    description:
      "GambleFi protocol covering crypto, sportsbook and classic games of chance",
    href: "https://test.gamblino.app/",
    image: gamblinoLogo,
    tags: [Tag.BET, Tag.GAMES],
  },
  {
    title: "Silo",
    description: "Liquid staking and MEV on Sei",
    href: "https://silo-evm.dc37hw5o72ljt.amplifyapp.com/",
    image: siloLogo,
    tags: [Tag.LST, Tag.MEV],
  },
  {
    title: "Vermillion",
    description: "Next-gen AMM and stablecoin",
    href: "https://app.vermillion.finance/swap",
    image: vermillionLogo,
    tags: [Tag.DEX, Tag.DEFI],
  },
  {
    title: "Belugas",
    description: "Decentralized Marketplace for lenders and borrowers",
    href: "https://www.belugas.io/",
    image: belugasLogo,
    tags: [Tag.MKT, Tag.DEFI, Tag.LEND],
  },
  {
    title: "Yaka",
    description: "Algebra Integral fork on Sei",
    href: "https://test.yaka.finance/",
    image: yakaLogo,
    tags: [Tag.LAUNCH, Tag.WS, Tag.DEFI],
  },
  {
    title: "Accumulated",
    description: "Liquid staking protocol",
    href: "https://testnet.accumulated.finance/stake/sei",
    image: accumulatedLogo,
    tags: [Tag.LIQ, Tag.LST, Tag.DEFI],
  },
  {
    title: "Mamba Defi",
    description: "Defi and memecoin ecosystem",
    href: "https://www.mambaswap.io/",
    image: mambaLogo,
    tags: [Tag.DEFI, Tag.WS, Tag.MKT],
  },
  {
    title: "JellyVerse",
    description: "Smart order router",
    href: "https://jelly-verse-sei.vercel.app/jellyswap",
    image: jellyverseLogo,
    tags: [Tag.DEFI, Tag.TRADE, Tag.LIQ],
  },
  {
    title: "Super Seiyan Bot",
    description: "Sei native telegram trading bot",
    href: "https://t.me/SSeiyanEvmBot",
    image: superSeiyanBotLogo,
    tags: [Tag.TRADE, Tag.BOT, Tag.DEFI],
  },
  {
    title: "NFTs2ME",
    description: "No-code NFT creation tool",
    href: "https://nfts2me.com/app/sei-devnet/",
    image: nfts2meLogo,
    tags: [Tag.NFT, Tag.WS, Tag.LAUNCH],
  },
  {
    title: "Stafi",
    description: "LST protocol",
    href: "https://test-app.stafi.io/gallery/evm/SEI/?net=SEI",
    image: stafiLogo,
    tags: [Tag.DEFI, Tag.LST],
  },
  {
    title: "Nuk'Em Loans",
    description: "DeFi marketplace",
    href: "https://app.nukem.loans/",
    image: nukeemLogo,
    tags: [Tag.DEFI, Tag.LEND],
  },
  {
    title: "JasperVault",
    description: "Fully decentralised options trading",
    href: "https://alpha.jasper.finance/trade/sei",
    image: jaspervaultLogo,
    tags: [Tag.DEFI, Tag.TRADE],
  },
  {
    title: "Monna",
    description: "The standard for leveraged lending",
    href: "https://app.monna.io/",
    image: monnaLogo,
    tags: [Tag.DEFI, Tag.LEND],
  },
  {
    title: "Kawa",
    description: "Decentralised cross-chain lending",
    href: "https://v2.beta.kawa.finance/lend",
    image: kawaLogo,
    tags: [Tag.DEFI, Tag.LEND],
  },
  {
    title: "Fidrop",
    description:
      "Platform that powers token creation, claiming, drops, and mints",
    href: "https://fidrop.com/signin?callbackUrl=%2F",
    image: fidropLogo,
    tags: [Tag.NFT, Tag.LAUNCH],
  },
  {
    title: "Flipside",
    description: "Provides detailed blockchain analytics and insights.",
    href: "https://flipsidecrypto.xyz/",
    image: FlipsideLogo,
    tags: [Tag.INDEX],
  },
  {
    title: "The Graph (EVM only)",
    description: "Allows for querying blockchain data using GraphQL.",
    tags: [Tag.INDEX],
    href: "https://thegraph.com/",
    image: TheGraphLogo,
  },
  {
    title: "SubGraph",
    description:
      "SubQuery is a fast, flexible, and reliable open-source data decentralised infrastructure network, providing both RPC and indexed data to consumers around the world.",
    href: "https://academy.subquery.network/indexer/quickstart/quickstart_chains/cosmos-sei.html",
    image: SubGraphLogo,
    tags: [Tag.INDEX],
  },
  {
    title: "Wormhole",
    description:
      "A popular bridge for transferring assets across multiple blockchains.",
    href: "https://wormholenetwork.com/",
    image: WormholeLogo,
    tags: [Tag.BRIDGE],
  },
  {
    title: "Squid",
    description:
      "Enables one-click cross-chain swaps across various EVM blockchains.",
    href: "https://app.squidrouter.com/",
    image: SquidLogo,
    tags: [Tag.BRIDGE],
  },
  {
    title: "Axelar",
    description: "Provides secure cross-chain communication for Web3.",
    href: "https://axelar.network",
    image: AxelarLogo,
    tags: [Tag.BRIDGE],
  },
  {
    title: "Stargate (Coming soon)",
    description: "Facilitates seamless cross-chain transactions.",
    href: "https://stargate.finance",
    image: StargateLogo,
    tags: [Tag.BRIDGE],
  },
  {
    title: "Pyth",
    description:
      "A decentralized data oracle network providing high-fidelity real-time financial market data to smart contracts.",
    href: "https://docs.pyth.network/home",
    image: PythNetworkLogo,
    tags: [Tag.ORACLE],
  },
  {
    title: "Coinbase",
    description:
      "A leading cryptocurrency exchange platform in the U.S., known for its user-friendly interface and secure trading environment.",
    href: "https://www.coinbase.com",
    image: CoinbaseLogo,
    tags: [Tag.CEX],
  },
  {
    title: "Binance",
    description:
      "The world’s largest cryptocurrency exchange by trading volume, offering a wide range of digital assets and advanced trading features.",
    href: "https://www.binance.com",
    image: BinanceLogo,
    tags: [Tag.CEX],
  },
  {
    title: "KuCoin",
    description:
      "A global cryptocurrency exchange with a vast selection of cryptocurrencies and competitive trading fees, known for its extensive range of trading tools.",
    href: "https://www.kucoin.com",
    image: KuCoinLogo,
    tags: [Tag.CEX],
  },
  {
    title: "Rhino",
    description:
      "Provides robust RPC services for seamless blockchain interactions.",
    href: "https://rhinostake.com",
    image: RhinoLogo,
    tags: [Tag.RPC],
  },
  {
    title: "QuickNode",
    description:
      "A trusted infrastructure partner for the Sei network, providing developers with powerful APIs and dedicated support to streamline their blockchain applications.",
    href: "https://www.quicknode.com",
    image: QuickNodeLogo,
    tags: [Tag.RPC],
  },
  {
    title: "Polkachu",
    description: "Offers RPC/REST/gRPC, snapshot, genesis files, and more.",
    href: "https://polkachu.com/networks/sei",
    image: PolkachuLogo,
    tags: [Tag.RPC],
  },
  {
    title: "SubQuery",
    description:
      "SubQuery is a fast, flexible, and reliable open-source data decentralised infrastructure network, providing both RPC and indexed data to consumers around the world.",
    href: "https://academy.subquery.network/indexer/quickstart/quickstart_chains/cosmos-sei.html",
    image: SubGraphLogo,
    tags: [Tag.RPC],
  },
];


export default appData;