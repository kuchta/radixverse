import type { Config } from 'tailwindcss'
import daisyui from 'daisyui'


export default {
	content: [
		'./index.html',
		'./src/**/*.{js,ts,jsx,tsx}',
	],
	plugins: [ daisyui ],
	daisyui: {
		themes: true,
	},
	theme: {
		fontFamily: {
			sans: [ 'PingFang HK Regular', 'ui-sans-serif' ],
			serif: [ 'PingFang HK Regular', 'ui-serif' ],
			mono: [ 'PingFang HK Regular', 'ui-monospace', 'monospace' ],
		}
	}
} satisfies Config
