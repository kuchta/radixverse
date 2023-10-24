import { FormEventHandler, useState } from 'react'
import themes from 'daisyui/src/theming/themes'

import { SetRadixes } from './App'
import { Radix, defaultChars, getCharsLS, getThemeLS, setThemeLS } from '../utils'


let allChars = getCharsLS() ?? defaultChars
const themeNames = Object.keys(themes).sort().map(t => t.split('=')[1].slice(0, -1))

export default function Header({ radixes, setRadixes }: {
	radixes: Radix[],
	setRadixes: SetRadixes,
}) {
	const [ theme, _setTheme ] = useState(getThemeLS)
	const [ expanded, setExpanded ] = useState(false)
	const [ inputChars, setInputChars ] = useState(allChars)

	// console.log('Header: ', { theme })

	const setTheme = (theme: string) => {
		_setTheme(theme)
		setThemeLS(theme)
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
					setRadixes({ what: 'set-chars', who: 'all', chars })
				} else {
					if (allChars !== defaultChars) {
						allChars = defaultChars
						setRadixes({ what: 'set-chars', who: 'all' })
					}
					setInputChars(allChars)
				}
			} else {
				const r = radixes.find(r => r.name === radix)!
				setRadixes({ what: 'set-chars', who: r, chars: e.type === 'submit' ? chars : undefined })
				if (e.type === 'reset') {
					setInputChars(r?.chars.join(''))
				}
			}
		} catch (error) {
			alert(error)
		}
	}

	const button = (radix: Radix) =>
		<button
			className={`btn btn-xs btn-outline ${radix.enabled ? 'btn-active' : ''} w-12 m-1`}
			key={radix.name}
			onClick={() => setRadixes({ what: 'toggle', who: radix })}
		>
			{ String(radix.radix) }
		</button>

	return (
		<header>
			<nav className="navbar bg-base-100">
				<div className="flex-1">
					<button className="text-left text-4xl w-fit p-0 pl-4 pr-12" onClick={() => setExpanded(!expanded)}>
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
				<div className="flex flex-row justify-between z-50">
					<ul className="menu menu-horizontal px-1">
						<li><a className={`menu-dropdown-toggle ${expanded ? 'menu-dropdown-show' : ''}`} onClick={() => setExpanded(!expanded)}>Settings</a></li>
						<li>
							<details>
								<summary>Themes</summary>
								<ul className="p-2 bg-base-100">
									{themeNames.map(t => <li key={t}><a className={t === theme ? 'active': ''} onClick={() => setTheme(t)}>{t[0].toUpperCase() + t.slice(1)}</a></li>)}
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
								<select className="text-sm rounded-md bg-base-100" name="radix" defaultValue="all"
									onChange={e => setInputChars(e.target.value === 'all' ? allChars : radixes.find(r => r.name === e.target.value)!.chars.join('')) }
								>
									<option value="all">All</option>
									{ radixes.map(radix => <option key={radix.name}>{radix.name}</option>) }
								</select>
								<textarea className="resize-none bg-base-100 leading-4 h-[5em] w-[12rem] md:h-[2em] md:w-[29em] xl:h-[1em] xl:w-[57em] p-0"
									name="chars"
									value={inputChars}
									onChange={e => setInputChars(e.target.value)}
								/>
								<span className="flex flex-col gap-1 lg:gap-0 lg:flex-row lg:join justify-center">
									<button className="btn btn-xs btn-outline btn-success join-item" type="reset" >Reset</button>
									<button className="btn btn-xs btn-outline btn-error join-item" type="submit" >Set</button>
								</span>
							</form>
						</div>
						<div className="flex flex-row flex-wrap justify-center items-center gap-2">
							<span className="join">
								<button className="btn btn-xs btn-outline btn-success join-item" onClick={() => setRadixes({ what: 'toggle', who: 'all', enabled: true })}>Add</button>
								<span className="btn btn-xs btn-outline pointer-events-none join-item cursor-default">All</span>
								<button className="btn btn-xs btn-outline btn-error join-item" onClick={() => setRadixes({ what: 'toggle', who: 'all', enabled: false })}>Remove</button>
							</span>
							<span className="join">
								<button className="btn btn-xs btn-outline btn-success join-item" onClick={() => setRadixes({ what: 'toggle', who: 'odd', enabled: true })}>Add</button>
								<span className="btn btn-xs btn-outline pointer-events-none join-item cursor-default">Odd</span>
								<button className="btn btn-xs btn-outline btn-error join-item" onClick={() => setRadixes({ what: 'toggle', who: 'odd', enabled: false })}>Remove</button>
							</span>
							<span className="join">
								<button className="btn btn-xs btn-outline btn-success join-item" onClick={() => setRadixes({ what: 'toggle', who: 'even', enabled: true })}>Add</button>
								<span className="btn btn-xs btn-outline pointer-events-none join-item cursor-default">Even</span>
								<button className="btn btn-xs btn-outline btn-error join-item" onClick={() => setRadixes({ what: 'toggle', who: 'even', enabled: false })}>Remove</button>
							</span>
							<span className="join">
								<button className="btn btn-xs btn-outline btn-success join-item" onClick={() => setRadixes({ what: 'toggle', who: 'standard', enabled: true })}>Add</button>
								<span className="btn btn-xs btn-outline pointer-events-none join-item cursor-default">Standard</span>
								<button className="btn btn-xs btn-outline btn-error join-item" onClick={() => setRadixes({ what: 'toggle', who: 'standard', enabled: false })}>Remove</button>
							</span>
							<span className="join">
								<button className="btn btn-xs btn-outline btn-success join-item" onClick={() => setRadixes({ what: 'toggle', who: 'bijective', enabled: true })}>Add</button>
								<span className="btn btn-xs btn-outline pointer-events-none join-item cursor-default">Bijective</span>
								<button className="btn btn-xs btn-outline btn-error join-item" onClick={() => setRadixes({ what: 'toggle', who: 'bijective', enabled: false })}>Remove</button>
							</span>
							<span className="join">
								<button className="btn btn-xs btn-outline btn-success join-item" onClick={() => setRadixes({ what: 'toggle', who: 'balanced', enabled: true })}>Add</button>
								<span className="btn btn-xs btn-outline pointer-events-none join-item cursor-default">Balanced</span>
								<button className="btn btn-xs btn-outline btn-error join-item" onClick={() => setRadixes({ what: 'toggle', who: 'balanced', enabled: false })}>Remove</button>
							</span>
						</div>
						<div className="card md:flex-row p-1">
							<div className="card card-bordered items-center p-1 m-1">
								<div className="card-title">Standard</div>
								<div className="card-actions flex-row justify-center">
									{ radixes.filter(r => r.system === "standard").map(radix => button(radix)) }
								</div>
							</div>
							<div className="card card-bordered items-center p-1 m-1">
								<div className="card-title">Bijective</div>
								<div className="card-actions flex-row justify-center">
									{ radixes.filter(r => r.system === "bijective").map(radix => button(radix)) }
								</div>
							</div>
							<div className="card card-bordered items-center p-1 m-1">
								<div className="card-title">Balanced</div>
								<div className="card-actions flex-row justify-center">
									{ radixes.filter(r => r.system === "balanced").map(radix => button(radix)) }
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</header>
	)
}
