import React, { useState, memo, useEffect } from 'react'

import { Radix, num2str, str2num, areRadixesEqual } from '../utils'


function Convert({ tab, radixes }: { tab: string, radixes: Radix[] }) {
	const [ value, setValue ] = useState(0n)

	const keyDown = (e: KeyboardEvent) => {
		switch (e.key) {
			case '0': setValue(0n); break
			case '+':
			case '=': setValue(v => v + 1n); break
			case '-':
			case '_': setValue(v => v - 1n); break
		}
	}

	useEffect(() => {
		document.addEventListener('keydown', keyDown)
		return () => document.removeEventListener('keydown', keyDown)
	}, [])

	const updateValue = (v: bigint, radix?: Radix) => {
		setValue(v)
	}

	// console.log('Convert: ', { radixes })

	return <div className="flex flex-col gap-1 items-start relative w-full text-[3vh] mx-0 my-[3vh] pl-[3vw]">
		<div className="flex flex-row gap-1">
			<button className="btn btn-circle btn-sm" onClick={() => updateValue(value + 1n)}>+</button>
			<button className="btn btn-circle btn-sm" onClick={() => updateValue(0n)}>␡</button>
			<button className="btn btn-circle btn-sm" onClick={() => updateValue(value - 1n)}>-</button>
		</div>
		{radixes.map((radix, index) =>
			<div key={radix.name}>
				<span key={radix.name} className="flex flex-row gap-1 items-center float-left">
					<button className="btn btn-sm btn-circle" onClick={() => updateValue(filling_shl(value, radix), radix)}>⋘</button>
					<button className="btn btn-sm btn-circle" onClick={() => updateValue(shl(value, radix), radix)}>≪</button>
					<button className="btn btn-sm btn-circle" onClick={() => updateValue(shr(value, radix), radix)}>≫</button>
					<span className="text-[1.2em]">=</span>
				</span>
				<NumberContainer
					value={value}
					radix={radix}
					radixIndex={index}
					numRadixes={radixes.length}
					updateValue={updateValue} />
			</div>
		)}
	</div>
}

export default memo(Convert, areRadixesEqual)

function NumberContainer({ value, radix, radixIndex, numRadixes, updateValue }: {
	value: bigint,
	radix: Radix,
	radixIndex: number,
	numRadixes: number
	updateValue: (v: bigint, radix: Radix) => void
}) {
	const [ v, setV ] = useState(num2str(value, radix))

	useEffect(() => setV(num2str(value, radix)), [ value, radix ])

	const handleInput: React.FormEventHandler<HTMLSpanElement> = e => {
		try {
			const s = e.currentTarget.innerText.trimEnd().toUpperCase()
			const n = str2num(s, radix)
			updateValue(n, radix)
		} catch (error) {
			console.error(error)
			e.currentTarget.innerText = v
		}
		moveCursorToEnd(e.currentTarget)
	}

	return <>
		<span
			className="number break-all text-[1.2em] uppercase outline-none"
			tabIndex={1}
			contentEditable={true}
			suppressContentEditableWarning={true}
			onInput={handleInput}
			spellCheck={false}
			style={{ color: `hsl(${radixIndex / numRadixes * 300} 80% 40%)` }}
		>
			{v}
		</span>
		<span>
			<sub className="text-[0.4em]">{radix.name}</sub>
			<sup className="text-[0.4em]">({v.length})</sup>
		</span>
	</>
}

function filling_shl(value: bigint, radix: Radix) {
	return value ? value * radix.radix + 1n : 1n
}

function shl(value: bigint, radix: Radix) {
	return value * radix.radix + (radix.system === "bijective" ? 1n : 0n)
}

function shr(value: bigint, radix: Radix) {
	return str2num(num2str(value, radix).slice(0, -1), radix)
}

function moveCursorToEnd(ref: Node) {
	if (window.getSelection && document.createRange) {
		const range = document.createRange()
		range.selectNodeContents(ref)
		range.collapse(false)
		const sel = window.getSelection()
		if (sel) {
			sel.removeAllRanges()
			sel.addRange(range)
		}
	}
}
