import { type ComponentProps, type InputEventHandler, type ClipboardEventHandler, useState, useEffectEvent, useEffect, useRef } from 'react'
import { getErrorMessage } from 'react-error-boundary'

import { type Radix, num2str, str2num, allowedCharaters, createRadix } from '#/radixes.ts'
import type { UpdateValue } from '#/app.tsx'
import { sanitizeInput } from '#/common.ts'
import { getCharsForTooltip } from './table.tsx'


const BIG_INT_0 = 0n
const BIG_INT_1 = 1n

export default function Convert({ radixes, value, updateValue }: {
	radixes: Radix[],
	value: bigint,
	updateValue: UpdateValue,
}) {
	const plusButtonRef = useRef<HTMLButtonElement>(null)
	const deleteButtonRef = useRef<HTMLButtonElement>(null)
	const minusButtonRef = useRef<HTMLButtonElement>(null)

	const keyDown = useEffectEvent((e: KeyboardEvent) => {
		switch (e.key) {
			case 'Backspace':
			case 'Delete':
				deleteButtonRef.current?.focus()
				updateValue(BIG_INT_0)
				break
			case '+':
			case '=':
				plusButtonRef.current?.focus()
				updateValue(value + BIG_INT_1)
				break
			case '-':
			case '_':
				minusButtonRef.current?.focus()
				updateValue(value - BIG_INT_1)
				break
		}
	})

	useEffect(() => {
		document.addEventListener('keydown', keyDown)
		return () => { document.removeEventListener('keydown', keyDown) }
	}, [])

	return (
		<main className="flex flex-col text-[clamp(1.3rem,2.3vw,2.1rem)] mx-[clamp(0.5rem,1.5vw,2rem)]">
			<div className="flex relative lg:left-32 max-w-fit gap-1">
				<span className="tooltip tooltip-top" data-tip="Increment">
					<button className="btn btn-circle btn-sm md:btn-xs lg:btn-sm" ref={plusButtonRef} type="button" onClick={() => { updateValue(value + BIG_INT_1) }}>+</button>
				</span>
				<span className="tooltip tooltip-top" data-tip="Reset">
					<button className="btn btn-circle btn-sm md:btn-xs lg:btn-sm" ref={deleteButtonRef} type="button" onClick={() => { updateValue(BIG_INT_0) }}>␡</button>
				</span>
				<span className="tooltip tooltip-top" data-tip="Decrement">
					<button className="btn btn-circle btn-sm md:btn-xs lg:btn-sm" ref={minusButtonRef} type="button" onClick={() => { updateValue(value - BIG_INT_1) }}>-</button>
				</span>
			</div>{ radixes.map((radix, index) =>
			<div key={radix.name}>
				<span className="hidden lg:inline-block text-center w-32">
					<span className="tooltip tooltip-right whitespace-pre before:content-[attr(data-tip)] before:max-w-200" data-tip={getCharsForTooltip(radix)}>
						<span className="badge badge-neutral badge-outline badge-lg align-middle">{radix.name}</span>
					</span>
				</span>
				<span className="hidden md:inline-flex gap-1">
					<div className="tooltip tooltip-top" data-tip="Filling shift left">
						<button className="btn btn-circle btn-xs lg:btn-sm inline-block align-middle" type="button" onClick={() => { updateValue(filling_shl(value, radix), radix) }}>⋘</button>
					</div>
					<div className="tooltip tooltip-top" data-tip="Shift left">
						<button className="btn btn-circle btn-xs lg:btn-sm inline-block align-middle" disabled={value === BIG_INT_0 || radix.system === 'bijective' || radix.system === 'sum'} type="button" onClick={() => { updateValue(shl(value, radix), radix) }}>≪</button>
					</div>
					<div className="tooltip tooltip-top" data-tip="Shift right">
						<button className="btn btn-circle btn-xs lg:btn-sm inline-block align-middle" disabled={value === BIG_INT_0} type="button" onClick={() => { updateValue(shr(value, radix), radix) }}>≫</button>
					</div>
				</span>
				<span> = </span>
				<NumberLine value={value} radix={radix} radixIndex={index} numRadixes={radixes.length} updateValue={updateValue}/>
			</div>)}
		</main>
	)
}

