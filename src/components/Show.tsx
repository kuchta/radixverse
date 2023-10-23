import { memo } from 'react'

import Table, { Tables } from './Table'
import { Radix, areRadixesEqual } from '../utils'


function Show({ radixes }: { radixes: Radix[] }) {
	// console.log('Show: ', { radixes })

	return <Tables>
		{ radixes.map(radix => {
			const { system, low, high } = radix
			const bijective = system === 'bijective'
			const balanced = system === 'balanced'
			const rows = high - (bijective ? 0 : low) + 1
			const cols = high - low + 1
			const highest = balanced ? (high - low) * (high + 1) : bijective ? high * (high + 1) : high === 1 ? 3 : (high + 1) * (high + 1) - 1
			const lowest = balanced ? -highest : low
			const mainRow = balanced ? Math.trunc(rows / 2) : 0
			const numbers = [ ...Array(cols * rows) ].map((_, i) => i + lowest)
			return <Table key={`show-${radix.name}`} tab="show" radix={radix} numbers={numbers} rows={rows} cols={cols} low={lowest} high={highest} mainRow={mainRow}/>
		})}
	</Tables>
}

export default memo(Show, areRadixesEqual)
