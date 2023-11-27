import { useEffect, useState } from 'react'
import { Routes, Route, Link, useSearchParams, useLocation } from "react-router-dom";

import Header from './Header'
import Show from './Show'
import Add from './Add'
import Multiply from './Multiply'
import Convert from './Convert'
import { Radix, createRadixes, createRadix, getCharsLS, getRadixesLS, setRadixesLS, str2arr, num2str, str2num, allowedCharaters, sanitizeInput } from '../utils'


export default function App() {
	const { radixes, enabledRadixes, setRadixes, value, setValue, error } = useStore()
	const { pathname, search } = useLocation()

	// console.log('App: ', { value })

	return <>
		{ error && <div className="toast toast-top toast-center">
			<div className="alert alert-error">
				<span>{ error }</span>
			</div>
		</div> }
		<Header radixes={radixes} setRadixes={setRadixes}/>
		<nav className="tabs tabs-bordered justify-center mb-4">
			<Link className={`tab ${pathname === '/' ? 'tab-active' : ''}`} to={`/${search}`}>Show</Link>
			<Link className={`tab ${pathname.includes('add') ? 'tab-active' : ''}`} to={`add${search}`}>Add</Link>
			<Link className={`tab ${pathname.includes('multiply') ? 'tab-active' : ''}`} to={`multiply${search}`}>Multiply</Link>
			<Link className={`tab ${pathname.includes('convert') ? 'tab-active' : ''}`} to={`convert${search}`}>Convert</Link>
		</nav>
		<Routes>
			<Route path="/" element={<Show radixes={enabledRadixes}/>}/>
			<Route path="add" element={<Add radixes={enabledRadixes}/>}/>
			<Route path="multiply" element={<Multiply radixes={enabledRadixes}/>}/>
			<Route path="convert" element={<Convert radixes={enabledRadixes} value={value} setValue={setValue}/>}/>
		</Routes>
	</>
}

function useStore() {
	const [ radixes, _setRadixes ] = useState(getRadixesLS() ?? createRadixes(str2arr(getCharsLS())))
	const [ enabledRadixes, setEnabledRadixes ] = useState(radixes.filter(v => v.enabled))
	const [ searchParams, setSearchParams ] = useSearchParams()
	const [ _value, _setValue ] = useState(0n)
	const [ _radix, _setRadix ] = useState(createRadix(10))
	const [ error, setError ] = useState<string>()

	useEffect(() => {
		try {
			if (searchParams.has('r')) {
				const searchRadixes = searchParams.getAll('r')
				radixes.forEach(r => r.enabled = searchRadixes.includes(r.name))
				setRadixes(radixes)
				setEnabledRadixes(radixes.filter(v => v.enabled))
			}
			let rx = _radix
			if (searchParams.has('radix')) {
				rx = radixes.find(r => r.name === searchParams.get('radix'))!
				_setRadix(rx)
			}
			if (searchParams.has('value')) {
				const [ value, rest ] = sanitizeInput(searchParams.get('value')!, rx)
				_setValue(str2num(value, rx))
				if (rest) {
					setError(`Non-Base characters "${rest}" has been filtered out. ${allowedCharaters(rx)}`)
					setTimeout(() => setError(undefined), 10000)
				}
			}
		} catch (error) {
			setError((error as Error).message)
			setTimeout(() => setError(undefined), 10000)
		}
	}, [])

	const setRadixes = (radixes: Radix[]) => {
		setRadixesLS(radixes)
		_setRadixes(radixes)
		const enabledRadixes = radixes.filter(v => v.enabled)
		setEnabledRadixes(enabledRadixes)
		searchParams.delete('r')
		setSearchParams([ ...searchParams, ...enabledRadixes.map(r => ['r', r.name]) ] as [string, string][])
	}

	const setValue = (value: bigint | ((value: bigint) => bigint), radix?: Radix) => {
		value = (typeof value === 'function') ? value(_value) : value
		if (value === 0n) {
			searchParams.delete('radix')
			searchParams.delete('value')
			setSearchParams(searchParams)
		} else {
			try {
				const r = radix ?? _radix ?? createRadix(10, 'standard')
				if (radix) {
					_setRadix(radix)
					searchParams.set('radix', r.name)
				}
				searchParams.set('value', num2str(value, r))
				setSearchParams(searchParams)
			} catch (error) {
				setError((error as Error).message)
			}
		}
		_setValue(value)
	}

	return { radixes, enabledRadixes, setRadixes, value: _value, setValue, error }
}
