import { FormEventHandler, useState } from 'react'
import themes from 'daisyui/src/theming/themes'

import { Radix, baseChars, createRadixes, createRadix, s2a } from '../utils'


const themeNames = Object.keys(themes).sort().map(t => t.split('=')[1].slice(0, -1))
let allChars = baseChars

export default function Header({ radixes, setRadixes }: {
	radixes: Radix[],
	setRadixes: (radixes: Radix[]) => void,
}) {
	const [ expanded, setExpanded ] = useState(false)
	const [ chars, setChars ] = useState(allChars)

	const setBaseChars: FormEventHandler<HTMLFormElement> = (e) => {
		e.preventDefault()

		const data = new FormData(e.currentTarget)
		const radix = data.get('radix')
		const chars = s2a(data.get('chars') as string)

		if (radix === 'all') {
			if (e.type === 'reset') {
				allChars = baseChars
				setChars(allChars)
			} else if (chars.length !== allChars.length) {
				return alert('Invalid number of chars provided')
			} else {
				allChars = chars
			}
			setRadixes(createRadixes(allChars))
		} else {
			const i = radixes.findIndex(r => r.name === radix)
			const r = radixes[i]
			if (e.type === 'reset') {
				const rb = createRadix(Number(r.radix), r.system, allChars, r.enabled)
				setChars(rb.chars)
				radixes[i] = rb
			} else if (chars.length !== r.chars.length) {
				return alert('Invalid number of chars provided')
			} else {
				radixes[i] = createRadix(Number(r.radix), r.system, chars, r.enabled)
			}
			setRadixes(radixes)
		}
	}

	const toggle = (command: { what: 'all' | 'odd' | 'even' | 'standard' | 'bijective' | 'balanced', enabled: boolean } | { what: 'one', radix: Radix }) => {
		// console.log({ action, value })

		switch (command.what) {
			case 'all': radixes.forEach(r => r.enabled = command.enabled); break
			case 'odd': radixes.forEach(r => { if (r.radix % 2n === 1n) r.enabled = command.enabled }); break
			case 'even': radixes.forEach(r => { if (r.radix % 2n === 0n) r.enabled = command.enabled }); break
			case 'standard': radixes.forEach(r => { if (r.system === 'standard') r.enabled = command.enabled }); break
			case 'bijective': radixes.forEach(r => { if (r.system === 'bijective') r.enabled = command.enabled }); break
			case 'balanced': radixes.forEach(r => { if (r.system === 'balanced') r.enabled = command.enabled }); break
			default: command.radix.enabled = !command.radix.enabled
		}
		setRadixes(radixes)
	}

	const button = (radix: Radix) =>
		<button
			className={`btn btn-xs btn-outline ${radix.enabled ? 'btn-active' : ''} w-12 m-1`}
			key={radix.name}
			onClick={() => toggle({ what: 'one', radix })}
		>
			{ String(radix.radix) }
		</button>

	// console.log('Header: ', { chars })

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
						<li><a onClick={() => setExpanded(!expanded)}>Settings</a></li>
						<li>
							<details>
								<summary>Themes</summary>
								<ul className="p-2 bg-base-100">
									{themeNames.map(t => <li key={t}><a onClick={() => document.documentElement.setAttribute('data-theme', t)}>{t[0].toUpperCase() + t.slice(1)}</a></li>)}
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
							<form className="card card-bordered flex-row justify-items-center items-center gap-1 p-2" onReset={setBaseChars} onSubmit={setBaseChars}>
								<select className="text-xs rounded-md bg-base-100" name="radix" defaultValue="all" onChange={e => setChars(e.target.value === 'all' ? allChars : radixes.find(r => r.name === e.target.value)?.chars ?? ['']) }>
									<option value="all">All</option>
									{ radixes.map(radix => <option key={radix.name}>{radix.name}</option>) }
								</select>
								<textarea className="resize-none bg-base-100 leading-4 h-[5em] w-[12rem] md:h-[2em] md:w-[29em] xl:h-[1em] xl:w-[57em] p-0" name="chars" value={chars.join('')} onChange={e => setChars(s2a(e.target.value))}/>
								<span className="flex flex-col gap-1 lg:gap-0 lg:flex-row lg:join justify-center">
									<button className="btn btn-xs btn-outline btn-success join-item" type="reset" >Reset</button>
									<button className="btn btn-xs btn-outline btn-error join-item" type="submit" >Set</button>
								</span>
							</form>
						</div>
						<div className="flex flex-row flex-wrap justify-center items-center gap-2">
							<span className="join">
								<button className="btn btn-xs btn-outline btn-success join-item" onClick={() => toggle({ what: 'all', enabled: true })}>Add</button>
								<span className="btn btn-xs btn-outline join-item cursor-default">All</span>
								<button className="btn btn-xs btn-outline btn-error join-item" onClick={() => toggle({ what: 'all', enabled: false })}>Remove</button>
							</span>
							<span className="join">
								<button className="btn btn-xs btn-outline btn-success join-item" onClick={() => toggle({ what: 'odd', enabled: true })}>Add</button>
								<span className="btn btn-xs btn-outline join-item cursor-default">Odd</span>
								<button className="btn btn-xs btn-outline btn-error join-item" onClick={() => toggle({ what: 'odd', enabled: false })}>Remove</button>
							</span>
							<span className="join">
								<button className="btn btn-xs btn-outline btn-success join-item" onClick={() => toggle({ what: 'even', enabled: true })}>Add</button>
								<span className="btn btn-xs btn-outline join-item cursor-default">Even</span>
								<button className="btn btn-xs btn-outline btn-error join-item" onClick={() => toggle({ what: 'even', enabled: false })}>Remove</button>
							</span>
							<span className="join">
								<button className="btn btn-xs btn-outline btn-success join-item" onClick={() => toggle({ what: 'standard', enabled: true })}>Add</button>
								<span className="btn btn-xs btn-outline join-item cursor-default">Standard</span>
								<button className="btn btn-xs btn-outline btn-error join-item" onClick={() => toggle({ what: 'standard', enabled: false })}>Remove</button>
							</span>
							<span className="join">
								<button className="btn btn-xs btn-outline btn-success join-item" onClick={() => toggle({ what: 'bijective', enabled: true })}>Add</button>
								<span className="btn btn-xs btn-outline join-item cursor-default">Bijective</span>
								<button className="btn btn-xs btn-outline btn-error join-item" onClick={() => toggle({ what: 'bijective', enabled: false })}>Remove</button>
							</span>
							<span className="join">
								<button className="btn btn-xs btn-outline btn-success join-item" onClick={() => toggle({ what: 'balanced', enabled: true })}>Add</button>
								<span className="btn btn-xs btn-outline join-item cursor-default">Balanced</span>
								<button className="btn btn-xs btn-outline btn-error join-item" onClick={() => toggle({ what: 'balanced', enabled: false })}>Remove</button>
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
