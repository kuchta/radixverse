import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import packageJson from './package.json'


export default defineConfig({
	base: `/${packageJson.name}`,
	plugins: [ react() ]
})
