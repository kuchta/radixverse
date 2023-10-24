// import ReactDOM from 'react-dom'
import { createRoot } from 'react-dom/client'
import '@formatjs/intl-segmenter/polyfill'

import App from './components/App'
import './app.css'


// ReactDOM.render(<App/>, document.getElementById('root'))
createRoot(document.getElementById('root')!).render(<App />)
