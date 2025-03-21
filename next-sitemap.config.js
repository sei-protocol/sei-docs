/** @type {import('next-sitemap').IConfig} */
module.exports = {
	siteUrl: 'https://docs.sei.io',
	generateRobotsTxt: true,
	exclude: ['/api/*', '/server-sitemap.xml'],
	transform: async (config, path) => {
		// Don't include routes with hash fragments (#)
		if (path.includes('#')) {
			return null;
		}
		// Return default configuration for all other paths
		return {
			loc: path,
			changefreq: 'daily',
			priority: 0.7,
			lastmod: new Date().toISOString()
		};
	}
};
