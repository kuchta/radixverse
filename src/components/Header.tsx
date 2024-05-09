import { type FormEventHandler, useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import resolveConfig from 'tailwindcss/resolveConfig'
// import { Combobox } from '@headlessui/react'
import themes from 'daisyui/src/theming/themes'

import tailwindConfig from '../../tailwind.config'
import {
	type Radix,
	defaultChars,
	getThemeLS,
	setThemeLS,
	getCharsLS,
	setCharsLS,
	createRadix,
} from '../utils'


type ToggleRadixes = (radix: 'all' | 'odd' | 'even' | Radix['system'] | Radix, enabled: boolean) => void

const twConfig = resolveConfig(tailwindConfig)

const md = Number(twConfig.theme.screens.md.slice(0, -2))
const xl = Number(twConfig.theme.screens.xl.slice(0, -2))

let allChars = getCharsLS() ?? defaultChars

export default function Header({ radixes, updateRadixes }: {
	radixes: Radix[],
	updateRadixes: (radixes: Radix[]) => void,
}) {
	const navigate = useNavigate()
	const [ theme, setTheme ] = useState(getThemeLS)
	const [ expanded, setExpanded ] = useState(false)
	const [ inputRadix, setInputRadix ] = useState<'all' | number>('all')
	const [ inputChars, setInputChars ] = useState(allChars)
	const [ inputCharsError, setInputCharsError ] = useState<string>()
	const [ inputStyle, setInputStyle ] = useState({ width: '71em', height: '1em' })
	const [ screenWidth, setScreenWidth ] = useState(window.innerWidth)
	const [ formColumn, setFormColumn ] = useState(false)
	const formRef = useRef<HTMLFormElement>(null)

	useEffect(() => {
		const keyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') setInputCharsError(undefined) }
		document.addEventListener('keydown', keyDown)

		const handleResize = () => setScreenWidth(window.innerWidth)
		window.addEventListener('resize', handleResize)

		return () => {
			document.removeEventListener('keydown', keyDown)
			window.removeEventListener('resize', handleResize)
		}
	}, [])

	useEffect(() => {
		const balanced = inputRadix === 'all' || radixes[inputRadix]?.system === 'balanced' || radixes[inputRadix]?.system === 'balsum'
		let length = Array.from(inputChars).length * (balanced ? 1.55 : 1.2)
		if (length < 10) length = 10

		let style = { width: `${length}ex`, height: '1lh' }
		if (screenWidth < md) {
			setFormColumn(true)
			if (length > 55) style = { width: `${length / 3}ex`, height: '3lh' }
		} else if (screenWidth < xl) {
			setFormColumn(false)
			if (length > 55) style = { width: `${length / 2}ex`, height: '2lh' }
		} else {
			setFormColumn(false)
		}
		setInputStyle(style)

	}, [ inputChars, inputRadix, radixes, screenWidth ])

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

	const updateInputRadix = (radix: string | number) => {
		if (radix === 'all') {
			setInputRadix(radix)
			setInputChars(allChars)
		} else {
			const r = Number(radix)
			setInputRadix(r)
			setInputChars(radixes[r].chars.join(''))
		}
	}

	const handleRadixCharsSubmit: FormEventHandler<HTMLFormElement> = (e) => {
		e.preventDefault()
		setInputCharsError(undefined)

		const data = new FormData(e.currentTarget)
		const radix = data.get('radix') as 'all' | number
		const chars = data.get('chars') as string

		try {
			if (radix ==='all') {
				if (e.type === 'submit') {
					updateRadixesChars('all', chars)
					allChars = chars
				} else {
					if (allChars !== defaultChars) {
						allChars = defaultChars
						updateRadixesChars('all')
					}
					setInputChars(allChars)
				}
			} else {
				const newRadixes = updateRadixesChars(radix, e.type === 'submit' ? chars : undefined)
				if (e.type === 'reset') setInputChars(newRadixes[radix].chars.join(''))
			}
		} catch (error) {
			console.error(error)
			setInputCharsError((error as Error).message)
		}
	}

	const updateRadixesChars = (radix: 'all' | number, chars?: string) => {
		const charsArray = chars ? Array.from(chars) : undefined

		if (radix === 'all') {
			radixes = radixes.map(r => createRadix(Number(r.radix), r.system, charsArray, r.enabled, r.name))
			setCharsLS(chars !== defaultChars ? chars : undefined)
		} else {
			const r = radixes[radix]
			radixes[radix] = createRadix(Number(r.radix), r.system, charsArray, r.enabled, r.name, !!chars)
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
							<ul className="bg-base-100">{ Object.keys(themes).sort().map(t =>
								<li key={t}>
									<button className={t === theme ? 'active': ''} onClick={() => updateTheme(t)}>{ capitalize(t) }</button>
								</li>)}
							</ul>
						</details>
					</li>
				</ul>
			</div>
		</div>
		<div className={`collapse collapse-${expanded ? 'open' : 'close'} `}>
			<div className="collapse-content px-0">
				<div className="card card-bordered">
					<div className="card-actions flex-row-reverse grow p-2">
						<button className="btn btn-xs btn-error" onClick={() => { localStorage.clear(); navigate(0) }}>
							Clear settings
						</button>
					<div className="flex flex-wrap flex-grow justify-center gap-2">
						<RadixesSelect who="all" toggleRadixes={toggleRadixes} />
						<RadixesSelect who="odd" toggleRadixes={toggleRadixes} />
						<RadixesSelect who="even" toggleRadixes={toggleRadixes} />
					</div>
					</div>
					{ /* TODO: Change to new Set(radixes...).values().map() when new Set methods and Iterator helpers gets standardized */ }
					<div className="card flex-row flex-wrap xl:flex-nowrap justify-center p-1">{ [ ...new Set(radixes.map(r => r.system)) ].map(rs =>
						<RadixSelect who={rs} radixes={radixes} toggleRadixes={toggleRadixes} key={rs}/>)}
					</div>
					<div className="flex flex-col justify-center items-center p-2">
						<div className="card card-bordered max-w-full">
							<form className={`flex ${formColumn ? 'flex-col' : 'flex-row'} justify-center items-center gap-1 p-2`} onReset={handleRadixCharsSubmit} onSubmit={handleRadixCharsSubmit} ref={formRef}>
								<select
									className="select select-xs text-sm rounded-md bg-base-100"
									name="radix"
									defaultValue="all"
									onChange={e => updateInputRadix(e.target.value) }
								>
									<option value="all">All</option>
									{ radixes.map((r, i) => <option key={r.name} value={i}>{r.name}</option>) }
								</select>
								{/* <Combobox value={typeof inputRadix === 'string' ? inputRadix : radixes[inputRadix].name} onChange={updateInputRadix}>
									<div className="dropdown">
										<Combobox.Input className="input input-xs w-28" onChange={e => setInputRadix(e.target.value)} />
										<Combobox.Options className="dropdown-content menu menu-dropdown menu-dropdown-toggle rounded-box shadow bg-base-100 z-50 w-28">
											{ [ { name: 'all' }, ...radixes ].filter(r => r.name.startsWith(inputRadix)).map((r, i) =>
											<Combobox.Option className="" key={r.name} value={i}>
												<a>{r.name}</a>
											</Combobox.Option>
											)}
										</Combobox.Options>
									</div>
								</Combobox> */}
								<span className={inputCharsError ? 'tooltip tooltip-bottom tooltip-error tooltip-open inline' : ''} data-tip={inputCharsError}>
									<textarea
										className="font-mono align-middle resize-none bg-base-100 rounded-lg p-0"
										style={inputStyle}
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
								</span>
								<span className="flex flex-row join justify-center">
									<button className="btn btn-xs btn-outline btn-success join-item" type="reset">Reset</button>
									<button className="btn btn-xs btn-outline btn-error join-item" type="submit">Set</button>
								</span>
							</form>
							<div className="flex flex-row flex-wrap justify-center text-center text-xs">{ inputRadix !== 'all' && Array.from(radixes[inputRadix]?.values.entries()).map(([k, v]) =>
								<span key={k} className="font-mono p-1">
									{k}:{Number(v)}
								</span>) }
							</div>
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
		<span className="btn btn-xs btn-outline pointer-events-none join-item cursor-default">{ capitalize(who) }</span>
		<button
			className="btn btn-xs btn-outline btn-error join-item"
			onClick={() => toggleRadixes(who, false)}
		>
			Remove
		</button>
	</span>

const RadixSelect = ({ who, radixes, toggleRadixes }: { who: Radix['system'], radixes: Radix[], toggleRadixes: ToggleRadixes }) =>
	<div className="flex flex-col items-center md:max-w-[21rem] xl:max-w-none">
		<div className="card card-bordered p-1 m-1">
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
					className={`btn btn-xs btn-outline ${radix.enabled ? 'btn-active' : ''} w-12 m-1`}
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
