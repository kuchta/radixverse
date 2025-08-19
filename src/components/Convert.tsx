import type { FormEvent, ClipboardEvent, ComponentProps } from 'react'
import { useState, useEffect, useRef } from 'react'

import { type Radix, num2str, str2num, filling_shl, shl, shr, allowedCharaters, sanitizeInput, createRadix, getCharsForTooltip } from '../utils'


export default function Convert({ radixes, value, updateValue }: {
	radixes: Radix[],
	value: bigint,
	updateValue: (value: bigint, radix?: Radix) => void
}) {
	const plusButtonRef = useRef<HTMLButtonElement>(null)
	const deleteButtonRef = useRef<HTMLButtonElement>(null)
	const minusButtonRef = useRef<HTMLButtonElement>(null)
	const valueRef = useRef(value)

	useEffect(() => { valueRef.current = value }, [ value ])

	useEffect(() => {
		const keyDown: (e: KeyboardEvent) => void = (e: KeyboardEvent) => {
			switch (e.key) {
				case 'Backspace':
				case 'Delete':
					deleteButtonRef.current?.focus()
					updateValue(0n)
					break
				case '+':
				case '=':
					plusButtonRef.current?.focus()
					updateValue(valueRef.current + 1n)
					break
				case '-':
				case '_':
					minusButtonRef.current?.focus()
					updateValue(valueRef.current - 1n)
					break
			}
		}
		document.addEventListener('keydown', keyDown)
		return () => document.removeEventListener('keydown', keyDown)
	}, [])

	return <main className="flex flex-col text-[clamp(1.3rem,2.3vw,2.1rem)] mx-[clamp(0.5rem,1.5vw,2rem)]">
		<div className="flex relative lg:left-32 max-w-fit gap-1">
			<span className="tooltip tooltip-top" data-tip="Increment">
				<button className="btn btn-circle btn-sm md:btn-xs lg:btn-sm" ref={plusButtonRef} onClick={() => updateValue(value + 1n)}>+</button>
			</span>
			<span className="tooltip tooltip-top" data-tip="Reset">
				<button className="btn btn-circle btn-sm md:btn-xs lg:btn-sm" ref={deleteButtonRef} onClick={() => updateValue(0n)}>␡</button>
			</span>
			<span className="tooltip tooltip-top" data-tip="Decrement">
				<button className="btn btn-circle btn-sm md:btn-xs lg:btn-sm" ref={minusButtonRef} onClick={() => updateValue(value - 1n)}>-</button>
			</span>
		</div>{ radixes.map((radix, index) =>
		<div key={radix.name}>
			<span className="hidden lg:inline-block text-center w-32">
				<span className="tooltip tooltip-right whitespace-pre before:content-[attr(data-tip)] before:max-w-[50rem]" data-tip={ getCharsForTooltip(radix) }>
					<span className="badge badge-neutral badge-outline badge-lg align-middle">{radix.name}</span>
				</span>
			</span>
			<span className="hidden md:inline-flex gap-1">
				<div className="tooltip tooltip-top" data-tip="Filling shift left">
					<button className="btn btn-circle btn-xs lg:btn-sm inline-block align-middle" onClick={() => updateValue(filling_shl(value, radix), radix)}>⋘</button>
				</div>
				<div className="tooltip tooltip-top" data-tip="Shift left">
					<button className="btn btn-circle btn-xs lg:btn-sm inline-block align-middle" disabled={ value === 0n || radix.system === 'bijective' || radix.system === 'sum'} onClick={() => updateValue(shl(value, radix), radix)}>≪</button>
				</div>
				<div className="tooltip tooltip-top" data-tip="Shift right">
					<button className="btn btn-circle btn-xs lg:btn-sm inline-block align-middle" disabled={ value === 0n } onClick={() => updateValue(shr(value, radix), radix)}>≫</button>
				</div>
			</span>
			<span> = </span>
			<NumberLine value={value} radix={radix} radixIndex={index} numRadixes={radixes.length} updateValue={updateValue}/>
		</div> )}
	</main>
}

