import { FormEventHandler, useState, useRef } from 'react'
import themes from 'daisyui/src/theming/themes'

import {
	Radix,
	defaultChars,
	defaultCharsArray,
	getThemeLS,
	setThemeLS,
	getCharsLS,
	setCharsLS,
	str2arr,
	createRadix,
} from '../utils'


type WhoToggle = 'all' | 'odd' | 'even' | Radix["system"] | Radix
type ToggleRadixes = (who: WhoToggle, enabled: boolean) => void

let allChars = getCharsLS() ?? defaultChars

export default function Header({ radixes, updateRadixes }: {
	radixes: Radix[],
	updateRadixes: (radixes: Radix[]) => void,
}) {
	const [ theme, setTheme ] = useState(getThemeLS)
	const [ expanded, setExpanded ] = useState(false)
	const [ inputRadix, setInputRadix ] = useState<'all' | number>('all')
	const [ inputChars, setInputChars ] = useState(allChars)
	const [ inputCharsError, setInputCharsError ] = useState<string>()
	const formRef = useRef<HTMLFormElement>(null)

	console.log('Header: ', allChars)

	const toggleSettings = () => {
		updateInputRadix(inputRadix)
		setInputCharsError(undefined)
		setExpanded(!expanded)
	}

	const updateTheme = (theme: string) => {
		setThemeLS(theme)
		setTheme(theme)
	}

	const updateInputRadix = (inputRadix: string | number) => {
		if (inputRadix === 'all') {
			setInputRadix(inputRadix)
			setInputChars(allChars)
		} else {
			const i = Number(inputRadix)
			setInputRadix(i)
			setInputChars(radixes[i].chars.join(''))
		}
	}

	const toggleRadixes: ToggleRadixes = (who, enabled) => {
		switch (who) {
			case 'all':
				radixes.forEach(r => r.enabled = enabled)
				break;
			case 'odd':
				radixes.forEach(r => { if (r.radix % 2n === 1n) r.enabled = enabled })
				break
			case 'even':
				radixes.forEach(r => { if (r.radix % 2n === 0n) r.enabled = enabled })
				break
			case 'standard':
			case 'bijective':
			case 'balanced':
			case 'my':
				radixes.forEach(r => { if (r.system === who) r.enabled = enabled })
				break
			default:
				who.enabled = enabled
		}

		updateRadixes(radixes)
	}

	const updateRadixesChars = (who: 'all' | Radix, chars?: string) => {
		// console.log('setRadixes start:', { command, enabledRadixes: newRadixes.filter(v => v.enabled).length })

		let newRadixes = radixes
		const charsArray = str2arr(chars)
		if (who === 'all') {
			if (charsArray && charsArray?.length !== defaultCharsArray.length) {
				throw new Error(`Invalid number of chars provided: ${charsArray?.length}, expected: ${defaultCharsArray.length}`)
			}
			setCharsLS(chars !== defaultChars ? chars : undefined)
			newRadixes = radixes.map(r => createRadix(Number(r.radix), r.system, charsArray, r.enabled, r.name))
		} else {
			const i = radixes.findIndex(r => r.name === who.name)
			const oldRadix = radixes[i]
			if (charsArray != undefined && charsArray.length !== oldRadix.chars.length) {
				throw new Error(`Invalid number of chars provided: ${charsArray.length}, expected: ${oldRadix.chars.length}`)
			}
			const newRadix = createRadix(Number(oldRadix.radix), oldRadix.system, charsArray, oldRadix.enabled)
			radixes[i] = newRadix
		}

		updateRadixes(newRadixes)

		return newRadixes
	}

	const handleInputCharsSubmit: FormEventHandler<HTMLFormElement> = (e) => {
		e.preventDefault()

		setInputCharsError(undefined)

		// const data = new FormData(e.currentTarget)
		// const inputRadix = data.get('radix') as string
		// const inputChars = data.get('chars') as string

		try {
			if (inputRadix ==='all') {
				if (e.type === 'submit') {
					updateRadixesChars('all', inputChars)
					allChars = inputChars
				} else {
					if (allChars !== defaultChars) {
						allChars = defaultChars
						updateRadixesChars('all')
					}
					setInputChars(allChars)
				}
			} else {
				const newRadixes = updateRadixesChars(radixes[inputRadix], e.type === 'submit' ? inputChars : undefined)
				if (e.type === 'reset') setInputChars(newRadixes[inputRadix].chars.join(''))
			}
		} catch (error) {
			setInputCharsError((error as Error).message)
		}
	}

	return <header>
		<div className="navbar bg-base-100">
			<div className="flex-1">
				<button className="text-left text-4xl w-fit p-0 pl-4 pr-12" onClick={toggleSettings}>
					<span style={{ color: `hsl(0 80% 40%)`}}>R</span>
					<span style={{ color: `hsl(36 80% 40%)`}}>a</span>
					<span style={{ color: `hsl(72 80% 40%)`}}>d</span>
					<span style={{ color: `hsl(108 80% 40%)`}}>i</span>
					<span style={{ color: `hsl(144 80% 40%)`}}>x</span>
					<span style={{ color: `hsl(180 80% 40%)`}}>v</span>
					<span style={{ color: `hsl(216 80% 40%)`}}>e</span>
					<span style={{ color: `hsl(252 80% 40%)`}}>r</span>
					<span style={{ color: `hsl(288 80% 40%)`}}>s</span>
					<span style={{ color: `hsl(324 80% 40%)`}}>e</span>
				</button>
			</div>
			<div className="z-50">
				<ul className="menu menu-horizontal justify-end">
					<li>
						<button tabIndex={0} className={`menu-dropdown-toggle ${expanded ? 'menu-dropdown-show' : ''}`} onClick={toggleSettings}>Settings</button>
					</li>
					<li>
						<details>
							<summary>Themes</summary>
							<ul className="p-2 bg-base-100">{ Object.keys(themes).sort().map(t =>
								<li key={t}>
									<a className={t === theme ? 'active': ''} onClick={() => updateTheme(t)}>{ capitalize(t) }</a>
								</li>)}
							</ul>
						</details>
					</li>
				</ul>
			</div>
		</div>
		<div className={`collapse collapse-${expanded ? 'open' : 'close'} `} tabIndex={0}>
			<div className="collapse-content">
				<div className="card card-bordered">
					<div className="card-actions justify-center items-center p-2">
						<form className="card card-bordered flex-row justify-items-center items-center gap-1 p-2" onReset={handleInputCharsSubmit} onSubmit={handleInputCharsSubmit} ref={formRef}>
							<select
								className="text-sm rounded-md bg-base-100"
								name="radix"
								defaultValue="all"
								onChange={e => updateInputRadix(e.target.value) }
							>
								<option value="all">All</option>
								{ radixes.map((r, i) => <option key={r.name} value={i}>{r.name}</option>) }
							</select>
							<span className={`${inputCharsError ? 'tooltip tooltip-bottom tooltip-error tooltip-open' : ''} inline`} data-tip={inputCharsError}>
								<textarea
									className="resize-none bg-base-100 leading-4 h-[5em] w-[12rem] md:h-[2em] md:w-[29em] xl:h-[1em] xl:w-[57em] p-0"
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
											}
											e.currentTarget.blur()
										}
									}}
									onChange={e => { setInputCharsError(undefined); setInputChars(e.target.value) }}
								/>
							</span>
							<span className="flex flex-col gap-1 lg:gap-0 lg:flex-row lg:join justify-center">
								<button className="btn btn-xs btn-outline btn-success join-item" type="reset">Reset</button>
								<button className="btn btn-xs btn-outline btn-error join-item" type="submit">Set</button>
							</span>
						</form>
					</div>
					<div className="flex flex-row flex-wrap justify-center items-center gap-2">
						<RadixesSelect who="all" toggleRadixes={toggleRadixes} />
						<RadixesSelect who="odd" toggleRadixes={toggleRadixes} />
						<RadixesSelect who="even" toggleRadixes={toggleRadixes} />
					</div>
					<div className="card md:flex-row p-1">
						<RadixSelect who="standard" radixes={radixes} toggleRadixes={toggleRadixes}/>
						<RadixSelect who="bijective" radixes={radixes} toggleRadixes={toggleRadixes}/>
						<RadixSelect who="balanced" radixes={radixes} toggleRadixes={toggleRadixes}/>
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

const RadixSelect = ({ who, radixes, toggleRadixes }: { who: Radix["system"], radixes: Radix[], toggleRadixes: ToggleRadixes }) =>
	<div className="flex flex-col items-center">
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
			<div className="card-actions flex-row justify-center">{ radixes.filter(r => r.system === who).map(radix =>
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
