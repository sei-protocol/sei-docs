const config = {
	plugins: {
		'@tailwindcss/postcss': {},
		autoprefixer: {},
		...(process.env.NODE_ENV === 'production'
			? {
					cssnano: {
						preset: [
							'default',
							{
								discardComments: { removeAll: true },
								reduceIdents: true,
								mergeLonghand: true,
								mergeRules: true,
								minifyFontValues: true,
								minifyGradients: true,
								normalizeWhitespace: true,
								colormin: true,
								calc: false
							}
						]
					}
				}
			: {})
	}
};

export default config;
