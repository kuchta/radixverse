import { defineConfig } from 'vite'
// import ttsc from '@ttsc/unplugin/vite'
// import legacy from '@vitejs/plugin-legacy'
import react /* , { reactCompilerPreset } */ from '@vitejs/plugin-react'
// import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'
// import { VitePWA as pwa } from 'vite-plugin-pwa'
import { serwist } from '@serwist/vite'

export default defineConfig({
	base: process.env.BASE_URL ?? '/',
	build: { sourcemap: true },
	plugins: [
		// legacy({
		// 	modernTargets: 'chrome>=122, edge>=122, safari>=18, firefox>=131, chromeAndroid>=132, iOS>=18',
		// 	renderLegacyChunks: false,
		// }),
		// ttsc(),
		react({ compiler: true }),
		// babel({ presets: [ reactCompilerPreset() ] }),
		tailwindcss(),
		// pwa({
		// 	devOptions: { enabled: true },
		// 	injectRegister: 'script',
		// 	registerType: 'autoUpdate',
		// 	includeAssets: [ 'images/*.{ico,png}' ],
		// 	manifest:
		// })
		serwist({
			swSrc: 'src/sw.ts',
			swDest: 'sw.js',
			globDirectory: 'dist',
			injectionPoint: 'self.__SW_MANIFEST',
			rollupFormat: 'iife',
		}),
	]
})
