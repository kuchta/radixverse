import { memo } from 'react'

import Table, { Tables } from './Table'
import { Radix, areRadixesEqual } from '../utils'


function Multiply({ radixes }: { radixes: Radix[] }) {
	// console.log('Multiply: ', { radixes })

	return <Tables>
		{ radixes.map(radix => {
			let { low, high } = radix
			if (low >= 0) low = 2
			if (low >= 0 && high < 3) high = 3
			const lowest = low >= 0 ? low : low * high
			const highest = high * high
			const arr = [ NaN, ...Array.from(Array(high - (low - 1)), (_, i) => i + low) ]
			const numbers = arr.map(row => arr.map(col => {
				if (isNaN(row) && isNaN(col)) return NaN
				return isNaN(row) || isNaN(col) ? isNaN(row) ? col : row : row * col
			}))
			return <Table key={`multiply-${radix.name}`} tab="multiply" radix={radix} numbers={numbers} low={lowest} high={highest}/>
		})}
	</Tables>
}

export default memo(Multiply, areRadixesEqual)
