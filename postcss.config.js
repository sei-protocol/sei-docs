module.exports = {
	plugins: {
		'postcss-simple-vars': {
			variables: {
				'xs-breakpoint': '36em',
				'sm-breakpoint': '48em',
				'md-breakpoint': '62em',
				'lg-breakpoint': '75em',
				'xl-breakpoint': '88em'
			}
		},
		tailwindcss: {},
		autoprefixer: {}
	}
};
