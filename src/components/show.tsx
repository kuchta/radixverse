import { useState, useMemo } from 'react'

import type { Radix } from '#/radixes.ts'
import Table, { Tables } from './table.tsx'


export default function Show({ radixes }: { radixes: Radix[] }) {
	return (
		<Tables>{ radixes.map(radix =>
			<ShowTable radix={radix} key={radix.name}/>) }
		</Tables>
	)
}

function ShowTable({ radix }: { radix: Radix }) {
	const [ columns, setColumns ] = useState<number>()
	const [ rows, setRows ] = useState<number>()
	const props = useMemo(() => {
		const { system, low, high } = radix
		const bij = system === 'bijective'
		const clock = system === 'clock'
		const bal = system === 'balanced' || system === 'balsum'
		const cs = columns ?? high - low + 1
		const rs = rows ?? cs + (bij ? 1 : 0)

		const highest = clock ? high * (cs + 1)
							  : bal ? Math.trunc((rs * cs) / 2)
									: cs * rs - (low === 0 ? 1 : 0)
		const lowest = clock ? low * (cs + 1)
							 : bal ? -highest
								   : low
		const mainRow = clock ? rs / 2 - 1
							  : bal ? Math.trunc(rs / 2)
									: 0

		const numbers = Array.from(Array(rs), (_, i) => Array.from(Array(cs), (_, j) => i * cs + j + lowest))

		return { numbers, low: lowest, high: highest, mainRow, columns: cs, rows: rs }
	}, [ radix, columns, rows ])

	return <Table radix={radix} {...props} updateColumns={setColumns} updateRows={setRows}/>
}
