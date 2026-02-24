import type { Config } from 'tailwindcss';

const config: Config = {
	darkMode: 'class',
	content: ['./components/**/*.{js,ts,jsx,tsx,mdx}', './app/**/*.{js,ts,jsx,tsx,mdx}', './src/**/*.{js,ts,jsx,tsx,mdx}', './content/**/*.{js,ts,jsx,tsx,mdx}'],
	theme: {
		extend: {
			colors: {
				sei: {
					black: '#000000',
					white: '#ffffff',
					cream: '#e6d4c3',
					live: '#38df00',
					error: '#fa0c00',
					grey: {
						25: '#f5f5f7',
						30: '#ececee',
						50: '#cccccc',
						75: '#999999',
						100: '#999999',
						200: '#666666',
						300: '#333333',
						400: '#333333',
						600: '#131313'
					},
					maroon: {
						25: '#b99ba1',
						50: '#b05c6c',
						100: '#600014',
						200: '#34050d'
					},
					gold: {
						25: '#d6c9ac',
						100: '#966f22',
						200: '#5d4a22',
						400: '#3e3115',
						600: '#1f180a'
					}
				}
			},
			fontFamily: {
				display: ['"Lateral Variable"', 'sans-serif'],
				subtitle: ['"Lateral Standard"', 'sans-serif'],
				body: ['"Items Text"', 'sans-serif'],
				ui: ['"Lateral Variable"', 'sans-serif'],
				inter: ['Inter', 'sans-serif'],
				mono: ['"JetBrains Mono"', '"SF Mono"', '"Fira Code"', '"Cascadia Code"', 'monospace']
			},
			fontSize: {
				d1: ['95px', { lineHeight: '0.9', fontWeight: '685' }],
				d2: ['70px', { lineHeight: '0.9', fontWeight: '685' }],
				h1: ['60px', { lineHeight: '0.95', fontWeight: '685' }],
				h2: ['56px', { lineHeight: '0.95', fontWeight: '685' }],
				h3: ['45px', { lineHeight: '0.9', fontWeight: '685' }],
				'subtitle-lg': ['24px', { lineHeight: '1', fontWeight: '400' }],
				'subtitle-sm': ['20px', { lineHeight: '1.1', fontWeight: '685' }],
				'body-lg': ['40px', { lineHeight: '1', fontWeight: '400' }],
				'body-md': ['20px', { lineHeight: '1.1', fontWeight: '350' }],
				'body-sm': ['16px', { lineHeight: '1.2', fontWeight: '350' }],
				'body-xs': ['14px', { lineHeight: '1.2', fontWeight: '400' }],
				button: ['12px', { lineHeight: '1.2', fontWeight: '400' }],
				'button-sm': ['10px', { lineHeight: '1.2', fontWeight: '400' }],
				nav: ['12px', { lineHeight: '1.2', fontWeight: '400' }],
				meta: ['12px', { lineHeight: '1.2', fontWeight: '400' }],
				supporting: ['12px', { lineHeight: '1.2', fontWeight: '400' }],
				'supporting-sm': ['9px', { lineHeight: '1.3', fontWeight: '400' }]
			},
			borderRadius: {
				button: '64px'
			}
		}
	},
	plugins: []
};
export default config;
