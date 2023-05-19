import { memo } from 'react'

import { Radix, num2str } from '../utils'


export function Tables({ children }: { children: JSX.Element[] }) {
	return <div className="flex flex-wrap items-center justify-center">
		{ children }
	</div>
}

export const Table = memo(({ tab, radix, numbers, rows, cols, low, high, mainRow }: {
	tab: string,
	radix: Radix,
	numbers: number[],
	rows: number,
	cols: number,
	low: number,
	high: number
	mainRow?: number,
}) => {
	console.log(`Table(${tab}-${radix.name}): `, { numbers })
	return <div className="card overflow-hidden bg-white shadow-xl m-4">
		<div className="card-title self-center badge badge-lg badge-outline m-2">{radix.name}</div>
		<div className="card-body overflow-y-auto p-2">
			<table className="table text-sm">
				<tbody>{ [ ...Array(rows) ].map((_, row) =>
					<tr key={`row-${row}`} className={`row${row === mainRow ? ' active' : ''}`}>{ numbers.slice(row * cols, row * cols + cols).map((number, index) =>
						<td key={`col-${index}`} className="text-right px-[2px] py-[2px]">
							{ renderValue({ val: number, low, high, radix }) }
						</td>)}
					</tr>)}
				</tbody>
			</table>
		</div>
	</div>
}, ({ numbers: oldNumbers }, { numbers: newNumbers, tab, radix }) => {
	const ret = oldNumbers.length === newNumbers.length && oldNumbers.every((n, i) => isNaN(n) ? isNaN(newNumbers[i]) : n === newNumbers[i])
	// console.log(`memo(Table(${tab}-${radix.name})): `, { ret, oldNumbers, newNumbers })
	return ret
})

function renderValue({ val, low, high, radix }: { val: number, low: number, high: number, radix: Radix }) {
	if (isNaN(val)) return <span></span>
	const point = low === 0 ? val : val - low
	const space = low === 0 ? high : high - low
	const hue = Math.round(point / space * 300)
	// console.log('renderValue', { val, point, space, hue })
	return <div className="relative" /*tooltip" data-tip={`${point} / ${space} (${low}-${high}) * 300 = ${hue}`}*/>
		<div
			className="text-xl font-extrabold text-right"
			style={{ color: `hsl(${hue} 80% 40%)`}}
			>
			{ num2str(BigInt(val), radix) }
		</div>
		<span className="text-[0.6em] leading-[2px] text-center absolute right-0 top-0.5">{val}</span>
	</div>
}
