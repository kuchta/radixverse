// import ReactDOM from 'react-dom'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'


import App from './components/App'
import './app.css'


// ReactDOM.render(<App/>, document.getElementById('root'))
createRoot(document.getElementById('root')!).render(
	<BrowserRouter basename="/radixverse">
		<App/>
	</BrowserRouter>
)
