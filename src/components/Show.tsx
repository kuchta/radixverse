import { memo } from 'react'

import Table, { Tables } from './Table'
import { Radix, areRadixesEqual } from '../utils'


function Show({ radixes }: { radixes: Radix[] }) {
	// console.log('Show: ', { radixes })

	return <Tables>
		{ radixes.map(radix => {
			const { system, low, high } = radix
			const bij = system === 'bijective'
			const bal = system === 'balanced'
			const my = system === 'my'
			const rows = high - (bij ? 0 : low) + 1
			const cols = high - low + 1
			const highest = my ? high * (cols + 1)
						  : bal ? (high - low) * (high + 1)
						  : bij ? high * (high + 1)
						  : high === 1 ? 3
						  : (high + 1) * (high + 1) - 1
			const lowest = my ? low * (cols + 1)
						 : bal ? -highest
						 : low
			const mainRow = my ? rows / 2 - 1 : bal ? Math.trunc(rows / 2) : 0
			const numbers = Array.from(Array(rows), (_, i) => Array.from(Array(cols), (_, j) => (i * cols) + j + lowest))
			return <Table key={`show-${radix.name}`} tab="show" radix={radix} numbers={numbers} low={lowest} high={highest} mainRow={mainRow}/>
		})}
	</Tables>
}

export default memo(Show, areRadixesEqual)
