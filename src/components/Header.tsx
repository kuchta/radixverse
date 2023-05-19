import { useState } from 'react'
import themes from 'daisyui/src/colors/themes'

import { Radix } from '../utils'


const themeNames = Object.keys(themes).sort().map(t => t.split('=')[1].slice(0, -1))

export default function Header({ radixes, toggleRadix }: {
	radixes: Radix[],
	toggleRadix: (radix: Radix) => void,
}) {
	const [ expanded, setExpanded ] = useState(false)

	// console.log('Header: ', { radixes, expanded })

	return <div tabIndex={0} className={`collapse collapse-arrow collapse-${expanded ? 'open' : 'close'} `}>
		<div className="flex flex-row justify-between">
			<button className="collapse-title text-left text-4xl w-fit p-0 pl-4 pr-12" onClick={() => setExpanded(!expanded)}>
				Radixverse
			</button>
			<select className="select text-right border-none focus:outline-none p-0 pr-8" defaultValue='theme' onChange={e => document.documentElement.setAttribute('data-theme', e.currentTarget.value)}>
				<option key="theme" value="theme" disabled>Theme</option>
				{themeNames.map(t => <option key={t} value={t}>{t[0].toUpperCase() + t.slice(1)}</option>)}
			</select>
		</div>
		<div className="collapse-content">
			<div className="card card-bordered flex flex-row flex-wrap justify-between items-center p-2">
				{ radixes.map(radix =>
					<button
						key={radix.name}
						onClick={() => toggleRadix(radix)}
						className="text-[3.5vmin] m-[1vmin]"
					>
						<div className={`badge badge-lg ${radix.enabled ? '' : 'badge-outline'} `}>
							{radix.name}
						</div>
					</button>
				)}
			</div>
		</div>
	</div>
}
