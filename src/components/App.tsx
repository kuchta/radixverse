
// @ts-types="@types/react"
import { useEffect, useState } from 'react'
import { Routes, Route, Link, useLocation, useSearchParams } from 'react-router-dom'

import Header from './Header'
import Show from './Show'
import Add from './Add'
import Multiply from './Multiply'
import Convert from './Convert'
import {
	type Radix,
	createRadixes,
	createRadix,
	getCharsLS,
	getRadixesLS,
	setRadixesLS,
	num2str,
	str2num,
	allowedCharaters,
	sanitizeInput
} from '../utils'


export default function App() {
	const [ error, setError ] = useState<string>()
	const updateError = (error?: string) => { setError(error); setTimeout(() => setError(undefined), 10000) }
	const { radixes, enabledRadixes, updateRadixes, value, updateValue } = useStore(updateError)
	const { pathname, search } = useLocation()

	// console.log('App: ', { value })

	return <>
		{ error && <div className="toast toast-top toast-center z-50">
			<div className="alert alert-error">
				<span>{ error }</span>
			</div>
		</div>}
		<Header radixes={radixes} updateRadixes={updateRadixes}/>
		<nav className="tabs tabs-bordered justify-center mb-4 z-10">
			<Link className={`tab ${pathname === '/' ? 'tab-active' : ''}`} to={`/${search}`}>Show</Link>
			<Link className={`tab ${pathname.includes('add') ? 'tab-active' : ''}`} to={`add${search}`}>Add</Link>
			<Link className={`tab ${pathname.includes('multiply') ? 'tab-active' : ''}`} to={`multiply${search}`}>Multiply</Link>
			<Link className={`tab ${pathname.includes('convert') ? 'tab-active' : ''}`} to={`convert${search}`}>Convert</Link>
		</nav>
		<Routes>
			<Route path="/" element={<Show radixes={enabledRadixes}/>}/>
			<Route path="add" element={<Add radixes={enabledRadixes}/>}/>
			<Route path="multiply" element={<Multiply radixes={enabledRadixes}/>}/>
			<Route path="convert" element={<Convert radixes={enabledRadixes} value={value} updateValue={updateValue}/>}/>
		</Routes>
	</>
}

function useStore(updateError: (error?: string) => void) {
	const [ radixes, setRadixes ] = useState(getRadixesLS() ?? createRadixes(getCharsLS()))
	const [ enabledRadixes, setEnabledRadixes ] = useState(radixes.filter(r => r.enabled))
	const [ searchParams, setSearchParams ] = useSearchParams()
	const [ _value, setValue ] = useState(0n)
	const [ _radix, setRadix ] = useState(createRadix(10))

	useEffect(() => {
		try {
			if (searchParams.has('clear-settings')) localStorage.clear()
			if (searchParams.has('r')) {
				const searchRadixes = searchParams.getAll('r')
				radixes.forEach(r => r.enabled = searchRadixes.includes(r.name))
				updateRadixes(radixes)
				setEnabledRadixes(radixes.filter(r => r.enabled))
			}
			let radix = _radix
			const sRadix = searchParams.get('radix')
			if (sRadix) {
				const r = radixes.find(r => r.name === sRadix)
				if (r == null) throw new Error(`Unknown radix "${r}" in the URL`)
				setRadix(radix = r)
			}
			const sValue = searchParams.get('value')
			if (sValue) {
				const [ value, rest ] = sanitizeInput(sValue, radix)
				setValue(str2num(value, radix))
				if (rest) throw new Error(`Non-Base characters "${rest}" has been filtered out. ${allowedCharaters(radix)}`)
			}
		} catch (error) {
			console.error(error)
			updateError((error as Error).message)
		}
	}, [])

	const updateRadixes = (radixes: Radix[]) => {
		setRadixesLS(radixes)
		setRadixes(radixes)
		const enabledRadixes = radixes.filter(v => v.enabled)
		setEnabledRadixes(enabledRadixes)
		searchParams.delete('r')
		setSearchParams([ ...searchParams, ...enabledRadixes.map(r => ['r', r.name]) ] as [string, string][])
		updateValue(_value, radixes.find(r => r.name === _radix.name))
	}

	const updateValue = (value: bigint, radix?: Radix) => {
		if (value === 0n) {
			searchParams.delete('radix')
			searchParams.delete('value')
			setSearchParams(searchParams)
		} else {
			try {
				const r = radix ?? _radix ?? createRadix(10, 'standard')
				if (radix) {
					setRadix(radix)
					searchParams.set('radix', r.name)
				}
				searchParams.set('value', num2str(value, r))
				setSearchParams(searchParams)
			} catch (error) {
				console.error(error)
				updateError((error as Error).message)
			}
		}
		setValue(value)
	}

	return { radixes, enabledRadixes, updateRadixes, value: _value, updateValue }
}
