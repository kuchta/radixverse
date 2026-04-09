import { defineConfig } from 'vite'
// import legacy from '@vitejs/plugin-legacy'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA as pwa } from 'vite-plugin-pwa'

const name = 'RadixVerse'

export default defineConfig({
	base: process.env.BASE_URL ?? '/',
	build: { sourcemap: true },
	plugins: [
		// legacy({
		// 	modernTargets: 'chrome>=122, edge>=122, safari>=18, firefox>=131, chromeAndroid>=132, iOS>=18',
		// 	modernPolyfills: [ 'es/iterator' ],
		// 	renderLegacyChunks: false,
		// }),
		react(),
		babel({ presets: [ reactCompilerPreset() ] }),
		tailwindcss(),
		pwa({
			devOptions: { enabled: true },
			injectRegister: 'script',
			registerType: 'autoUpdate',
			includeAssets: ['images/*.{ico,png}'],
			manifest: {
				name,
				short_name: name,
				display: 'standalone',
				theme_color: '#f1f1f1',
				background_color: '#f1f1f1',
				icons: [{
					src: 'images/icon-64x64.png',
					sizes: '64x64',
					type: 'image/png'
				}, {
					src: 'images/icon-192x192.png',
					sizes: '192x192',
					type: 'image/png'
				}, {
					src: 'images/icon-512x512.png',
					sizes: '512x512',
					type: 'image/png'
				}, {
					src: 'images/icon-512x512.png',
					sizes: '512x512',
					type: 'image/png',
					purpose: 'maskable'
				}]
			}
		})
	]
})
