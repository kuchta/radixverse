import { useState } from 'react'

import Header from './Header'
import Show from './Show'
import Add from './Add'
import Multiply from './Multiply'
import Convert from './Convert'
import { Radix, defaultChars, defaultCharsArray, createRadixes, createRadix, getRadixesLS, setCharsLS, setRadixesLS, s2a } from '../utils'


type Who = 'all' | 'odd' | 'even' | 'standard' | 'bijective' | 'balanced'

export type SetRadixes = (command: {
	who: Who, what: 'toggle', enabled: boolean } | {
	who: Radix, what: 'toggle' } | {
	who: Who, what: 'set-chars', chars?: string } | {
	who: Radix, what: 'set-chars', chars?: string }) => void

export default function App() {
	const [ activeTab, setActiveTab ] = useState(0)
	const [ radixes, _setRadixes ] = useState(getRadixesLS() ?? createRadixes())
	const [ enabledRadixes, setEnabledRadixes ] = useState(radixes.filter(v => v.enabled))

	const setRadixes: SetRadixes = (command) => {
		// console.log('setRadixes:', command)

		let newRadixes = radixes

		switch (command.who) {
			case 'all': {
				if (command.what === 'toggle') {
					radixes.forEach(r => r.enabled = command.enabled)
				} else if (command.what === 'set-chars') {
					const chars = s2a(command.chars)
					if (chars && chars.length !== defaultCharsArray.length) {
						throw new Error(`Invalid number of chars provided: ${chars.length}, expected: ${defaultCharsArray.length}`)
					}
					setCharsLS(command.chars && command.chars !== defaultChars ? command.chars : undefined)
					newRadixes = createRadixes(chars)
				}
			} break
			case 'odd': if (command.what === 'toggle') {
					radixes.forEach(r => { if (r.radix % 2n === 1n) r.enabled = command.enabled })
			} break
			case 'even': {
				if (command.what === 'toggle') {
					radixes.forEach(r => { if (r.radix % 2n === 0n) r.enabled = command.enabled })
				}
			} break
			case 'standard': {
				if (command.what === 'toggle') {
					radixes.forEach(r => { if (r.system === 'standard') r.enabled = command.enabled })
				}
			} break
			case 'bijective': {
				if (command.what === 'toggle') {
					radixes.forEach(r => { if (r.system === 'bijective') r.enabled = command.enabled })
				}
			} break
			case 'balanced': {
				if (command.what === 'toggle') {
					radixes.forEach(r => { if (r.system === 'balanced') r.enabled = command.enabled })
				}
			} break
			default: {
				if (command.what === 'toggle') {
					command.who.enabled = !command.who.enabled
				} else if (command.what === 'set-chars') {
					const i = radixes.findIndex(r => r.name === command.who.name)
					const oldRadix = radixes[i]
					const chars = s2a(command.chars)
					if (chars != undefined) {
						if (chars.length !== oldRadix.chars.length) {
							throw new Error(`Invalid number of chars provided: ${chars.length}, expected: ${oldRadix.chars.length}`)
						}
					}
					const newRadix = createRadix(Number(oldRadix.radix), oldRadix.system, chars, oldRadix.enabled)
					radixes[i] = newRadix
				}
			}
		}
		// console.log('setRadixes: newRadixes:', newRadixes)
		setRadixesLS(newRadixes)
		_setRadixes(newRadixes)
		setEnabledRadixes(newRadixes.filter(v => v.enabled))
	}

	// console.log('App: ', { enabledRadixes })

	return <div className="font-mono">
		<Header radixes={radixes} setRadixes={setRadixes}/>
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
