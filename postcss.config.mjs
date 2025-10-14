const config = {
	plugins: {
		'@tailwindcss/postcss': {},
		autoprefixer: {},
		...(process.env.NODE_ENV === 'production' ? { cssnano: { preset: ['default', { discardComments: { removeAll: true } }] } } : {})
	}
};

export default config;
