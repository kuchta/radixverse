import React, { useState, useEffect, useRef } from 'react'

import { Radix, num2str, str2num, filling_shl, shl, shr, allowedCharaters, sanitizeInput } from '../utils'


export default function Convert({ radixes, value, updateValue }: {
	radixes: Radix[],
	value: bigint,
	updateValue: (value: bigint | ((value: bigint) => bigint), radix?: Radix) => void
}) {
	const plusButtonRef = useRef<HTMLButtonElement>(null)
	const deleteButtonRef = useRef<HTMLButtonElement>(null)
	const minusButtonRef = useRef<HTMLButtonElement>(null)

	const keyDown = (e: KeyboardEvent) => {
		// console.log('keyDown:', e)

		switch (e.key) {
			case 'Backspace':
			case 'Delete':
				deleteButtonRef.current?.focus()
				updateValue(0n)
				break
			case '+':
			case '=':
				plusButtonRef.current?.focus()
				updateValue(v => v + 1n)
				break
			case '-':
			case '_':
				minusButtonRef.current?.focus()
				updateValue(v => v - 1n)
				break
		}
	}

	useEffect(() => {
		document.addEventListener('keydown', keyDown)
		return () => document.removeEventListener('keydown', keyDown)
	}, [])

	// console.log('Convert: ', { value, radixes })

	return <main>
		<div className="flex flex-col gap-1 items-start relative w-full text-[3vh] mx-0 my-[3vh] pl-[3vw]">
			<div className="flex flex-row gap-1">
				<button className="btn btn-circle btn-sm text-lg" ref={plusButtonRef} onClick={() => updateValue(value + 1n)}>+</button>
				<button className="btn btn-circle btn-sm text-2xl" ref={deleteButtonRef} onClick={() => updateValue(0n)}>␡</button>
				<button className="btn btn-circle btn-sm text-lg" ref={minusButtonRef} onClick={() => updateValue(value - 1n)}>-</button>
			</div>
			{ radixes.map((radix, index) =>
				<div key={radix.name}>
					<span className="flex flex-row gap-1 items-center float-left leading-8" key={radix.name}>
						<button className="btn btn-sm btn-circle text-lg" onClick={() => updateValue(filling_shl(value, radix), radix)}>⋘</button>
						<button className="btn btn-sm btn-circle text-lg" disabled={ value === 0n || radix.system === "bijective" } onClick={() => updateValue(shl(value, radix), radix)}>≪</button>
						<button className="btn btn-sm btn-circle text-lg" disabled={ value === 0n } onClick={() => updateValue(shr(value, radix), radix)}>≫</button>
						<span className="text-[1.2em]">=</span>
					</span>
					<NumberLine
						value={value}
						radix={radix}
						radixIndex={index}
						numRadixes={radixes.length}
						updateValue={updateValue} />
				</div>
			)}
		</div>
	</main>
}

function NumberLine({ value, radix, radixIndex, numRadixes, updateValue }: {
	value: bigint,
	radix: Radix,
	radixIndex: number,
	numRadixes: number
	updateValue: (value: bigint | ((value: bigint) => bigint), radix?: Radix) => void
}) {
	const [ v, setV ] = useState(num2str(value, radix))
	const [ editing, setEditing ] = useState(false)
	const [ error, setError ] = useState<string>()
	const [ errorLevel, setErrorLevel ] = useState<'error' | 'warning'>('error')
	const ref = useRef<HTMLSpanElement>(null)

	useEffect(() => { if (!editing) setV(num2str(value, radix)) }, [ value, radix ])

	const getCaretPosition = () => window.getSelection()?.getRangeAt(0).startOffset ?? 0

	const setCaretPosition = (position: number) => {
		setTimeout(() => { if (ref.current) window.getSelection()?.setPosition(ref.current.childNodes[0], position) }, 0)
	}

	const handleInput = (e: React.FormEvent<HTMLSpanElement>) => {
		// console.log('handleInput:', e)

		e.stopPropagation()

		const s = e.currentTarget.innerText //.trim().toUpperCase()
		if (s === '') {
			setV('')
			updateValue(0n)
			return
		}

		let position = getCaretPosition()
		try {
			const n = str2num(s, radix)
			setV(s)
			updateValue(n, radix)
			setError(undefined)
		} catch (error) {
			setError((error as Error).message)
			setErrorLevel('error')
			e.currentTarget.innerText = v
			position -= 1
		}
		setCaretPosition(position)
	}

	const handlePaste = (e: React.ClipboardEvent<HTMLSpanElement>) => {
		// console.log('handlePaste:', e)

		e.preventDefault()

		let position = getCaretPosition()
		try {
			const range = window.getSelection()?.getRangeAt(0)
			const selectionRange = range ? range.endOffset - range.startOffset : 0
			const [ input, rest ] = sanitizeInput(e.clipboardData.getData('text'), radix)
			// @ts-expect-error https://github.com/microsoft/TypeScript/issues/56533
			const newV = [].toSpliced.call(v, position, selectionRange, input).join('')
			const n = str2num(newV, radix)
			setV(newV)
			updateValue(n, radix)
			position += input.length
			if (rest) {
				setError(`Non-Base characters "${rest}" has been filtered out. ${allowedCharaters(radix)}`)
				setErrorLevel('warning')
			} else {
				setError(undefined)
			}
		} catch (error) {
			setError((error as Error).message)
			setErrorLevel('error')
		}
		setCaretPosition(position)
	}

	return <span className={`${error ? 'tooltip tooltip-open' : ''} tooltip-${errorLevel} inline leading-8`} data-tip={error}>
		<span
			className="break-all text-start text-[1.2em] uppercase outline-none"
			tabIndex={1}
			contentEditable={true}
			suppressContentEditableWarning={true}
			spellCheck={false}
			onKeyDown={e => { if (e.key === 'Escape') { e.currentTarget.blur() } else e.stopPropagation() }}
			onInput={handleInput}
			onPaste={handlePaste}
			onFocus={() => setEditing(true)}
			onBlur={() => { setEditing(false); setError(undefined) }}
			ref={ref}
			style={{ color: `hsl(${radixIndex / numRadixes * 300} 80% 40%)` }}
		>
			{v}
		</span>
		<span>
			<sub className="text-[0.4em]">{radix.name}</sub>
			<sup className="text-[0.4em]">({v.length})</sup>
		</span>
	</span>
}
