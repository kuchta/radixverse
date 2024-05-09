import type { Config } from 'tailwindcss'
import daisyui from 'daisyui'


export default {
	content: [ './index.html', './src/**/*.{js,ts,jsx,tsx}' ],
	plugins: [ daisyui ],
	daisyui: { themes: true },
	theme: {
		fontFamily: {
			// sans: [ 'Dingbats', 'ui-sans-serif', 'sans-serif' ],
			// serif: [ 'Dingbats', 'ui-serif', 'serif' ],
			mono: [ 'Noto Sans Symbol', 'ui-monospace', 'monospace' ],
		}
	}
} satisfies Config
