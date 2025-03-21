import { StaticImageData } from 'next/image';

import AxelarLogo from '../../public/assets/apps/axelar-logo.png';
import BinanceLogo from '../../public/assets/apps/binance-cex.png';
import CoinbaseLogo from '../../public/assets/apps/coinbase-cex.png';
import FlipsideLogo from '../../public/assets/apps/flipside-logo.png';
import KuCoinLogo from '../../public/assets/apps/kucoin-cex.png';
import PolkachuLogo from '../../public/assets/apps/polkachu.png';
import PythNetworkLogo from '../../public/assets/apps/pyth-network.png';
import QuickNodeLogo from '../../public/assets/apps/quicknode.png';
import RhinoLogo from '../../public/assets/apps/rhino.png';
import SquidLogo from '../../public/assets/apps/squid-logo.png';
import StargateLogo from '../../public/assets/apps/stargate-logo.png';
import SubGraphLogo from '../../public/assets/apps/subgraph-logo.png';
import TheGraphLogo from '../../public/assets/apps/the-graph-logo.png';
import WormholeLogo from '../../public/assets/apps/wormhole-logo.png';
import accumulatedLogo from '../../public/assets/ecosystem/accumulated.jpeg';
import belugasLogo from '../../public/assets/ecosystem/belugas.png';
import dragonswapLogo from '../../public/assets/ecosystem/dragonswap.jpeg';
import fidropLogo from '../../public/assets/ecosystem/fidrop.jpeg';
import gamblinoLogo from '../../public/assets/ecosystem/gamblino.jpeg';
import jaspervaultLogo from '../../public/assets/ecosystem/jaspervault.jpeg';
import jellyverseLogo from '../../public/assets/ecosystem/jellyverse.png';
import kawaLogo from '../../public/assets/ecosystem/kawa.jpeg';
import mambaLogo from '../../public/assets/ecosystem/mamba.png';
import monnaLogo from '../../public/assets/ecosystem/monna.png';
import nfts2meLogo from '../../public/assets/ecosystem/nfts2me.png';
import nukeemLogo from '../../public/assets/ecosystem/nukeem.jpeg';
import predxLogo from '../../public/assets/ecosystem/predx.jpeg';
import seicasinoLogo from '../../public/assets/ecosystem/seicasino.png';
import seijinLogo from '../../public/assets/ecosystem/seijin.png';
import siloLogo from '../../public/assets/ecosystem/silo.jpeg';
import squaredLabsLogo from '../../public/assets/ecosystem/squared-labs.jpeg';
import stafiLogo from '../../public/assets/ecosystem/stafi.png';
import superSeiyanBotLogo from '../../public/assets/ecosystem/superseiyanbot.jpeg';
import vermillionLogo from '../../public/assets/ecosystem/vermillion.jpeg';
import webumpLogo from '../../public/assets/ecosystem/webump.jpeg';
import yakaLogo from '../../public/assets/ecosystem/yaka.jpeg';

export interface App {
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
	CEX = 'Centralized Exchange', // centralized exchanges
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
	WS = 'Workshop', // educational and workshop platforms
	ORACLE = 'Oracle', // oracle services
	RPC = 'RPC' // RPC services
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
	[Tag.WS]: ['Workshop', 'Educational Platform'],
	[Tag.ORACLE]: ['Oracle', 'Data Provider'],
	[Tag.CEX]: ['Centralized Exchange', 'Exchange'],
	[Tag.RPC]: ['RPC', 'Remote Procedure Call']
};
