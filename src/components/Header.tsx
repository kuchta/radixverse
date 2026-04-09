import { type ReactEventHandler, type KeyboardEventHandler, useState, useMemo, useEffectEvent, useEffect, useRef, useCallback } from 'react'
import { getErrorMessage } from 'react-error-boundary'

import TextareaAutosize from 'react-textarea-autosize'
import themeObject from 'daisyui/theme/object.js'

import type { UpdateRadixes, ClearSettings } from '#/app.tsx'
import { type Radix, createRadix, getThemeLS, setThemeLS, defaultChars, getCharsLS, setCharsLS } from '#/utils.ts'


type ToggleRadixes = (radix: 'all' | 'odd' | 'even' | Radix['system'] | Radix, enabled: boolean) => void
const themes = Object.keys(themeObject).toSorted()

export default function Header({ radixes, updateRadixes, clearSettings }: {
	radixes: Radix[],
	updateRadixes: UpdateRadixes,
	clearSettings: ClearSettings,
}) {
	const [ settingsExpanded, setSettingsExpanded ] = useState(false)
	const [ theme, setTheme ] = useState(getThemeLS)
	const [ allChars, setAllChars ] = useState(getCharsLS() ?? defaultChars)
	const [ inputRadix, setInputRadix ] = useState<Radix>()
	const [ inputChars, setInputChars ] = useState(allChars)
	const [ inputCharsError, setInputCharsError ] = useState<string>()
	const formRef = useRef<HTMLFormElement>(null)

	const radixesSystems = useMemo(() => [ ...new Set(radixes.map(r => r.system)) ], [ radixes ])
	const groupedRadixes = useMemo(() => Object.values(Object.groupBy(radixes, r => r.system)), [ radixes ])
	const toggleRadixes = useMemo(() => createToggleRadixes(radixes, updateRadixes), [ radixes, updateRadixes ])
	const toggleSettings = useCallback(() => { setSettingsExpanded(!settingsExpanded) }, [ settingsExpanded ])

	const updateTheme = useCallback((theme: string) => {
		document.documentElement.setAttribute('data-theme', theme)
		setTheme(theme)
		setThemeLS(theme)
	}, [])

	const updateInputRadix = useCallback((radix?: string) => {
		let r: Radix | undefined
		let chars: string

		if (radix == undefined || radix === 'All') {
			chars = allChars
		} else {
			r = radixes.find(r => r.name === radix)
			if (r) {
				chars = r.chars
			} else {
				throw new Error(`Radix ${radix} not found`)
			}
		}
		setInputRadix(r)
		setInputChars(chars)
	}, [ allChars, radixes ])

	const handleInputCharsSubmit = useCallback<ReactEventHandler<HTMLFormElement>>((e) => {
		e.preventDefault()
		setInputCharsError(undefined)

		let rs = radixes
		let chars: string
		if (inputRadix) { // specific radix
			if (e.type === 'submit') {
				chars = inputChars
			} else {
				chars = inputRadix.chars
				setInputChars(inputRadix.chars)
			}
			const i = radixes.findIndex(r => r.name === inputRadix.name)
			const r = radixes[i]
			rs = [ ...radixes ]
			try {
				rs[i] = createRadix(Number(r.radix), r.system, chars, r.enabled, r.name, false)
			} catch (error) {
				setInputCharsError(getErrorMessage(error))
			}
		} else { // all radixes
			if (e.type === 'submit') {
				setAllChars(inputChars)
				setCharsLS(inputChars)
				chars = inputChars
			} else {
				setInputChars(defaultChars)
				setAllChars(defaultChars)
				setCharsLS(undefined)
				chars = defaultChars
			}

			try {
				rs = radixes.map(r => createRadix(Number(r.radix), r.system, chars, r.enabled, r.name))
			} catch (error) {
				setInputCharsError(getErrorMessage(error))
			}
		}
		updateRadixes(rs)
	}, [ inputRadix, inputChars, radixes, updateRadixes ])

	const handleInputCharsKeyDown = useCallback<KeyboardEventHandler<HTMLTextAreaElement>>(e => {
		e.stopPropagation()
		if (e.key === 'Enter' || e.key === 'Escape') {
			e.preventDefault()
			if (e.key === 'Enter') {
				formRef.current?.requestSubmit()
			} else {
				setInputCharsError(undefined)
				updateInputRadix(inputRadix?.name)
				e.currentTarget.blur()
			}
		}
	}, [ inputRadix, updateInputRadix ])

	const keyDown = useEffectEvent((e: KeyboardEvent) => { if (e.key === 'Escape') setInputCharsError(undefined) })

	useEffect(() => {
		document.addEventListener('keydown', keyDown)
		return () => { document.removeEventListener('keydown', keyDown) }
	}, [])

	return <header className="p-2">
		<div className="navbar bg-base-100 p-0">
			<div className="navbar-start">
				<button className="text-left text-4xl tracking-wide pl-2" type="button" onClick={toggleSettings} tabIndex={-1}>
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
			<menu className="navbar-end menu menu-horizontal p-0 z-10">
				<li>
					<button
						className={`menu-dropdown-toggle ${settingsExpanded ? 'menu-dropdown-show' : ''}`}
						type="button"
						onClick={toggleSettings}
						tabIndex={0}
					>Settings</button>
				</li>
				<li>
					<details className="dropdown dropdown-end">
						<summary>Themes</summary>
						<menu className="dropdown-content rounded-field bg-base-100 shadow-sm p-2 mt-0">{ themes.map(t =>
							<li key={t}>
								<button className={t === theme ? 'menu-active' : undefined} onClick={() => { updateTheme(t) }} tabIndex={0}>{capitalize(t)}</button>
							</li>)}
						</menu>
					</details>
				</li>
				{/* <li className="dropdown dropdown-end">
					<div
						role="button"
						className="menu-dropdown-toggle menu-dropdown-toggle-active"
						tabIndex={0}
					>Themes</div>
					<menu className="dropdown-content menu-vertical items-stretch rounded-field bg-base-100 shadow-sm p-2 mt-1">{ themes.map(t =>
						<li key={t}>
							<a className={`${t === theme ? 'menu-active' : undefined}`} onClick={() => updateTheme(t)} tabIndex={0}>{capitalize(t)}</a>
						</li>)}
					</menu>
				</li>
				<li>
					<button
						className="menu-dropdown-toggle peer-open:menu-dropdown-show [anchor-name:--dp-1] px-4 mr-4"
						popoverTarget="popover"
						tabIndex={0}
					>
						Themes
					</button>
					<menu
						className="peer dropdown menu-vertical items-stretch rounded-field bg-base-100 shadow-sm [position-anchor:--dp-1] [position-area:bottom_span-left]"
						id="popover"
						popover="auto"
					>{ themes.map(t =>
						<li key={t}>
							<a className={t === theme ? 'menu-active' : undefined} onClick={() => updateTheme(t)} tabIndex={0}>{capitalize(t)}</a>
						</li>)}
					</menu>
				</li> */}
			</menu>
		</div>
		<div className={`collapse ${settingsExpanded ? 'collapse-open' : 'collapse-close'}`}>
			<div className="collapse-content px-0">
				{/* <div className="card card-border p-2"> */}
					<div className="card-actions flex-row-reverse grow m-1">
						<button className="btn btn-xs btn-error" type="button" onClick={clearSettings}>
							Clear settings
						</button>
					<div className="flex flex-wrap grow justify-center gap-2 m-1">
						<RadixesSelect who="all" toggleRadixes={toggleRadixes} />
						<RadixesSelect who="odd" toggleRadixes={toggleRadixes} />
						<RadixesSelect who="even" toggleRadixes={toggleRadixes} />
					</div>
					</div>
					<div className="card flex-row flex-wrap xl:flex-nowrap justify-center m-1">{ radixesSystems.map(rs =>
						<RadixSelect who={rs} radixes={radixes} toggleRadixes={toggleRadixes} key={rs}/>)}
					</div>
					<div className="flex flex-col justify-center items-center m-1">
						<div className="card card-border gap-2 p-2">
							<form className="flex flex-col xl:flex-row justify-center items-center h-fit gap-1" onReset={handleInputCharsSubmit} onSubmit={handleInputCharsSubmit} ref={formRef}>
								<select
									className="select select-sm rounded-md bg-base-100 w-fit pl-2 pr-10 mr-1"
									name="radix"
									onChange={e => { updateInputRadix(e.target.value) }}
								>
									<option>All</option> { groupedRadixes.map(rgs =>
									<optgroup label={rgs[0].system} key={rgs[0].system} className="font-bold">{ rgs.map(r =>
										<option value={r.name} key={r.name}>{r.name}</option> )}
									</optgroup>)}
								</select>
								<div className={inputCharsError ? 'tooltip tooltip-error tooltip-open' : undefined} data-tip={inputCharsError}>
									<TextareaAutosize
										className="supports-[field-sizing:content]:field-sizing-content min-w-24 max-w-[calc(100vw-5.5ch)] xl:max-w-[calc(100vw-ch)] block resize-none bg-base-100 rounded-lg font-mono leading-8 p-0 px-2"
										name="chars"
										rows={1}
										cols={70}
										value={inputChars}
										onChange={e => { setInputCharsError(undefined); setInputChars(e.target.value) }}
										onKeyDown={handleInputCharsKeyDown}
									/>
								</div>
								<span className="join flex flex-row justify-center">
									<button className="join-item btn btn-sm btn-outline btn-success" type="reset">Reset</button>
									<button className="join-item btn btn-sm btn-outline btn-error" type="submit">Set</button>
								</span>
							</form>{ inputRadix &&
							<div className="flex flex-row flex-wrap justify-center text-center text-xs">{ inputRadix.values.entries().map(([k, v]) =>
								<span key={k} className="font-mono p-1">
									{k}:{Number(v)}
								</span>) }
							</div>}
						</div>
					</div>
				{/* </div>	 */}
			</div>
		</div>
	</header>
}

