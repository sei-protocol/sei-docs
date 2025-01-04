const withNextra = require('nextra')({
	theme: 'nextra-theme-docs',
	themeConfig: './theme.config.tsx'
});

module.exports = withNextra({
	images: {
		unoptimized: true,
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
			}
		]
	},
	async redirects() {
		return [
			{
				source: '/',
				destination: '/learn',
				permanent: true
			}
		];
	}
});
