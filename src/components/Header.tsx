import { type FormEvent, useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import themeObject from 'daisyui/theme/object'

import {
	type Radix,
	defaultChars,
	getThemeLS,
	setThemeLS,
	getCharsLS,
	setCharsLS,
	createRadix,
} from '../utils'

const themes = Object.keys(themeObject).sort()

type ToggleRadixes = (radix: 'all' | 'odd' | 'even' | Radix['system'] | Radix, enabled: boolean) => void

let allChars = getCharsLS() ?? defaultChars

export default function Header({ radixes, updateRadixes }: {
	radixes: Radix[],
	updateRadixes: (radixes: Radix[]) => void,
}) {
	const navigate = useNavigate()
	const [ theme, setTheme ] = useState(getThemeLS)
	const [ expanded, setExpanded ] = useState(false)
	const [ inputRadix, setInputRadix ] = useState<number>()
	const [ inputChars, setInputChars ] = useState(allChars)
	const [ inputCharsError, setInputCharsError ] = useState<string>()
	const formRef = useRef<HTMLFormElement>(null)

	useEffect(() => {
		const keyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') setInputCharsError(undefined) }
		document.addEventListener('keydown', keyDown)

		return () => {
			document.removeEventListener('keydown', keyDown)
		}
	}, [])

	const toggleSettings = () => {
		updateInputRadix(inputRadix)
		setInputCharsError(undefined)
		setExpanded(!expanded)
	}

	const updateTheme = (theme: string) => {
		document.documentElement.setAttribute('data-theme', theme)
		setThemeLS(theme)
		setTheme(theme)
	}

	const updateInputRadix = (radix?: number | string) => {
		if (radix === 'All' || radix == null) {
			setInputRadix(undefined)
			setInputChars(allChars)
		} else {
			const r = Number(radix)
			setInputRadix(r)
			setInputChars(radixes[r].chars.join(''))
		}
	}

	const handleRadixCharsSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		setInputCharsError(undefined)

		try {
			if (inputRadix == null) {
				if (e.type === 'submit') {
					updateRadixesChars(undefined, inputChars)
					allChars = inputChars
				} else {
					if (allChars !== defaultChars) {
						allChars = defaultChars
						updateRadixesChars()
					}
					setInputChars(allChars)
				}
			} else {
				const newRadixes = updateRadixesChars(inputRadix, e.type === 'submit' ? inputChars : undefined)
				if (e.type === 'reset') setInputChars(newRadixes[inputRadix].chars.join(''))
			}
		} catch (error) {
			console.error(error)
			setInputCharsError((error as Error).message)
		}
	}

	const updateRadixesChars = (radix?: number, chars?: string) => {
		const charsArray = chars ? Array.from(chars) : undefined

		if (radix == null) {
			radixes = radixes.map(r => createRadix(Number(r.radix), r.system, charsArray, r.enabled, r.name))
			setCharsLS(chars !== defaultChars ? chars : undefined)
		} else {
			const r = radixes[radix]
			radixes[radix] = createRadix(Number(r.radix), r.system, charsArray, r.enabled, r.name, !charsArray)
		}

		updateRadixes(radixes)

		return radixes
	}

	const toggleRadixes: ToggleRadixes = (radix, enabled) => {
		switch (radix) {
			case 'all':
				radixes.forEach(r => r.enabled = enabled)
				break
			case 'odd':
				radixes.forEach(r => { if (r.radix % 2n === 1n) r.enabled = enabled })
				break
			case 'even':
				radixes.forEach(r => { if (r.radix % 2n === 0n) r.enabled = enabled })
				break
			case 'standard':
			case 'bijective':
			case 'balanced':
			case 'clock':
			case 'sum':
			case 'balsum':
				radixes.forEach(r => { if (r.system === radix) r.enabled = enabled })
				break
			default:
				radix.enabled = enabled
		}

		updateRadixes(radixes)
	}

	return <header className="p-2">
		<div className="navbar bg-base-100 p-0">
			<div className="flex-1">
				<button className="text-left text-4xl tracking-wide pl-2" onClick={toggleSettings}>
					<span style={{ color: 'hsl(0 80% 40%)'}}>R</span>
					<span style={{ color: 'hsl(36 80% 40%)'}}>a</span>
					<span style={{ color: 'hsl(72 80% 40%)'}}>d</span>
					<span style={{ color: 'hsl(108 80% 40%)'}}>i</span>
					<span style={{ color: 'hsl(144 80% 40%)'}}>x</span>
					<span style={{ color: 'hsl(180 80% 40%)'}}>V</span>
					<span style={{ color: 'hsl(216 80% 40%)'}}>e</span>
					<span style={{ color: 'hsl(252 80% 40%)'}}>r</span>
					<span style={{ color: 'hsl(288 80% 40%)'}}>s</span>
					<span style={{ color: 'hsl(324 80% 40%)'}}>e</span>
				</button>
			</div>
			<div className="z-10">
				<ul className="menu menu-horizontal justify-end gap-1 p-0">
					<li>
						<button className={`menu-dropdown-toggle ${expanded ? 'menu-dropdown-show' : ''}`} tabIndex={0}  onClick={toggleSettings}>Settings</button>
					</li>
					<li>
						<details>
							<summary>Themes</summary>
							<ul className="bg-base-100">{ themes.map(t =>
								<li key={t}>
									<button className={t === theme ? 'bg-base-200': ''} onClick={() => updateTheme(t)}>{ capitalize(t) }</button>
								</li>)}
							</ul>
						</details>
					</li>
				</ul>
			</div>
		</div>
		<div className={`collapse collapse-${expanded ? 'open' : 'close'}`}>
			<div className="collapse-content px-0">
				<div className="card card-border p-2">
					<div className="card-actions flex-row-reverse grow m-1">
						<button className="btn btn-xs btn-error" onClick={() => { localStorage.clear(); navigate(0) }}>
							Clear settings
						</button>
					<div className="flex flex-wrap flex-grow justify-center gap-2 m-1">
						<RadixesSelect who="all" toggleRadixes={toggleRadixes} />
						<RadixesSelect who="odd" toggleRadixes={toggleRadixes} />
						<RadixesSelect who="even" toggleRadixes={toggleRadixes} />
					</div>
					</div>
					{ /* TODO: Change to new Set(radixes...).values().map() when new Set methods and Iterator helpers gets standardized */ }
					<div className="card flex-row flex-wrap xl:flex-nowrap justify-center m-1">{ [ ...new Set(radixes.map(r => r.system)) ].map(rs =>
						<RadixSelect who={rs} radixes={radixes} toggleRadixes={toggleRadixes} key={rs}/>)}
					</div>
					<div className="flex flex-col justify-center items-center m-1">
						<div className="card card-border gap-2 p-2">
							<form className="flex flex-col md:flex-row justify-center items-center h-fit gap-1" onReset={handleRadixCharsSubmit} onSubmit={handleRadixCharsSubmit} ref={formRef}>
								<select
									className="select select-sm rounded-md bg-base-100 w-fit pl-2 pr-10 mr-1"
									name="radix"
									onChange={e => updateInputRadix(e.target.value) }
								>
									<option>All</option>
									{ radixes.map((r, i) => <option key={r.name} value={i}>{r.name}</option>) }
								</select>
								<div className={inputCharsError ? 'tooltip tooltip-error tooltip-open' : undefined} data-tip={inputCharsError}>
									<textarea
										className="field-sizing-content min-w-24 max-w-[calc(100vw-7.5ch)] md:max-w-[calc(100vw-30ch)] block resize-none rounded-lg leading-8 font-mono bg-base-100 p-0 px-2"
										name="chars"
										value={inputChars}
										onKeyDown={e => {
											e.stopPropagation()
											if (e.key === 'Enter' || e.key === 'Escape') {
												e.preventDefault()
												if (e.key === 'Enter') {
													formRef.current?.requestSubmit()
												} else {
													updateInputRadix(inputRadix)
													e.currentTarget.blur()
													setInputCharsError(undefined)
												}
											}
										}}
										onChange={e => { setInputCharsError(undefined); setInputChars(e.target.value) }}
									/>
								</div>
								<span className="flex flex-row join justify-center">
									<button className="btn btn-sm btn-outline btn-success join-item" type="reset">Reset</button>
									<button className="btn btn-sm btn-outline btn-error join-item" type="submit">Set</button>
								</span>
							</form>{ inputRadix !== undefined &&
							<div className="flex flex-row flex-wrap justify-center text-center text-xs">{ Array.from(radixes[inputRadix]?.values.entries()).map(([k, v]) =>
								<span key={k} className="font-mono p-1">
									{k}:{Number(v)}
								</span>) }
							</div>}
						</div>
					</div>
				</div>
			</div>
		</div>
	</header>
}

