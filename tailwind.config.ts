import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'
import daisyui from 'daisyui'

export default {
	content: [
		'./index.html',
		'./src/**/*.{js,ts,jsx,tsx}',
	],
	plugins: [
		typography,
		daisyui
	],
	theme: {
		fontFamily: {
			sans: [ 'Cutive Mono', 'ui-sans-serif' ],
			serif: [ 'Cutive Mono', 'ui-serif' ],
			mono: [ 'Cutive Mono', 'ui-monospace', 'monospace' ],
		}
	}
} satisfies Config
