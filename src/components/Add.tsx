import { memo } from 'react'

import { Tables, Table } from './Table'
import { Radix, areRadixesEqual } from '../utils'


function Add({ tab, radixes }: { tab: string, radixes: Radix[] }) {
	console.log('Add: ', { radixes })

	return <Tables>
		{ radixes.map(radix => {
			const { high } = radix
			let { low } = radix
			if (high + low > 2) low = 2
			const lowest = low >= 0 ? low : low + low
			const highest = high + high
			const arr = [ NaN, ...Array.from({ length: high - (low - 1) }, (_, i) => i + low) ]
			const rows = arr.length
			const numbers = arr.flatMap(row => arr.map(col => {
				if (isNaN(row) && isNaN(col)) return NaN
				return isNaN(row) || isNaN(col) ? isNaN(row) ? col : row : row + col
			}))
			return <Table key={`add-${radix.name}`} tab="add" numbers={numbers} rows={rows} cols={rows} radix={radix} low={lowest} high={highest}/>
		})}
	</Tables>
}

export default memo(Add, areRadixesEqual)
