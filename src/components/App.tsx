import { useState } from 'react'

import Header from './Header'
import Show from './Show'
import Add from './Add'
import Multiply from './Multiply'
import Convert from './Convert'
import { Radix, createRadixes } from '../utils'


export default function App() {
	const [ activeTab, setActiveTab ] = useState(0)
	const [ radixes, setRadixes ] = useState(createRadixes())
	const [ enabledRadixes, setEnabledRadixes ] = useState(radixes.filter(v => v.enabled))

	const setAndFilterRadixes = (radixes: Radix[]) => {
		setRadixes(radixes)
		setEnabledRadixes(radixes.filter(v => v.enabled))
	}

	// console.log('App: ', { enabledRadixes })

	return <div className="font-mono">
		<Header radixes={radixes} setRadixes={setAndFilterRadixes}/>
		<div className="tabs justify-center mb-4">
			<button className={`tab tab-bordered ${activeTab === 0 ? 'tab-active' : ''}`}  onClick={() => setActiveTab(0)}>
				Show
			</button>
			<button className={`tab tab-bordered ${activeTab === 1 ? 'tab-active' : ''}`} onClick={() => setActiveTab(1)}>
				Add
			</button>
			<button className={`tab tab-bordered ${activeTab === 2 ? 'tab-active' : ''}`} onClick={() => setActiveTab(2)}>
				Multiply
			</button>
			<button className={`tab tab-bordered ${activeTab === 3 ? 'tab-active' : ''}`} onClick={() => setActiveTab(3)}>
				Convert
			</button>
		</div>
		<div style={{ display: activeTab !== 0 ? 'none' : 'unset' }}><Show radixes={enabledRadixes}/></div>
		<div style={{ display: activeTab !== 1 ? 'none' : 'unset' }}><Add radixes={enabledRadixes}/></div>
		<div style={{ display: activeTab !== 2 ? 'none' : 'unset' }}><Multiply radixes={enabledRadixes}/></div>
		<div style={{ display: activeTab !== 3 ? 'none' : 'unset' }}><Convert radixes={enabledRadixes}/></div>
	</div>
}
