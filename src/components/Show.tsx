import { memo, useState, useEffect } from 'react'

import Table, { Tables } from './Table'
import { type Radix, areRadixesEqual } from '../utils'


function Show({ radixes }: { radixes: Radix[] }) {
	return <Tables>{ radixes.map(radix => <ShowTable radix={radix} key={`show-${radix.name}`}/>) }</Tables>
}

function ShowTable({ radix }: { radix: Radix }) {
	const [ props, setProps ] = useState(computeProps(radix))
	const [ columns, setColumns ] = useState<number>()
	const [ rows, setRows ] = useState<number>()

	useEffect(() => setProps(computeProps(radix, columns, rows)), [ radix, columns, rows ])

	return <Table radix={radix} {...props} updateColumns={setColumns} updateRows={setRows}/>
}

function computeProps(radix: Radix, columns?: number, rows?: number) {
	const { system, low, high } = radix
	const bij = system === 'bijective'
	const clock = system === 'clock'
	const bal = system === 'balanced' || system === 'balsum'

	columns ??= high - low + 1
	rows ??= columns + (bij ? 1 : 0)

	const highest = clock ? high * (columns + 1)
				  : bal ? Math.trunc((rows * columns) / 2)
				  : columns * rows - (low === 0 ? 1 : 0)
	const lowest = clock ? low * (columns + 1)
				 : bal ? -highest
				 : low
	const mainRow = clock ? rows / 2 - 1
				  : bal ? Math.trunc(rows / 2)
				  : 0

	const numbers = Array.from(Array(rows), (_, i) => Array.from(Array(columns), (_, j) => i * columns + j + lowest))

	return { numbers, low: lowest, high: highest, mainRow, rows, columns }
}

export default memo(Show, areRadixesEqual)
