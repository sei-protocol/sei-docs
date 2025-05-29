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
	output: 'export',
	trailingSlash: true,
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
	}
});
