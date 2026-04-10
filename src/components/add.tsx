import { useState, useEffect } from "react"

import Table, { Tables } from './table.tsx'
import type { Radix } from '#/utils.ts'

const { isNaN } = Number

export default function Add({ radixes }: { radixes: Radix[] }) {
	return <Tables>{ radixes.map(radix => <AddTable radix={radix} key={radix.name}/>) }</Tables>
}

function AddTable({ radix }: { radix: Radix }) {
	const [ props, setProps ] = useState(computeProps(radix))

	useEffect(() => { setProps(computeProps(radix)) }, [ radix ])

	return <Table radix={radix} {...props}/>
}

function computeProps(radix: Radix) {
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

	return { numbers, low: lowest, high: highest }
}
