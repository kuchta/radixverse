import { FormEventHandler, useState } from 'react'
import themes from 'daisyui/src/theming/themes'

import {
	Radix,
	createRadix,
	defaultChars,
	defaultCharsArray,
	getCharsLS,
	getThemeLS,
	setCharsLS,
	setThemeLS,
	str2arr,
	updateRadixes,
} from '../utils'

type WhoToggle = 'all' | 'odd' | 'even' | Radix["system"]
type WhoSetChars = 'all' | Radix["system"]

type ChangeRadixes = (command: {
	who: WhoToggle, what: 'toggle', enabled: boolean } | {
	who: Radix, what: 'toggle' } | {
	who: WhoSetChars, what: 'set-chars', chars?: string } | {
	who: Radix, what: 'set-chars', chars?: string }) => Radix[]

let allChars = getCharsLS() ?? defaultChars

export default function Header({ radixes, setRadixes }: {
	radixes: Radix[],
	setRadixes: (radixes: Radix[]) => void,
}) {
	const [ theme, _setTheme ] = useState(getThemeLS)
	const [ expanded, setExpanded ] = useState(false)
	const [ inputChars, setInputChars ] = useState(allChars)

	// console.log('Header: ', radixes.filter(v => v.enabled))

	const toggleSettings = () => setExpanded(!expanded)

	const setTheme = (theme: string) => {
		setThemeLS(theme)
		_setTheme(theme)
	}

	const changeRadixes: ChangeRadixes = (command) => {
		let newRadixes = radixes

		// console.log('setRadixes start:', { command, enabledRadixes: newRadixes.filter(v => v.enabled).length })

		switch (command.who) {
			case 'all':
				if (command.what === 'toggle') {
					radixes.forEach(r => r.enabled = command.enabled)
				} else if (command.what === 'set-chars') {
					const chars = str2arr(command.chars)
					if (chars && chars.length !== defaultCharsArray.length) {
						throw new Error(`Invalid number of chars provided: ${chars.length}, expected: ${defaultCharsArray.length}`)
					}
					setCharsLS(command.chars && command.chars !== defaultChars ? command.chars : undefined)
					newRadixes = updateRadixes(radixes, chars)
				}
				break
			case 'odd':
				radixes.forEach(r => { if (r.radix % 2n === 1n) r.enabled = command.enabled })
				break
			case 'even':
				radixes.forEach(r => { if (r.radix % 2n === 0n) r.enabled = command.enabled })
				break
			case 'standard':
			case 'bijective':
			case 'balanced':
			case 'my':
				if (command.what === 'toggle') {
					radixes.forEach(r => { if (r.system === command.who) r.enabled = command.enabled })
				}
				break
			default:
				if (command.what === 'toggle') {
					command.who.enabled = !command.who.enabled
				} else if (command.what === 'set-chars') {
					const i = radixes.findIndex(r => r.name === command.who.name)
					const oldRadix = radixes[i]
					const chars = str2arr(command.chars)
					if (chars != undefined) {
						if (chars.length !== oldRadix.chars.length) {
							throw new Error(`Invalid number of chars provided: ${chars.length}, expected: ${oldRadix.chars.length}`)
						}
					}
					const newRadix = createRadix(Number(oldRadix.radix), oldRadix.system, chars, oldRadix.enabled)
					radixes[i] = newRadix
				}
		}

		setRadixes(newRadixes)

		return newRadixes
	}

	const setRadixChars: FormEventHandler<HTMLFormElement> = (e) => {
		e.preventDefault()

		const data = new FormData(e.currentTarget)
		const radix = data.get('radix') as string
		const chars = data.get('chars') as string

		try {
			if (radix ==='all') {
				if (e.type === 'submit') {
					allChars = chars
					changeRadixes({ what: 'set-chars', who: 'all', chars })
				} else {
					if (allChars !== defaultChars) {
						allChars = defaultChars
						changeRadixes({ what: 'set-chars', who: 'all' })
					}
					setInputChars(allChars)
				}
			} else {
				const r = radixes.find(r => r.name === radix)!
				const newRadixes = changeRadixes({ what: 'set-chars', who: r, chars: e.type === 'submit' ? chars : undefined })
				if (e.type === 'reset') {
					setInputChars(newRadixes.find(r => r.name === radix)!.chars.join(''))
				}
			}
		} catch (error) {
			alert(error)
		}
	}

	return <header>
		<nav className="navbar bg-base-100">
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
									<a className={t === theme ? 'active': ''} onClick={() => setTheme(t)}>{ capitalize(t) }</a>
								</li>)}
							</ul>
						</details>
					</li>
				</ul>
			</div>
		</nav>
		<div className={`collapse collapse-${expanded ? 'open' : 'close'} `} tabIndex={0}>
			<div className="collapse-content">
				<div className="card card-bordered">
					<div className="card-actions justify-center items-center p-2">
						<form className="card card-bordered flex-row justify-items-center items-center gap-1 p-2" onReset={setRadixChars} onSubmit={setRadixChars}>
							<select
								className="text-sm rounded-md bg-base-100"
								name="radix"
								defaultValue="all"
								onChange={e => setInputChars(e.target.value === 'all' ? allChars : radixes.find(r => r.name === e.target.value)!.chars.join('')) }
							>
								<option value="all">All</option>
								{ radixes.map(radix => <option key={radix.name}>{radix.name}</option>) }
							</select>
							<textarea
								className="resize-none bg-base-100 leading-4 h-[5em] w-[12rem] md:h-[2em] md:w-[29em] xl:h-[1em] xl:w-[57em] p-0"
								name="chars"
								value={inputChars}
								onKeyDown={e => e.stopPropagation() }
								onChange={e => setInputChars(e.target.value)}
							/>
							<span className="flex flex-col gap-1 lg:gap-0 lg:flex-row lg:join justify-center">
								<button className="btn btn-xs btn-outline btn-success join-item" type="reset">Reset</button>
								<button className="btn btn-xs btn-outline btn-error join-item" type="submit">Set</button>
							</span>
						</form>
					</div>
					<div className="flex flex-row flex-wrap justify-center items-center gap-2">
						<RadixesSelect who="all" changeRadixes={changeRadixes} />
						<RadixesSelect who="odd" changeRadixes={changeRadixes} />
						<RadixesSelect who="even" changeRadixes={changeRadixes} />
					</div>
					<div className="card md:flex-row p-1">
						<RadixSelect who="standard" radixes={radixes} changeRadixes={changeRadixes}/>
						<RadixSelect who="bijective" radixes={radixes} changeRadixes={changeRadixes}/>
						<RadixSelect who="balanced" radixes={radixes} changeRadixes={changeRadixes}/>
					</div>
				</div>
			</div>
		</div>
	</header>
}

