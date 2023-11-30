// @ts-expect-error: TS2305: Module '"react"' has no exported member 'experimental_useEffectEvent'.
import React, { ComponentProps, useState, useEffect, useRef, experimental_useEffectEvent } from 'react'

import { Radix, num2str, str2num, filling_shl, shl, shr, allowedCharaters, sanitizeInput, sumDigits } from '../utils'


export default function Convert({ radixes, value, updateValue }: {
	radixes: Radix[],
	value: bigint,
	updateValue: (value: bigint, radix?: Radix) => void
}) {
	const plusButtonRef = useRef<HTMLButtonElement>(null)
	const deleteButtonRef = useRef<HTMLButtonElement>(null)
	const minusButtonRef = useRef<HTMLButtonElement>(null)

	// console.log('Convert: ', { value, radixes })

	useEffect(() => {
		document.addEventListener('keydown', keyDown)
		return () => document.removeEventListener('keydown', keyDown)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const keyDown = experimental_useEffectEvent((e: KeyboardEvent) => {
		switch (e.key) {
			case 'Backspace':
			case 'Delete':
				deleteButtonRef.current?.focus()
				updateValue(0n)
				break
			case '+':
			case '=':
				plusButtonRef.current?.focus()
				updateValue(value + 1n)
				break
			case '-':
			case '_':
				minusButtonRef.current?.focus()
				updateValue(value - 1n)
				break
		}
	})

	return <main className="flex flex-col items-start text-sm text-[clamp(0.6rem,2vw,1rem)] leading-8 h-8 mx-[clamp(0.5rem,1.5vw,2rem)]">
		<div className="flex flex-row gap-1 relative lg:left-32 mb-1">
			<button className="btn btn-circle btn-sm text-lg" ref={plusButtonRef} onClick={() => updateValue(value + 1n)}>+</button>
			<button className="btn btn-circle btn-sm text-2xl" ref={deleteButtonRef} onClick={() => updateValue(0n)}>␡</button>
			<button className="btn btn-circle btn-sm text-lg" ref={minusButtonRef} onClick={() => updateValue(value - 1n)}>-</button>
		</div>{ radixes.map((radix, index) =>
		<div key={radix.name}>
			<span className="hidden md:flex flex-row items-center float-left">
				<span className="hidden lg:inline-block text-center w-32"><span className="badge badge-lg badge-outline m-1">{radix.name}</span></span>
				<span className="flex flex-row gap-1">
					<button className="btn btn-sm btn-circle text-lg" onClick={() => updateValue(filling_shl(value, radix), radix)}>⋘</button>
					<button className="btn btn-sm btn-circle text-lg" disabled={ value === 0n || radix.system === "bijective" } onClick={() => updateValue(shl(value, radix), radix)}>≪</button>
					<button className="btn btn-sm btn-circle text-lg" disabled={ value === 0n } onClick={() => updateValue(shr(value, radix), radix)}>≫</button>
				</span>
			</span>
			<NumberLine className="text-center text-[1.5em] h-8"
				value={value}
				radix={radix}
				radixIndex={index}
				numRadixes={radixes.length}
				updateValue={updateValue} />
		</div>)}
	</main>
}

function NumberLine({ value, radix, radixIndex, numRadixes, updateValue, ...props }: ComponentProps<"div"> & {
	value: bigint,
	radix: Radix,
	radixIndex: number,
	numRadixes: number
	updateValue: (value: bigint, radix?: Radix) => void
}) {
	const [ v, setV ] = useState(num2str(value, radix))
	const [ editing, setEditing ] = useState(false)
	const [ error, setError ] = useState<string>()
	const [ errorLevel, setErrorLevel ] = useState<'error' | 'warning'>('error')
	const ref = useRef<HTMLSpanElement>(null)

	useEffect(() => { if (!editing) setV(num2str(value, radix)) }, [ editing, value, radix ])

	const getCaretPosition = () => window.getSelection()?.getRangeAt(0).startOffset ?? 0

	const setCaretPosition = (position: number) => {
		setTimeout(() => { if (ref.current) window.getSelection()?.setPosition(ref.current.childNodes[0], position) }, 0)
	}

	const handleInput = (e: React.FormEvent<HTMLSpanElement>) => {
		// console.log('handleInput:', e)

		e.stopPropagation()

		const s = e.currentTarget.innerText.toUpperCase()
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
			console.error(error)
			setError((error as Error).message)
			setErrorLevel('error')
			e.currentTarget.innerText = v
			position -= 1
		}
		setCaretPosition(position)
	}

	const handlePaste = (e: React.ClipboardEvent<HTMLSpanElement>) => {
		e.preventDefault()

		let position = getCaretPosition()
		try {
			const [ input, rest ] = sanitizeInput(e.clipboardData.getData('text'), radix)
			const range = window.getSelection()?.getRangeAt(0)
			let newV
			if (range?.startContainer === ref.current) {
				newV = input
			} else {
				const selectionRange = range ? range.endOffset - range.startOffset : 0
				newV = Array.from(v).toSpliced(position, selectionRange, input).join('')
			}
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
			console.error(error)
			setError((error as Error).message)
			setErrorLevel('error')
		}
		setCaretPosition(position)
	}

	return <span {...props}>
		<span>=</span>
		<span className={`break-all text-start outline-none inline${error ? ` tooltip tooltip-open tooltip-${errorLevel}` : ''}`} data-tip={error}
			tabIndex={1}
			contentEditable={true}
			suppressContentEditableWarning={true}
			spellCheck={false}
			onKeyDown={e => { if (e.key === 'Escape') { e.currentTarget.blur() } else e.stopPropagation() }}
			onInput={handleInput}
			onPaste={handlePaste}
			onDoubleClick={() => { if (ref.current) window.getSelection()?.selectAllChildren(ref.current) }}
			onFocus={() => setEditing(true)}
			onBlur={() => { setEditing(false); setError(undefined); setV(num2str(value, radix)) }}
			style={{ color: `hsl(${radixIndex / numRadixes * 300} 80% 40%)` }}
			ref={ref}
		>
			{v}
		</span>
		<sub className="lg:hidden text-sm">{radix.name}</sub>
		<span className="text-xs"> #{v.length} {sumDigits(num2str(value, radix), radix)}</span>
	</span>
}
