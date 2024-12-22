/// <reference types="vite/client" />
// @ts-types="vite/client"
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import App from './components/App.tsx'
import './app.css'


createRoot(document.getElementById('root')!).render(
	<BrowserRouter basename={import.meta.env.BASE_URL}>
		<App/>
	</BrowserRouter>
)
