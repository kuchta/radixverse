import { memo } from 'react'

import Table, { Tables } from './Table'
import { Radix, areRadixesEqual } from '../utils'


function Add({ radixes }: { radixes: Radix[] }) {
	// console.log('Add: ', { radixes })

	return <Tables>
		{ radixes.map(radix => {
			let { low, high } = radix
			if (high + low > 0) low = 1
			if (low >= 0 && high < 3) high = 2
			const lowest = low >= 0 ? low : low + low
			const highest = high + high
			const arr = [ NaN, ...Array.from(Array(high - (low - 1)), (_, i) => i + low) ]
			const numbers = arr.map(row => arr.map(col => {
				if (isNaN(row) && isNaN(col)) return NaN
				return isNaN(row) || isNaN(col) ? isNaN(row) ? col : row : row + col
			}))
			return <Table key={`add-${radix.name}`} tab="add" radix={radix} numbers={numbers} low={lowest} high={highest}/>
		})}
	</Tables>
}

export default memo(Add, areRadixesEqual)
