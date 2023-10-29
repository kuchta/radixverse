import React, { useState, memo, useEffect, useRef } from 'react'

import { Radix, num2str, str2num, areRadixesEqual } from '../utils'


function Convert({ radixes }: { radixes: Radix[] }) {
	const [ value, setValue ] = useState(0n)

	const keyDown = (e: KeyboardEvent) => {
		// console.log('keyDown:', e)
		switch (e.key) {
			case 'Backspace':
			case 'Delete': setValue(0n); break
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

	const updateValue = (v: bigint) => {
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
				<span className="flex flex-row gap-1 items-center float-left" key={radix.name}>
					<button className="btn btn-sm btn-circle" onClick={() => updateValue(filling_shl(value, radix))}>⋘</button>
					<button className="btn btn-sm btn-circle" onClick={() => updateValue(shl(value, radix))}>≪</button>
					<button className="btn btn-sm btn-circle" onClick={() => updateValue(shr(value, radix))}>≫</button>
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
	updateValue: (v: bigint) => void
}) {
	const [ v, setV ] = useState(num2str(value, radix))
	const ref = useRef<HTMLSpanElement>(null)
	const [ position, setPosition ] = useState<number>()

	useEffect(() => {
		if (position == undefined) {
			setV(num2str(value, radix))
		}
	}, [ value, radix ])

	useEffect(() => {
		if (position != undefined && ref.current) {
			setCaretPosition(ref.current, position)
		}
	}, [ v ])

	const handleInput: React.FormEventHandler<HTMLSpanElement> = e => {
		e.stopPropagation()

		const s = e.currentTarget.innerText.trim().toUpperCase()
		if (s === '') return

		let position = getCaretPosition()
		try {
			const n = str2num(s, radix)
			setV(s)
			updateValue(n)
		} catch (error) {
			console.error(error)
			e.currentTarget.innerText = v
			if (position && ref.current) {
				position -= 1
				setCaretPosition(ref.current, position)
			}
		}
		setPosition(position)
	}

	return <>
		<span
			className="number break-all text-[1.2em] uppercase outline-none"
			tabIndex={1}
			contentEditable={true}
			suppressContentEditableWarning={true}
			spellCheck={false}
			onInput={handleInput}
			onBlur={() => setPosition(undefined)}
			ref={ref}
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

function getCaretPosition() {
	const sel = window.getSelection()
	if (sel) {
		return sel.getRangeAt(0).startOffset
	}
}

function setCaretPosition(node: Node, position: number) {
	const sel = window.getSelection()
	if (sel) {
		sel.setPosition(node.childNodes[0], position)
	}
}
