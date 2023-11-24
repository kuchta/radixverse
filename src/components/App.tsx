import { useState } from 'react'

import Header from './Header'
import Show from './Show'
import Add from './Add'
import Multiply from './Multiply'
import Convert from './Convert'
import { Radix, createRadixes, getCharsLS, getRadixesLS, setRadixesLS, str2arr } from '../utils'


export default function App() {
	const [ activeTab, setActiveTab ] = useState(0)
	const [ radixes, _setRadixes ] = useState(getRadixesLS() ?? createRadixes(str2arr(getCharsLS())))
	const [ enabledRadixes, setEnabledRadixes ] = useState(radixes.filter(v => v.enabled))

	// console.log('App: ', { enabledRadixes })

	const setRadixes = (radixes: Radix[]) => {
		setRadixesLS(radixes)
		_setRadixes(radixes)
		setEnabledRadixes(radixes.filter(v => v.enabled))
	}

	return <div className="font-mono">
		<Header radixes={radixes} setRadixes={setRadixes}/>
		<div className="tabs tabs-bordered justify-center mb-4">
			<button className={`tab ${activeTab === 0 ? 'tab-active' : ''}`}  onClick={() => setActiveTab(0)}>
				Show
			</button>
			<button className={`tab ${activeTab === 1 ? 'tab-active' : ''}`} onClick={() => setActiveTab(1)}>
				Add
			</button>
			<button className={`tab ${activeTab === 2 ? 'tab-active' : ''}`} onClick={() => setActiveTab(2)}>
				Multiply
			</button>
			<button className={`tab ${activeTab === 3 ? 'tab-active' : ''}`} onClick={() => setActiveTab(3)}>
				Convert
			</button>
		</div>
		<div style={{ display: activeTab !== 0 ? 'none' : 'unset' }}><Show radixes={enabledRadixes}/></div>
		<div style={{ display: activeTab !== 1 ? 'none' : 'unset' }}><Add radixes={enabledRadixes}/></div>
		<div style={{ display: activeTab !== 2 ? 'none' : 'unset' }}><Multiply radixes={enabledRadixes}/></div>
		<div style={{ display: activeTab !== 3 ? 'none' : 'unset' }}><Convert radixes={enabledRadixes}/></div>
	</div>
}
