import { StaticImageData } from 'next/image';

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
