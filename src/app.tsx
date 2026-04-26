import { createRoot } from 'react-dom/client'
import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Link, useLocation, useSearchParams } from 'react-router-dom'
import { ErrorBoundary, getErrorMessage } from 'react-error-boundary'

import { LS_RADIXES, AppContext, getCharsLS, sanitizeInput, serializeRadixes, unserializeRadixes } from './common.ts'
import { type Radix, createRadixes, createRadix, num2str, str2num, allowedCharaters, } from './radixes.ts'

import Header from './components/header.tsx'
import Show from './components/show.tsx'
import Add from './components/add.tsx'
import Multiply from './components/multiply.tsx'
import Convert from './components/convert.tsx'

import './app.css'


export type UpdateRadixes = (radixes: Radix[]) => void
export type UpdateValue = (value: bigint, radix?: Radix) => void

const BIG_INT_0 = 0n

createRoot(document.querySelector('#root')!).render(
	<BrowserRouter basename={import.meta.env.BASE_URL}>
		<App/>
	</BrowserRouter>
)

function App() {
	const [ error, setError ] = useState<unknown>()
	const updateError = (error: unknown) => { setError(error); setTimeout(() => { setError(undefined) }, 30_000) }
	const { radixes, enabledRadixes, updateRadixes, value, updateValue } = useStore(updateError)
	const { pathname, search } = useLocation()

	useEffect(() => {
		const keyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') setError(undefined) }
		document.addEventListener('keydown', keyDown)
		return () => { document.removeEventListener('keydown', keyDown) }
	}, [])

	return <ErrorBoundary onError={updateError} FallbackComponent={ErrorToast}>
		<AppContext value={{ updateError }}>
			{ getErrorMessage(error) && <ErrorToast error={error}/> }
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
		</AppContext>
	</ErrorBoundary>
}

function ErrorToast({ error }: { error: unknown}) {
	return <div className="toast toast-top toast-center z-50">
		<div className="alert alert-error">
			<pre>{ getErrorMessage(error) ?? 'Unknown error' }</pre>
		</div>
	</div>
}

function useStore(updateError: (error: unknown) => void) {
	const [ radixes, setRadixes ] = useState(getRadixesLS(updateError) ?? createRadixes(getCharsLS()))
	const [ enabledRadixes, setEnabledRadixes ] = useState(radixes.filter(r => r.enabled))
	const [ searchParams, setSearchParams ] = useSearchParams()
	const [ radix, setRadix ] = useState(createRadix(10))
	const [ value, setValue ] = useState(BIG_INT_0)

	const updateRadixes: UpdateRadixes = (radixes) => {
		setRadixes(radixes)

		const enabledRadixes = radixes.filter(v => v.enabled)
		setEnabledRadixes(enabledRadixes)

		searchParams.delete('r')
		enabledRadixes.forEach(r => { searchParams.append('r', r.name) })
		setSearchParams(searchParams)

		localStorage.setItem(LS_RADIXES, serializeRadixes(radixes))
	}

	const updateValue: UpdateValue = (value, r = radix) => {
		if (value === BIG_INT_0) {
			searchParams.delete('radix')
			searchParams.delete('value')
		} else {
			if (r.name === '10') {
				searchParams.delete('radix')
			} else {
				searchParams.set('radix', r.name)
			}
			searchParams.set('value', num2str(value, r))
		}
		setValue(value)
		setRadix(r)
		setSearchParams(searchParams)
	}

	useEffect(() => {
		if (searchParams.has('clear-settings')) localStorage.clear()

		if (searchParams.has('r')) {
			const searchRadixes = searchParams.getAll('r')
			radixes.forEach(r => { r.enabled = searchRadixes.includes(r.name) })
			updateRadixes(radixes)
			setEnabledRadixes(radixes.filter(r => r.enabled))
		} else {
			enabledRadixes.forEach(r => { searchParams.append('r', r.name) })
			setSearchParams(searchParams)
		}

		let r: Radix | undefined = radix

		const sRadix = searchParams.get('radix')
		if (sRadix) {
			r = radixes.find(r => r.name === sRadix)
			if (r == undefined) {
				updateError(new Error(`Unknown radix "${sRadix}" in the URL`))
				return
			}
			setRadix(r)
		}

		const sValue = searchParams.get('value')
		if (sValue) {
			const [ value, rest ] = sanitizeInput(sValue, r)
			setValue(str2num(value, r))
			if (rest) updateError(new Error(`Non-Base characters "${rest}" for radix "${r.name}" has been filtered out. ${allowedCharaters(r)}`))
		}
	}, [])

	return { radixes, enabledRadixes, updateRadixes, value, updateValue }
}

function getRadixesLS(updateError: (error: unknown) => void): Radix[] | undefined {
	const item = localStorage.getItem(LS_RADIXES)
	if (item == undefined) return

	try {
		return unserializeRadixes(item)
	} catch (error) {
		updateError(error)
		localStorage.removeItem(LS_RADIXES)
	}
}