const RadixesSelect = ({ who, toggleRadixes }: { who: 'all' | 'odd' | 'even', toggleRadixes: ToggleRadixes }) =>
	<span className="join">
		<button
			className="btn btn-xs btn-outline btn-success join-item"
			type="button"
			onClick={() => { toggleRadixes(who, true) }}
		>
			Add
		</button>
		<button className="btn btn-xs btn-outline btn-neutral join-item pointer-events-none cursor-default" type="button">{ capitalize(who) }</button>
		<button
			className="btn btn-xs btn-outline btn-error join-item"
			type="button"
			onClick={() => { toggleRadixes(who, false) }}
		>
			Remove
		</button>
	</span>

const RadixSelect = ({ who, radixes, toggleRadixes }: { who: Radix['system'], radixes: Radix[], toggleRadixes: ToggleRadixes }) =>
	<div className="flex flex-col items-center min-[690px]:max-w-1/2 xl:max-w-1/4">
		<div className="card card-border p-1 m-1">
			<div className="flex justify-between items-center gap-2">
				<button
					className="btn btn-xs btn-outline btn-success m-1"
					type="button"
					onClick={() => { toggleRadixes(who, true) }}
				>
					Add
				</button>
				<div className="card-title">{ capitalize(who) }</div>
				<button
					className="btn btn-xs btn-outline btn-error m-1"
					type="button"
					onClick={() => { toggleRadixes(who, false) }}
				>
					Remove
				</button>
			</div>
			<div className="card-actions justify-center">{ radixes.filter(r => r.system === who).map(radix =>
				<button
					className={`btn btn-xs btn-outline btn-neutral ${radix.enabled ? 'btn-active' : ''} w-12 m-1`}
					type="button"
					key={radix.name}
					onClick={() => { toggleRadixes(radix, !radix.enabled) }}
				>
					{ String(radix.radix) }
				</button>) }
			</div>
		</div>
	</div>

const createToggleRadixes: (radixes: Radix[], updateRadixes: UpdateRadixes) => ToggleRadixes = (radixes, updateRadixes) => (radix, enabled) => {
	switch (radix) {
		case 'all':
			radixes.forEach(r => { r.enabled = enabled })
			break
		case 'odd':
			radixes.forEach(r => { if ((r.radix & 1n) === 1n) r.enabled = enabled })
			break
		case 'even':
			radixes.forEach(r => { if ((r.radix & 1n) === 0n) r.enabled = enabled })
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


function capitalize(string: string) {
	return string.charAt(0).toUpperCase() + string.slice(1)
}
