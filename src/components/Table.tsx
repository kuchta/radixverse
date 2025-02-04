import { useState } from 'react'
import { LiaEditSolid } from 'react-icons/lia'

import { type Radix, num2str, getCharsForTooltip } from '../utils'


export function Tables({ children }: { children: React.ReactNode[] }) {
	return <main className="flex flex-wrap justify-center items-start gap-4 overflow-x-clip">
		{ children }
	</main>
}

export default function Table({ radix, numbers, low, high, mainRow, columns, rows, updateColumns, updateRows }: {
	radix: Radix,
	numbers: number[][],
	low: number,
	high: number
	mainRow?: number,
	columns?: number,
	rows?: number,
	updateColumns?: (columns: number) => void
	updateRows?: (rows: number) => void
}) {
	const [ edit, setEdit ] = useState(false)

	const space = low === 0 ? high : high - low

	return <div className="card bg-white max-w-full shadow-xl">
		<div className="flex justify-end items-center mx-2">
			<div className="flex-1 flex justify-center">
				<span className="tooltip tooltip-top whitespace-pre before:content-[attr(data-tip)] before:max-w-[50rem]" data-tip={ getCharsForTooltip(radix) }>
					<span className="card-title badge badge-lg badge-outline m-2">{radix.name}</span>
				</span>
			</div>{ edit &&
			<div className="flex justify-end">
				<EditRowsOrColumns rows={rows} update={updateRows} setEdit={setEdit}/>/
				<EditRowsOrColumns columns={columns} update={updateColumns} setEdit={setEdit}/>
			</div>}{ (updateColumns || updateRows) &&
			<LiaEditSolid onClick={() => setEdit(!edit)}/>}
		</div>
		<div className="card-body overflow-scroll p-2">
			<table className="table table-xs table-fixed text-sm w-auto">
				<tbody>{ numbers.map((row, rowIndex) =>
					<tr className={`hover row${rowIndex === mainRow ? ' bg-base-200' : ''}`} key={`row-${rowIndex}`}>{ row.map((number, colIndex) =>
						<td className="text-right px-[2px] py-[2px] w-8" key={`col-${colIndex}`}>
							{ renderValue(number, radix, low, space) }
						</td>)}
					</tr>)}
				</tbody>
			</table>
		</div>
	</div>
}

function renderValue(val: number, radix: Radix, low: number, space: number) {
	if (isNaN(val)) return <span/>
	return <div className="relative" /*tooltip" data-tip={(low === 0 ? val : val - low) / space * 300}*/>
		<div
			className="font-mono font-semibold text-xl text-right whitespace-nowrap"
			style={{ color: `hsl(${(low === 0 ? val : val - low) / space * 300} 80% 40%)`}}
			>
			{ num2str(BigInt(val), radix) }
		</div>
		<span className="text-[0.6em] leading-[2px] text-center absolute right-0 top-0.5">{val}</span>
	</div>
}

function EditRowsOrColumns({ columns, rows, update, setEdit }: { columns?: number, rows?: number, update?: (value: number) => void, setEdit: (value: boolean) => void }) {
	if (!update) return

	return <div className="tooltip tooltip-bottom" data-tip={columns ? 'number of columns' : 'number of rows'}>
		<input
			className="input input-xs w-[4em]"
			type="number"
			value={columns ?? rows}
			onChange={e => update(Number(e.target.value))}
			onKeyDown={e => { if (e.key === 'Escape') setEdit(false) }}
		/>
	</div>
}

// export default memo(Table, ({radix: oldRadix, numbers: oldNumbers }, { radix: newRadix, numbers: newNumbers }) => {
// 	const ret = oldRadix.name === newRadix.name
// 		&& oldRadix.chars.every((char, i) => char === newRadix.chars[i])
// 		&& oldNumbers.length === newNumbers.length
// 		&& oldNumbers.every((row, i) => row.every((n, j) => n === newNumbers[i][j]))
// 	console.log(`areNumbersEqual(${newRadix.name}): `, ret)
// 	return ret
// })