function RadixesSelect({ who, changeRadixes }: { who: WhoToggle, changeRadixes: ChangeRadixes }) {
	return <span className="join">
		<button
			className="btn btn-xs btn-outline btn-success join-item"
			onClick={() => changeRadixes({ what: 'toggle', who, enabled: true })}
		>
			Add
		</button>
		<span className="btn btn-xs btn-outline pointer-events-none join-item cursor-default">{ capitalize(who) }</span>
		<button
			className="btn btn-xs btn-outline btn-error join-item"
			onClick={() => changeRadixes({ what: 'toggle', who, enabled: false })}
		>
			Remove
		</button>
	</span>
}

function RadixSelect({ who, radixes, changeRadixes }: { who: Radix["system"], radixes: Radix[], changeRadixes: ChangeRadixes }) {
	return <div className="flex flex-col items-center">
		<div className="card card-bordered p-1 m-1">
			<div className="flex justify-between items-center gap-2">
				<button
					className="btn btn-xs btn-outline btn-success m-1"
					onClick={() => changeRadixes({ what: 'toggle', who, enabled: true })}
				>
					Add
				</button>
				<div className="card-title">{ capitalize(who) }</div>
				<button
					className="btn btn-xs btn-outline btn-error m-1"
					onClick={() => changeRadixes({ what: 'toggle', who, enabled: false })}
				>
					Remove
				</button>
			</div>
			<div className="card-actions flex-row justify-center">{ radixes.filter(r => r.system === who).map(radix =>
				<button
					className={`btn btn-xs btn-outline ${radix.enabled ? 'btn-active' : ''} w-12 m-1`}
					key={radix.name}
					onClick={() => changeRadixes({ what: 'toggle', who: radix })}
				>
					{ String(radix.radix) }
				</button>) }
			</div>
		</div>
	</div>
}

function capitalize(string: string) {
	return string.charAt(0).toUpperCase() + string.slice(1)
}