const RadixesSelect = ({ who, toggleRadixes }: { who: 'all' | 'odd' | 'even', toggleRadixes: ToggleRadixes }) =>
	<span className="join">
		<button
			className="btn btn-xs btn-outline btn-success join-item"
			onClick={() => toggleRadixes(who, true)}
		>
			Add
		</button>
		<button className="btn btn-xs btn-outline btn-neutral join-item pointer-events-none cursor-default">{ capitalize(who) }</button>
		<button
			className="btn btn-xs btn-outline btn-error join-item"
			onClick={() => toggleRadixes(who, false)}
		>
			Remove
		</button>
	</span>

const RadixSelect = ({ who, radixes, toggleRadixes }: { who: Radix['system'], radixes: Radix[], toggleRadixes: ToggleRadixes }) =>
	<div className="flex flex-col items-center md:max-w-[21rem] xl:max-w-none">
		<div className="card card-border p-1 m-1">
			<div className="flex justify-between items-center gap-2">
				<button
					className="btn btn-xs btn-outline btn-success m-1"
					onClick={() => toggleRadixes(who, true)}
				>
					Add
				</button>
				<div className="card-title">{ capitalize(who) }</div>
				<button
					className="btn btn-xs btn-outline btn-error m-1"
					onClick={() => toggleRadixes(who, false)}
				>
					Remove
				</button>
			</div>
			<div className="card-actions justify-center">{ radixes.filter(r => r.system === who).map(radix =>
				<button
					className={`btn btn-xs btn-outline btn-neutral ${radix.enabled ? 'btn-active' : ''} w-12 m-1`}
					key={radix.name}
					onClick={() => toggleRadixes(radix, !radix.enabled)}
				>
					{ String(radix.radix) }
				</button>) }
			</div>
		</div>
	</div>

function capitalize(string: string) {
	return string.charAt(0).toUpperCase() + string.slice(1)
}
