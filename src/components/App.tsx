import { useState } from 'react'

import Header from './Header'
import Show from './Show'
import Add from './Add'
import Multiply from './Multiply'
import Convert from './Convert'
import { Radix, radixes } from '../utils'


export default function App() {
	const [ activeTab, setActiveTab ] = useState(0)
	const [ enabledRadixes, setEnabledRadixes ] = useState(radixes.filter(v => v.enabled))

	const toggleRadix = (radix: Radix) => {
		radix.enabled = !radix.enabled
		setEnabledRadixes(radixes.filter(v => v.enabled))
	}

	console.log('App: ', { enabledRadixes })

	return <div className="font-mono">
		<Header radixes={radixes} toggleRadix={toggleRadix}/>
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
		<div style={{ display: activeTab !== 0 ? 'none' : 'unset' }}><Show tab="show" radixes={enabledRadixes}/></div>
		<div style={{ display: activeTab !== 1 ? 'none' : 'unset' }}><Add tab="add" radixes={enabledRadixes}/></div>
		<div style={{ display: activeTab !== 2 ? 'none' : 'unset' }}><Multiply tab="multiply" radixes={enabledRadixes}/></div>
		<div style={{ display: activeTab !== 3 ? 'none' : 'unset' }}><Convert tab="convert" radixes={enabledRadixes}/></div>
	</div>
}
