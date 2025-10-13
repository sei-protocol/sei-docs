import nextra from 'nextra';

const withNextra = nextra({
	latex: { renderer: 'katex' },
	search: {
		codeblocks: false
	},
	defaultShowCopyCode: true,
	mdxOptions: {
		rehypePrettyCodeOptions: {
			theme: {
				light: 'github-light-default',
				dark: 'github-dark-default'
			}
		}
	}
});

export default withNextra({
	productionBrowserSourceMaps: false,
	compress: true,
	turbopack: {},
	experimental: {
		optimizePackageImports: ['@radix-ui/react-icons', '@tabler/icons-react', '@radix-ui/themes']
	},
	compiler: {
		removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
		reactRemoveProperties: process.env.NODE_ENV === 'production'
	},
	images: {
		unoptimized: false,
		contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'cdn.sei.io',
				pathname: '**'
			},
			{
				protocol: 'https',
				hostname: 'cdn.prod.website-files.com',
				pathname: '/65cb43fecf24523357feada9/**'
			},
			{
				protocol: 'https',
				hostname: 'cdn.sanity.io',
				pathname: '/images/71yb5mbj/**'
			}
		]
	},
	async headers() {
		return [
			{
				source: '/_next/static/(.*)',
				headers: [
					{ key: 'Cache-Control', value: 'public, max-age=3600, immutable' },
					{ key: 'Vercel-CDN-Cache-Control', value: 'public, max-age=3600, immutable' }
				]
			},
			{
				source: '/assets/(.*)',
				headers: [
					{ key: 'Cache-Control', value: 'public, max-age=3600, immutable' },
					{ key: 'Vercel-CDN-Cache-Control', value: 'public, max-age=3600, immutable' }
				]
			},
			{
				source: '/(.*)\\.(png|svg|jpg|jpeg|gif|webp|ico|woff2?)',
				headers: [
					{ key: 'Cache-Control', value: 'public, max-age=3600, immutable' },
					{ key: 'Vercel-CDN-Cache-Control', value: 'public, max-age=3600, immutable' }
				]
			},
			{
				source: '/(.*)',
				headers: [
					{ key: 'Cache-Control', value: 'public, max-age=300, s-maxage=3600, stale-while-revalidate=604800' },
					{ key: 'Vercel-CDN-Cache-Control', value: 'public, max-age=300, s-maxage=3600, stale-while-revalidate=604800' }
				]
			}
		];
	},
	async redirects() {
		return [
			{
				source: '/cosmos/:path*',
				destination: '/cosmos-sdk',
				permanent: true
			},
			{
				source: '/cosmwasm/:path*',
				destination: '/cosmos-sdk',
				permanent: true
			},
			{
				source: '/seichain/:path*',
				destination: '/cosmos-sdk',
				permanent: true
			},
			{
				source: '/sei-protocol/:path*',
				destination: '/cosmos-sdk',
				permanent: true
			},
			// EVM category landing fallbacks
			{
				source: '/evm/bridging',
				destination: '/evm/bridging/layerzero',
				permanent: true
			},
			{
				source: '/evm/wallet-integrations',
				destination: '/evm/wallet-integrations/thirdweb',
				permanent: true
			},
			{
				source: '/evm/indexer-providers',
				destination: '/evm/indexer-providers/the-graph',
				permanent: true
			},
			{
				source: '/evm/ai-tooling',
				destination: '/evm/ai-tooling/mcp-server',
				permanent: true
			},
			{
				source: '/evm/agent-kits',
				destination: '/evm/ai-tooling/cambrian-agent-kit',
				permanent: true
			},
			// Specific EVM subpaths mentioned
			{
				source: '/evm/agent-kits/cambrian-agent-kit',
				destination: '/evm/ai-tooling/cambrian-agent-kit',
				permanent: true
			},
			{
				source: '/evm/precompiles/p256',
				destination: '/evm/precompiles/P256',
				permanent: true
			},
			{
				source: '/evm/cosmwasm-precompiles',
				destination: '/evm/precompiles/cosmwasm-precompiles/example-usage',
				permanent: true
			},
			{
				source: '/evm/bridging/tasks/:task*',
				destination: '/evm/bridging/layerzero',
				permanent: true
			},
			{
				source: '/evm/debugging-with-seid',
				destination: '/evm/debugging-contracts',
				permanent: true
			},
			{
				source: '/evm/evm-transactions',
				destination: '/evm/transactions',
				permanent: true
			},
			{
				source: '/evm/pointers',
				destination: '/evm/reference',
				permanent: true
			},
			{
				source: '/evm/pointers/standard',
				destination: '/evm/reference',
				permanent: true
			},
			{
				source: '/evm/pointers/erc1155',
				destination: '/evm/reference',
				permanent: true
			},
			{
				source: '/evm/pointers/tokenfactory',
				destination: '/evm/reference',
				permanent: true
			},
			{
				source: '/evm/pointers/ibc',
				destination: '/evm/reference',
				permanent: true
			},
			{
				source: '/evm/artifacts',
				destination: '/evm/debugging-contracts',
				permanent: true
			},
			{
				source: '/evm/contracts',
				destination: '/evm/debugging-contracts',
				permanent: true
			},
			{
				source: '/evm/cache',
				destination: '/evm/debugging-contracts',
				permanent: true
			},
			{
				source: '/evm/test',
				destination: '/evm/debugging-contracts',
				permanent: true
			},
			// Legacy develop/advanced/full-node paths
			{
				source: '/develop/:path*',
				destination: '/build',
				permanent: true
			},
			{
				source: '/full-node/:path*',
				destination: '/node',
				permanent: true
			},
			{
				source: '/advanced/:path*',
				destination: '/learn/general-overview',
				permanent: true
			},
			// Swagger
			{
				source: '/swagger/:path*',
				destination: '/node/swagger',
				permanent: true
			},
			// Malformed root paths / stray characters
			{
				source: "/'",
				destination: '/',
				permanent: true
			},
			{
				source: '/)',
				destination: '/',
				permanent: true
			},
			{
				source: '/:os(Users|home|root|etc|var|usr|tmp|dev)/:rest*',
				destination: '/node/troubleshooting',
				permanent: true
			},
			{
				source: '/_next/static/css/:file*',
				destination: '/',
				permanent: true
			},
			{
				source: '/metrics',
				destination: '/',
				permanent: true
			},
			{
				source: '/data',
				destination: '/node/troubleshooting',
				permanent: true
			},
			{
				source: '/config',
				destination: '/node/troubleshooting',
				permanent: true
			},
			{
				source: '/tmp',
				destination: '/node/troubleshooting',
				permanent: true
			},
			// Specific strays
			{
				source: '/.sei/:path*',
				destination: '/node/troubleshooting',
				permanent: true
			},
			{
				source: '/.hermes/:path*',
				destination: '/node/troubleshooting',
				permanent: true
			},
			{
				source: '/key_backup/:path*',
				destination: '/node/troubleshooting',
				permanent: true
			},
			{
				source: '/sei-config-:rest*',
				destination: '/node/troubleshooting',
				permanent: true
			},
			{
				source: '/sei-data-:rest*',
				destination: '/node/troubleshooting',
				permanent: true
			},
			{
				source: '/validator_key_',
				destination: '/node/troubleshooting',
				permanent: true
			},
			{
				source: '/priv_validator_:rest*',
				destination: '/node/troubleshooting',
				permanent: true
			},
			{
				source: '/genesis.json',
				destination: '/node/troubleshooting',
				permanent: true
			},
			{
				source: '/block',
				destination: '/node/troubleshooting',
				permanent: true
			},
			{
				source: '/learn/mev',
				destination: '/evm/optimizing-for-parallelization',
				permanent: true
			},
			{
				source: '/learn/mev-plugins',
				destination: '/evm/optimizing-for-parallelization',
				permanent: true
			},
			{
				source: '/mev/:path*',
				destination: '/evm/optimizing-for-parallelization',
				permanent: true
			},
			{
				source: '/learn/general-submit-feedback',
				destination: '/learn/general-submit-feedback',
				permanent: true
			},
			// Additional specific redirects from report
			{
				source: '/build-on-sei/evm',
				destination: '/evm/evm-general',
				permanent: true
			},
			{
				source: '/evm/precompiles',
				destination: '/evm/precompiles/example-usage',
				permanent: true
			},
			{
				source: '/evm/precompiles/artifacts/:path*',
				destination: '/evm/debugging-contracts',
				permanent: true
			},
			{
				source: '/evm/MyContract.json',
				destination: '/evm/debugging-contracts',
				permanent: true
			},
			{
				source: '/evm/installing-seid',
				destination: '/build/installing-seid',
				permanent: true
			},
			{
				source: '/subgraphs/:path*',
				destination: '/providers/indexers/the-graph',
				permanent: true
			},
			{
				source: '/whitepaper/:path*',
				destination: '/learn/general-overview',
				permanent: true
			},
			{
				source: '/general-overview',
				destination: '/learn/general-overview',
				permanent: true
			},
			{
				source: '/general-staking',
				destination: '/learn/general-staking',
				permanent: true
			},
			{
				source: '/general-governance',
				destination: '/learn/general-governance',
				permanent: true
			},
			{
				source: '/general-submit-feedback',
				destination: '/learn/general-submit-feedback',
				permanent: true
			},
			{
				source: '/general-brand-kit',
				destination: '/learn/general-brand-kit',
				permanent: true
			},
			{
				source: '/user-quickstart',
				destination: '/learn/user-quickstart',
				permanent: true
			},
			{
				source: '/user-guides/wallet-setup',
				destination: '/learn/wallet-setup',
				permanent: true
			},
			{
				source: '/user-guides/linking-addresses',
				destination: '/learn/linking-addresses',
				permanent: true
			},
			{
				source: '/user-guides/getting-tokens',
				destination: '/learn/getting-tokens',
				permanent: true
			},
			{
				source: '/user-guides/block-explorers',
				destination: '/learn/block-explorers',
				permanent: true
			},
			{
				source: '/user-guides/bridging',
				destination: '/learn/bridging',
				permanent: true
			},
			{
				source: '/learn/bridging',
				destination: '/evm/bridging',
				permanent: true
			},
			{
				source: '/evm/bridging/third-web',
				destination: '/evm/bridging/thirdweb',
				permanent: true
			},
			{
				source: '/user-guides/wrapped-sei',
				destination: '/learn/wrapped-sei',
				permanent: true
			},
			{
				source: '/user-guides/ledger-setup',
				destination: '/learn/ledger-setup',
				permanent: true
			},
			{
				source: '/user-FAQ',
				destination: '/learn/user-FAQ',
				permanent: true
			},
			{
				source: '/dev-intro',
				destination: '/build',
				permanent: true
			},
			{
				source: '/dev-chains',
				destination: '/learn/dev-chains',
				permanent: true
			},
			{
				source: '/dev-token-standards',
				destination: '/build/dev-token-standards',
				permanent: true
			},
			{
				source: '/dev-gas',
				destination: '/learn/dev-gas',
				permanent: true
			},
			{
				source: '/dev-transactions',
				destination: '/learn/dev-transactions',
				permanent: true
			},
			{
				source: '/dev-smart-contracts',
				destination: '/build/dev-smart-contracts',
				permanent: true
			},
			{
				source: '/dev-querying-state',
				destination: '/build/querying-state',
				permanent: true
			},
			{
				source: '/dev-interoperability',
				destination: '/learn/dev-interoperability',
				permanent: true
			},
			{
				source: '/dev-interoperability/precompiles/addr',
				destination: '/reference/precompiles/addr',
				permanent: true
			},
			{
				source: '/dev-interoperability/precompiles/bank',
				destination: '/reference/precompiles/bank',
				permanent: true
			},
			{
				source: '/dev-interoperability/precompiles/cosmwasm',
				destination: '/reference/precompiles/cosmwasm',
				permanent: true
			},
			{
				source: '/dev-interoperability/precompiles/distribution',
				destination: '/reference/precompiles/distribution',
				permanent: true
			},
			{
				source: '/dev-interoperability/precompiles/example-usage',
				destination: '/reference/precompiles/example-usage',
				permanent: true
			},
			{
				source: '/dev-interoperability/precompiles/governance',
				destination: '/reference/precompiles/governance',
				permanent: true
			},
			{
				source: '/dev-interoperability/precompiles/ibc',
				destination: '/reference/precompiles/ibc',
				permanent: true
			},
			{
				source: '/dev-interoperability/precompiles/json',
				destination: '/reference/precompiles/json',
				permanent: true
			},
			{
				source: '/dev-interoperability/precompiles/oracle',
				destination: '/reference/precompiles/oracle',
				permanent: true
			},
			{
				source: '/dev-interoperability/precompiles/pointer',
				destination: '/reference/precompiles/pointer',
				permanent: true
			},
			{
				source: '/dev-interoperability/precompiles/pointerview',
				destination: '/reference/precompiles/pointerview',
				permanent: true
			},
			{
				source: '/dev-interoperability/precompiles/staking',
				destination: '/reference/precompiles/staking',
				permanent: true
			},
			{
				source: '/dev-interoperability/pointer-contracts',
				destination: '/reference/pointer-contracts',
				permanent: true
			},
			{
				source: '/dev-frontend-dapps',
				destination: '/build/dev-frontend-dapps',
				permanent: true
			},
			{
				source: '/dev-node/intro',
				destination: '/node/intro',
				permanent: true
			},
			{
				source: '/dev-node/quickstart',
				destination: '/node/quickstart',
				permanent: true
			},
			{
				source: '/dev-node/node-operators',
				destination: '/node/node-operators',
				permanent: true
			},
			{
				source: '/dev-node/node-configuration',
				destination: '/node/node-configuration',
				permanent: true
			},
			{
				source: '/dev-node/configure-general-settings',
				destination: '/node/configure-general-settings',
				permanent: true
			},
			{
				source: '/dev-node/swagger-docs-endpoint',
				destination: '/node/swagger-docs-endpoint',
				permanent: true
			},
			{
				source: '/dev-node/join-a-network',
				destination: '/node/join-a-network',
				permanent: true
			},
			{
				source: '/dev-node/running-seid',
				destination: '/node/running-seid',
				permanent: true
			},
			{
				source: '/dev-validators/overview',
				destination: '/node/overview',
				permanent: true
			},
			{
				source: '/dev-validators/register',
				destination: '/node/register',
				permanent: true
			},
			{
				source: '/dev-validators/security-practices',
				destination: '/node/security-practices',
				permanent: true
			},
			{
				source: '/dev-validators/restore-validator',
				destination: '/node/restore-validator',
				permanent: true
			},
			{
				source: '/dev-validators/oracle-price-feeder',
				destination: '/node/oracle-price-feeder',
				permanent: true
			},
			{
				source: '/dev-validators/validator-faq',
				destination: '/node/validator-faq',
				permanent: true
			},
			{
				source: '/dev-advanced-concepts/fee-grants',
				destination: '/learn/fee-grants',
				permanent: true
			},
			{
				source: '/dev-advanced-concepts/account-structure',
				destination: '/learn/account-structure',
				permanent: true
			},
			{
				source: '/dev-advanced-concepts/wallet-association',
				destination: '/learn/wallet-association',
				permanent: true
			},
			{
				source: '/dev-advanced-concepts/hardware-wallets',
				destination: '/learn/hardware-wallets',
				permanent: true
			},
			{
				source: '/dev-advanced-concepts/oracles',
				destination: '/learn/oracles',
				permanent: true
			},
			{
				source: '/dev-advanced-concepts/execute-multiple',
				destination: '/learn/execute-multiple',
				permanent: true
			},
			{
				source: '/dev-advanced-concepts/hd-path-coin-types',
				destination: '/learn/hd-path-coin-types',
				permanent: true
			},
			{
				source: '/dev-advanced-concepts/proposals',
				destination: '/learn/proposals',
				permanent: true
			},
			{
				source: '/dev-advanced-concepts/ibc-relayer',
				destination: '/learn/ibc-relayer',
				permanent: true
			},
			{
				source: '/dev-advanced-concepts/differences-with-ethereum',
				destination: '/learn/differences-with-ethereum',
				permanent: true
			},
			{
				source: '/endpoints',
				destination: '/reference/endpoints',
				permanent: true
			},
			{
				source: '/endpoints/cosmos',
				destination: '/reference/cosmos',
				permanent: true
			},
			{
				source: '/endpoints/cosmos/api/:slug*',
				destination: '/reference/api/:slug*',
				permanent: true
			},
			{
				source: '/endpoints/evm',
				destination: '/reference/evm',
				permanent: true
			},
			{
				source: '/seid/:slug*',
				destination: '/reference/seid/:slug*',
				permanent: true
			},
			{
				source: '/seid',
				destination: '/reference/seid',
				permanent: true
			},
			{
				source: '/dev-tutorials/installing-seid',
				destination: '/build/installing-seid',
				permanent: true
			},
			{
				source: '/dev-tutorials/building-a-frontend',
				destination: '/build/building-a-frontend',
				permanent: true
			},
			{
				source: '/dev-tutorials/cosmwasm-general',
				destination: '/build/cosmwasm-general',
				permanent: true
			},
			{
				source: '/dev-tutorials/evm-general',
				destination: '/build/evm-general',
				permanent: true
			},
			{
				source: '/dev-tutorials/evm-cli-tutorial',
				destination: '/build/evm-cli-tutorial',
				permanent: true
			},
			{
				source: '/dev-tutorials/tokenfactory-tutorial',
				destination: '/cosmwasm/tokenfactory-tutorial',
				permanent: true
			},
			{
				source: '/dev-tutorials/tokenfactory-allowlist',
				destination: '/build/tokenfactory-allowlist',
				permanent: true
			},
			{
				source: '/dev-tutorials/nft-contract-tutorial',
				destination: '/build/nft-contract-tutorial',
				permanent: true
			},
			{
				source: '/dev-tutorials/pointer-contracts',
				destination: '/build/pointer-contracts',
				permanent: true
			},
			{
				source: '/dev-tutorials/multi-sig-accounts',
				destination: '/build/multi-sig-accounts',
				permanent: true
			},
			{
				source: '/dev-tutorials/ibc-protocol',
				destination: '/build/ibc-protocol',
				permanent: true
			},
			{
				source: '/dev-tutorials/ledger-ethers',
				destination: '/build/ledger-ethers',
				permanent: true
			},
			{
				source: '/resources-resources',
				destination: '/build/resources-resources',
				permanent: true
			},
			{
				source: '/resources-tools-and-resources',
				destination: '/build/resources-tools-and-resources',
				permanent: true
			},
			{
				source: '/dev-ecosystem-providers/wallets',
				destination: '/providers/wallets',
				permanent: true
			},
			{
				source: '/dev-ecosystem-providers/explorers',
				destination: '/providers/explorers',
				permanent: true
			},
			{
				source: '/dev-ecosystem-providers/rpc-providers',
				destination: '/providers/rpc-providers',
				permanent: true
			},
			{
				source: '/dev-ecosystem-providers/indexers/indexers',
				destination: '/providers/indexers/indexers',
				permanent: true
			},
			{
				source: '/dev-ecosystem-providers/indexers/the-graph',
				destination: '/providers/indexers/the-graph',
				permanent: true
			},
			{
				source: '/dev-ecosystem-providers/indexers/goldrush',
				destination: '/providers/indexers/goldrush',
				permanent: true
			},
			{
				source: '/dev-ecosystem-providers/centralized-exchanges',
				destination: '/learn/centralized-exchanges',
				permanent: true
			},
			{
				source: '/dev-ecosystem-providers/faucets',
				destination: '/learn/faucet',
				permanent: true
			},
			{
				source: '/providers/faucets',
				destination: '/learn/faucet',
				permanent: true
			},
			{
				source: '/dev-ecosystem-providers/oracles/oracles',
				destination: '/providers/oracles',
				permanent: true
			},
			{
				source: '/dev-ecosystem-providers/bridges',
				destination: '/providers/bridges',
				permanent: true
			},
			{
				source: '/dev-ecosystem-providers/nfts',
				destination: '/providers/nfts',
				permanent: true
			},
			{
				source: '/dev-ecosystem-providers/ecosystem-map',
				destination: '/providers/ecosystem-map',
				permanent: true
			},
			{
				source: '/introduction/overview',
				destination: '/learn',
				permanent: true
			},
			{
				source: '/advanced/parallelism',
				destination: '/learn/general-overview',
				permanent: true
			},
			{
				source: '/advanced/governance',
				destination: '/learn/general-governance',
				permanent: true
			},
			{
				source: '/learn/about-sei',
				destination: '/learn/general-overview',
				permanent: true
			},
			{
				source: '/providers/wallets',
				destination: '/learn/wallets',
				permanent: true
			},
			{
				source: '/learn/differences-with-ethereum',
				destination: '/evm/differences-with-ethereum',
				permanent: true
			},
			{
				source: '/learn/mcp-server',
				destination: '/evm/ai-tooling/mcp-server',
				permanent: true
			}
		];
	}
});