function NumberLine({ value, radix, radixIndex, numRadixes, updateValue }: ComponentProps<'div'> & {
	value: bigint,
	radix: Radix,
	radixIndex: number,
	numRadixes: number,
	updateValue: UpdateValue,
}) {
	const [ strVal, setStrVal ] = useState(num2str(value, radix))
	const [ editing, setEditing ] = useState(false)
	const [ error, setError ] = useState<unknown>()
	const [ errorLevel, setErrorLevel ] = useState<'error' | 'warning'>('error')
	const ref = useRef<HTMLSpanElement>(null)

	const updateError = (error: unknown, errorLvl: typeof errorLevel) => {
		setError(error)
		setErrorLevel(errorLvl)
		setTimeout(() => { setError(undefined) }, 10_000)
	}

	const setCaretPosition = (position: number) => {
		setTimeout(() => { if (ref.current) getSelection()?.setPosition(ref.current.childNodes[0], position) }, 0)
	}

	const handleInput: InputEventHandler<HTMLSpanElement> = e => {
		e.stopPropagation()

		const s = e.currentTarget.textContent.toUpperCase()
		if (s === '') {
			setStrVal('')
			updateValue(BIG_INT_0)
			return
		}

		let position = getCaretPosition()
		try {
			const n = str2num(s, radix)
			setStrVal(s)
			updateValue(n, radix)
			setError(undefined)
		} catch (error) {
			updateError(error, 'error')
			e.currentTarget.textContent = strVal
			position -= 1
		}
		setCaretPosition(position)
	}

	const handlePaste: ClipboardEventHandler<HTMLSpanElement> = e => {
		e.preventDefault()

		const [ input, rest ] = sanitizeInput(e.clipboardData.getData('text'), radix)
		if (rest) {
			updateError(`Non-Base characters "${rest}" has been filtered out. ${allowedCharaters(radix)}`, 'warning')
		}

		const position = getCaretPosition()
		const range = getSelection()?.getRangeAt(0)
		const newV = range?.startContainer === ref.current ? input : Array.from(strVal).toSpliced(position, range ? range.endOffset - range.startOffset : 0, input).join('')

		try {
			updateValue(str2num(newV, radix), radix)
			setStrVal(newV)
			setCaretPosition(position + input.length)
		} catch (error) {
			updateError(error, 'error')
		}
	}

	useEffect(() => { if (!editing) setStrVal(num2str(value, radix)) }, [ editing, value, radix ])

	return (
		<>
			<span
				className={`font-mono font-medium break-all outline-none${error ? ` tooltip tooltip-open tooltip-${errorLevel}` : ''}`}
				data-tip={getErrorMessage(error) ?? 'Unknown error'}
				role="textbox"
				tabIndex={0}
				contentEditable
				suppressContentEditableWarning
				spellCheck={false}
				onKeyDown={e => { if (e.key === 'Escape' || e.key === 'Enter') { e.currentTarget.blur() } else e.stopPropagation() }}
				onInput={handleInput}
				onPaste={handlePaste}
				onDoubleClick={() => { if (ref.current) getSelection()?.selectAllChildren(ref.current) }}
				onFocus={() => { setEditing(true) }}
				onBlur={() => { setEditing(false); setError(undefined); setStrVal(num2str(value, radix)) }}
				style={{ color: `hsl(${radixIndex / numRadixes * 300} 80% 40%)` }}
				ref={ref}
			>
				{strVal}
			</span>
			<sub className="lg:hidden align-middle text-[0.6rem]">{radix.name}</sub>
			<span className="text-[0.5em]">
				<span>
					<span> #{strVal.length} </span>
				</span>{ getDigitSumArray(value, radix).map(([ sum, system ]) =>
				<span key={`${system}-${sum}`}>
					<span className="whitespace-nowrap">∑</span>
					<span>=</span>
					<span className="font-mono font-medium">{sum}</span>
					<sub className="text-nowrap">{system}</sub>
				</span>)}
			</span>
		</>
	)
}

function getDigitSumArray(number: bigint, radix: Radix): [string, string][] {
	let num = num2str(number, radix)

	let neg = false
	if (num.startsWith('-')) {
		neg = true
		num = num.slice(1)
	}

	let n = Iterator.from(num).reduce((a, v) => a + str2num(v, radix), 0n)
	if (neg) n = -n

	num = num2str(n, radix)

	if (radix.system === 'standard' && radix.radix === 10n) {
		return (num.length === 1 || neg && num.length === 2) ? [[ num, radix.name ]] : [[ num, radix.name ], ...getDigitSumArray(n, radix) ]
	}

	return [[ num, radix.name ], ...getDigitSumArray(n, createRadix(10, 'standard')) ]
}

const getCaretPosition = () => getSelection()?.getRangeAt(0).startOffset ?? 0

function filling_shl(value: bigint, radix: Radix): bigint {
	return value ? value > 0 ? value * radix.radix + 1n : value * radix.radix - 1n : 1n
}

function shl(value: bigint, radix: Radix): bigint {
	return value * radix.radix
}

function shr(value: bigint, radix: Radix): bigint {
	return radix.system === 'sum' ? str2num(num2str(value, radix).slice(1), radix) : str2num(num2str(value, radix).slice(0, -1), radix)
}
