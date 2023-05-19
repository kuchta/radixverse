import { useState, memo, useEffect } from 'react'

import { Radix, num2str, str2num, areRadixesEqual } from '../utils'


function Convert({ tab, radixes }: { tab: string, radixes: Radix[] }) {
	const [ value, setValue ] = useState(0n)
	const [ currentRadix, setCurrentRadix ] = useState('10')

	const keyDown = (e: KeyboardEvent) => {
		switch (e.key) {
			case '0': setValue(0n); break
			case '+':
			case '=': setValue((v) => v + 1n); break
			case '-':
			case '_': setValue((v) => v - 1n); break
		}
	}

	useEffect(() => {
		document.addEventListener('keydown', keyDown)
		return () => document.removeEventListener('keydown', keyDown)
	}, [])

	const updateValue = (v: bigint, radix?: Radix) => {
		setValue(v)
		if (radix && radix.name !== currentRadix) {
			setCurrentRadix(radix.name)
		}
	}

	console.log('Convert: ', { radixes })

	return <div className="flex flex-col gap-1 items-start relative w-full text-[3vh] mx-0 my-[3vh] pl-[3vw]">
		<div className="flex flex-row gap-1">
			<button className="btn btn-circle btn-sm" onClick={() => updateValue(value + 1n)}>+</button>
			<button className="btn btn-circle btn-sm" onClick={() => updateValue(0n)}>␡</button>
			<button className="btn btn-circle btn-sm" onClick={() => updateValue(value - 1n)}>-</button>
		</div>
		{ radixes.map((radix, index) =>
			<div key={radix.name} className="">
				<span key={radix.name} className="flex flex-row gap-1 items-center float-left">
					<button className="btn btn-sm btn-circle" onClick={() => updateValue(filling_shl(value, radix), radix)}>⋘</button>
					<button className="btn btn-sm btn-circle" onClick={() => updateValue(shl(value, radix), radix)}>≪</button>
					<button className="btn btn-sm btn-circle" onClick={() => updateValue(shr(value, radix), radix)}>≫</button>
					<span className="text-[1.2em]">=</span>
				</span>
				<NumberContainerMemo
					value={value}
					radix={radix}
					radixIndex={index}
					numRadixes={radixes.length}
					currentRadix={currentRadix}
					updateValue={updateValue} />
			</div>
		)}
	</div>
}

export default memo(Convert, areRadixesEqual)

const NumberContainerMemo = memo(NumberContainer, (prevProps, props) => {
	const editing = prevProps.radix.name === props.currentRadix
	const focused = !document.activeElement || document.activeElement.classList.contains("number")
	return editing && focused
})

function NumberContainer(props: {
	value: bigint,
	radix: Radix,
	radixIndex: number,
	numRadixes: number
	currentRadix: string,
	updateValue: (v: bigint, radix: Radix) => void
}) {

	// console.log('NumberContainer:', props)

	const str = num2str(props.value, props.radix)

	return <>
		<span className="number break-all text-[1.2em] uppercase outline-none"
			spellCheck={false}
			tabIndex={1}
			contentEditable={true}
			suppressContentEditableWarning={true}
			style={{ color: `hsl(${props.radixIndex / props.numRadixes * 300} 80% 40%)` }}
			onInput={e => props.updateValue(str2num((e.target as HTMLDivElement).innerText, props.radix), props.radix)}
			// onFocus={e => { e.target.style.color = `hsl(${props.radixIndex / props.numRadixes * 300}, 80% 40%)` }}
			onBlur={e => {
				if (e.target.innerText === '') {
					props.updateValue(0n, props.radix)
					e.target.innerText = '0'
				}
			}}>
			{str}
		</span>
		<span>
			<sub className="text-[0.4em]">{props.radix.name}</sub>
			<sup className="text-[0.4em]">({str.length})</sup>
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
