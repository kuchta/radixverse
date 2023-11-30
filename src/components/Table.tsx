import { memo } from 'react'

import { Radix, num2str } from '../utils'


export function Tables({ children }: { children: JSX.Element[] }) {
	return <main className="flex flex-wrap items-center justify-center">
		{ children }
	</main>
}

function Table({ radix, numbers, low, high, mainRow }: {
	radix: Radix,
	numbers: number[][],
	low: number,
	high: number
	mainRow?: number,
}) {
	// console.log(`Table(${radix.name}): `, { numbers })

	const space = low === 0 ? high : high - low

	return <div className="card overflow-hidden bg-white shadow-xl m-4">
		<div className="card-title self-center badge badge-lg badge-outline m-2">{radix.name}</div>
		<div className="card-body overflow-y-auto p-2">
			<table className="table table-xs text-sm w-auto">
				<tbody>{ numbers.map((row, rowIndex) =>
					<tr className={`hover row${rowIndex === mainRow ? ' active' : ''}`} key={`row-${rowIndex}`}>{ row.map((number, colIndex) =>
						<td className="text-right px-[2px] py-[2px] w-8" key={`col-${colIndex}`}>
							{ renderValue(number, low, space, radix) }
						</td>)}
					</tr>)}
				</tbody>
			</table>
		</div>
	</div>
}

export default memo(Table, ({radix: oldRadix, numbers: oldNumbers }, { radix: newRadix, numbers: newNumbers }) => {
	const ret = oldRadix.name === newRadix.name
		&& oldRadix.chars.every((char, i) => char === newRadix.chars[i])
		&& oldNumbers.length === newNumbers.length
		&& oldNumbers.every((row, i) =>
			row.every((n, j) =>
				isNaN(n) ? isNaN(newNumbers[i][j]) : n === newNumbers[i][j]))
	// console.log(`areNumbersEqual(${newRedix.name}): `, ret)
	return ret
})

function renderValue(val: number, low: number, space: number, radix: Radix) {
	if (isNaN(val)) return <span></span>
	return <div className="relative" /*tooltip" data-tip={`${point} / ${space} (${low}-${high}) * 300 = ${hue}`}*/>
		<div
			className="text-xl font-extrabold text-right"
			style={{ color: `hsl(${(low === 0 ? val : val - low) / space * 300} 80% 40%)`}}
			>
			{ num2str(BigInt(val), radix) }
		</div>
		<span className="text-[0.6em] leading-[2px] text-center absolute right-0 top-0.5">{val}</span>
	</div>
}
