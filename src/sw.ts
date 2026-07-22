import { defaultCache } from '@serwist/vite/worker'
import { Serwist, type PrecacheEntry, type SerwistGlobalConfig } from 'serwist'

declare global {
	interface WorkerGlobalScope extends SerwistGlobalConfig { // oxlint-disable-line consistent-type-definitions
		__SW_MANIFEST: (PrecacheEntry | string)[] | undefined,
	}
}

declare const self: ServiceWorkerGlobalScope

const serwist = new Serwist({
	precacheEntries: self.__SW_MANIFEST,
	skipWaiting: true,
	clientsClaim: true,
	navigationPreload: true,
	runtimeCaching: defaultCache,
})

serwist.addEventListeners()