function NumberLine({ value, radix, radixIndex, numRadixes, updateValue }: ComponentProps<'div'> & {
	value: bigint,
	radix: Radix,
	radixIndex: number,
	numRadixes: number
	updateValue: (value: bigint, radix?: Radix) => void
}) {
	const [ strVal, setStrVal ] = useState(num2str(value, radix))
	const [ editing, setEditing ] = useState(false)
	const [ error, setError ] = useState<string>()
	const [ errorLevel, setErrorLevel ] = useState<'error' | 'warning'>('error')
	const ref = useRef<HTMLSpanElement>(null)

	useEffect(() => { if (!editing) setStrVal(num2str(value, radix)) }, [ editing, value, radix ])

	const updateError = (error: string, errorLvl: typeof errorLevel) => {
		setError(error)
		setErrorLevel(errorLvl)
		setTimeout(() => setError(undefined), 10000)
	}

	const getCaretPosition = () => getSelection()?.getRangeAt(0).startOffset ?? 0

	const setCaretPosition = (position: number) => {
		setTimeout(() => { if (ref.current) getSelection()?.setPosition(ref.current.childNodes[0], position) }, 0)
	}

	const handleInput = (e: FormEvent<HTMLSpanElement>) => {
		e.stopPropagation()

		const s = e.currentTarget.innerText.toUpperCase()
		if (s === '') {
			setStrVal('')
			updateValue(0n)
			return
		}

		let position = getCaretPosition()
		try {
			const n = str2num(s, radix)
			setStrVal(s)
			updateValue(n, radix)
			setError(undefined)
		} catch (error) {
			console.error(error)
			updateError((error as Error).message, 'error')
			e.currentTarget.innerText = strVal
			position -= 1
		}
		setCaretPosition(position)
	}

	const handlePaste = (e: ClipboardEvent<HTMLSpanElement>) => {
		e.preventDefault()

		let position = getCaretPosition()
		try {
			const [ input, rest ] = sanitizeInput(e.clipboardData.getData('text'), radix)
			const range = getSelection()?.getRangeAt(0)
			let newV: string
			if (range?.startContainer === ref.current) {
				newV = input
			} else {
				const selectionRange = range ? range.endOffset - range.startOffset : 0
				newV = Array.from(strVal).toSpliced(position, selectionRange, input).join('')
			}
			const n = str2num(newV, radix)
			setStrVal(newV)
			updateValue(n, radix)
			position += input.length
			if (rest) {
				updateError(`Non-Base characters "${rest}" has been filtered out. ${allowedCharaters(radix)}`, 'warning')
			} else {
				setError(undefined)
			}
		} catch (error) {
			console.error(error)
			updateError((error as Error).message, 'error')
		}
		setCaretPosition(position)
	}

	return <>
		<span className={`font-mono font-medium break-all outline-none${error ? ` tooltip tooltip-open tooltip-${errorLevel}` : ''}`} data-tip={error}
			tabIndex={0}
			contentEditable
			suppressContentEditableWarning
			spellCheck={false}
			onKeyDown={e => { if (e.key === 'Escape' || e.key === 'Enter') { e.currentTarget.blur() } else e.stopPropagation() }}
			onInput={handleInput}
			onPaste={handlePaste}
			onDoubleClick={() => { if (ref.current) getSelection()?.selectAllChildren(ref.current) }}
			onFocus={() => setEditing(true)}
			onBlur={() => { setEditing(false); setError(undefined); setStrVal(num2str(value, radix)) }}
			style={{ color: `hsl(${radixIndex / numRadixes * 300} 80% 40%)` }}
			ref={ref}
		>
			{strVal}
		</span>
		<sub className="lg:hidden align-middle text-[0.6rem]">{radix.name}</sub>
		<span className="text-[0.5em]">
			<span> #{strVal.length} </span>
			<DigitSum number={value} radix={radix}/>
		</span>
	</>
}

function DigitSum({ number, radix }: { number: bigint, radix: Radix }) {
	let num = num2str(number, radix)

	let neg = false
	if (num.startsWith('-')) {
		neg = true
		num = num.slice(1)
	}

	let n = Iterator.from(num).reduce((a, v) => a + str2num(v, radix), 0n)
	if (neg) n = -n

	return <span>
		<span className="whitespace-nowrap">∑=<span className="font-medium">{num2str(n, radix)}</span></span>
		<sub className="text-nowrap">{radix.name}</sub>{ !(radix.system === 'standard' && radix.radix === 10n) &&
		<>
			<span>=</span>
			<span className="font-mono font-medium">{num2str(radix.system === 'sum' ? number : n, radix = createRadix(10))}</span>
			<sub className="text-nowrap">{radix.name}</sub>
		</>}
	</span>
}
