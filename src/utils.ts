const zero = '0'
const base9 = '123456789'
const baseMinus9 = '➒➑➐➏➎➍➌➋➊'
// const baseMinus9 = '⑨⑧⑦⑥⑤④③②①'
const base26 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const baseMinus26 = '🅩🅨🅧🅦🅥🅤🅣🅢🅡🅠🅟🅞🅝🅜🅛🅚🅙🅘🅗🅖🅕🅔🅓🅒🅑🅐'
// const baseMinus26 = 'ⓏⓎⓍⓌⓋⓊⓉⓈⓇⓆⓅⓄⓃⓂⓁⓀⒿⒾⒽⒼⒻⒺⒹⒸⒷⒶ'
const baseBal71 = baseMinus26 + baseMinus9 + zero + base9 + base26
// const base32cz = 'ABCČDĎEFGHIJKLMNŇOPQRŘSŠTŤUVXYZŽ'
// const base36cz = 'AÁBCČDĎEÉFGHIÍJKLMNŇOÓPQRŘSŠTŤUÚVXZŽ'
// const base42 = [ 'A', 'Á', 'B', 'C', 'Č', 'D', 'Ď', 'E', 'É', 'Ě', 'F', 'G', 'H', 'Ch', 'I', 'Í', 'J', 'K', 'L', 'M', 'N', 'Ň', 'O', 'Ó', 'P', 'Q', 'R', 'Ř', 'S', 'Š', 'T', 'Ť', 'U', 'Ú', 'Ů', 'V', 'W', 'X', 'Y', 'Ý', 'Z', 'Ž' ]

const LS_THEME = 'theme'
const LS_CHARS = 'chars'
const LS_RADIXES = 'radixes'

export const defaultChars = baseBal71
const defaultCharsArray: string[] = Array.from(defaultChars)

export type Radix = {
	name: string
	radix: bigint
	system: 'standard' | 'bijective' | 'balanced' | 'clock' | 'sum' | 'balsum'
	chars: string[]
	enabled: boolean
	values: Map<string, bigint>
	reversedValues: Map<bigint, string>
	low: number
	high: number
}

export function getThemeLS(): string | undefined {
	return localStorage.getItem(LS_THEME) ?? undefined
}

export function setThemeLS(theme: string) {
	localStorage.setItem(LS_THEME, theme)
}

export function getCharsLS(): string | undefined {
	return localStorage.getItem(LS_CHARS) ?? undefined
}

export function setCharsLS(chars?: string) {
	if (chars) {
		localStorage.setItem(LS_CHARS, chars)
	} else {
		localStorage.removeItem(LS_CHARS)
	}
}

export function getRadixesLS(updateError: (error?: string) => void): Radix[] | undefined {
	const item = localStorage.getItem(LS_RADIXES)
	if (item == null) return

	try {
		const radixes = JSON.parse(item) as Radix[]
		return radixes.map(r => createRadix(r.radix as unknown as number, r.system, r.chars, r.enabled, r.name, false))
	} catch (error) {
		console.error(error)
		updateError((error as Error).message)
		localStorage.removeItem(LS_RADIXES)
	}
}

export function setRadixesLS(radixes: Radix[]) {
	const rs = radixes.map(r => ({ name: r.name, radix: Number(r.radix), system: r.system, chars: r.chars, enabled: r.enabled }))
	localStorage.setItem(LS_RADIXES, JSON.stringify(rs))
}

export function createRadixes(chars = defaultChars): Radix[] {
	const charsArray = chars !== defaultChars ? Array.from(chars) : undefined
	return Array.from(Array(35)).flatMap((_, i) => {
		const radix = i + 2
		const ret = [ createRadix(radix, 'standard', charsArray) ]
		if (radix < 36) ret.push(createRadix(radix, 'bijective', charsArray))
		if (radix & 1) ret.push(createRadix(radix, 'balanced', charsArray))
		if (radix <= 26) ret.push(createRadix(radix, 'sum', charsArray))
		// if (radix <= 27 && radix & 1) ret.push(createRadix(radix, 'balsum', charsArray))
		// if (radix % 2 === 0) ret.push(createRadix(radix, 'clock', chars))
		return ret
	})
}

export function createRadix(radix: number, system: Radix['system'] = 'standard', chars = defaultCharsArray, enabled?: boolean, name?: string, allChars = true): Radix {
	if (allChars) {
		if (chars !== defaultCharsArray && chars.length < defaultCharsArray.length) throw new Error(`chars must have at least ${defaultCharsArray.length} characters, ${chars.length} provided`)
		if (chars.length % 2 === 0) throw new Error('chars must have odd number of characters')
	}

	let ret: Radix

	if (system === 'standard') {
		if (allChars) {
			const zeroAt = (chars.length - 1) / 2
			chars = radix === 26 ? chars.slice(zeroAt + 10, zeroAt + 10 + radix) : chars.slice(zeroAt, zeroAt + radix)
		} else if (chars.length !== radix) invalidNumberOfCharacters(radix, system, radix, chars.length)

		const values = chars.map((c, i) => [ c, BigInt(i) ] as [ string, bigint ])

		ret = {
			name: name ?? `${radix}`,
			system: 'standard',
			radix: BigInt(radix),
			chars,
			values: new Map(values),
			reversedValues: new Map(values.map(([c, v]) => [v, c])),
			low: 0,
			high: radix - 1,
			enabled: enabled ?? [ 2, 10, 12, 26 ].includes(radix)
		}
	} else if (system === 'bijective') {
		if (allChars) {
			const zeroAt = (chars.length - 1) / 2
			chars = radix === 26 ? chars.slice(zeroAt, zeroAt + radix + 10).toSpliced(1, 9) : chars.slice(zeroAt, zeroAt + radix + 1)
		} else if (chars.length !== radix + 1) invalidNumberOfCharacters(radix, system, radix + 1, chars.length)

		const values = chars.map((c, i) => [ c, BigInt(i) ] as [ string, bigint ])

		ret = {
			name: name ?? `bij-${radix}`,
			system: 'bijective',
			radix: BigInt(radix),
			chars,
			values: new Map(values),
			reversedValues: new Map(values.map(([c, v]) => [v, c])),
			low: 1,
			high: radix,
			enabled: enabled ?? [ 26 ].includes(radix),
		}
	} else if (system === 'balanced') {
		if (radix % 2 === 0) throw new Error(`createRadix: Radix(${system}) must be odd: ${radix}`)
		if (!allChars && chars.length !== radix) invalidNumberOfCharacters(radix, system, radix, chars.length)

		const zeroAt = (chars.length - 1) / 2
		const half = (radix - 1) / 2
		const zeroChar = chars[zeroAt]
		chars = radix === 27 && allChars ? chars.slice(zeroAt + 10, zeroAt + 36).toSpliced(13, 0, zeroChar) : chars.slice(zeroAt - half, zeroAt + half + 1)
		const values = chars.map((c, i) => [ c, BigInt(-half + i) ] as [ string, bigint ])

		ret = {
			name: name ?? `bal-${radix}`,
			system: 'balanced',
			radix: BigInt(radix),
			chars,
			values: new Map(values),
			reversedValues: new Map(values.map(([c, v]) => [v, c])),
			low: -half,
			high: half,
			enabled: enabled ?? [ 3, 13, 19, 27 ].includes(radix),
		}
	} else if (system === 'clock') {
		if (radix % 2 !== 0) throw new Error(`createRadix: Radix(${system}) must be even: ${radix}`)
		let zeroAt: number
		if (allChars) {
			zeroAt = (chars.length - 1) / 2
		} else {
			if (chars.length !== radix) invalidNumberOfCharacters(radix, system, radix, chars.length)
			zeroAt = chars.length / 2 - 1
		}

		const half = radix / 2
		chars = chars.slice(zeroAt - half + 1, zeroAt + half + 1)
		const values = chars.map((c, i) => [ c, BigInt(-half + 1 + i) ] as [ string, bigint ])

		ret = {
			name: name ?? `clock-${radix}`,
			system: 'clock',
			radix: BigInt(radix),
			chars,
			values: new Map(values),
			reversedValues: new Map(values.map(([c, v]) => [v, c])),
			low: -half + 1,
			high: half,
			enabled: enabled ?? [ 2, 4, 6, 8, 10, 12, 16, 18, 20, 22, 24, 30, 36 ].includes(radix),
		}
	} else if (system === 'sum') {
		if (allChars) {
			chars = chars.slice((chars.length - 1) / 2).toSpliced(1, 9)
		}
		if (chars.length < radix) throw invalidNumberOfCharacters(radix, system, radix, chars.length, true)

		const r = radix - 1
		let order = 1
		const values = [[ chars[0], 0n ], ...chars.slice(1).map((c, i) => {
			if (i % r === 0 && i > 0) order *= r + 1
			return [ c, BigInt((i % r + 1) * order) ] as [ string, bigint ]
		})] as [ string, bigint ][]

		ret = {
			name: name ?? `sum-${radix}`,
			system: 'sum',
			radix: BigInt(radix),
			chars,
			values: new Map(values),
			reversedValues: new Map(values.reverse().map(([c, v]) => [v, c])),
			low: 1,
			high: radix,
			enabled: enabled ?? [ 2, 10 ].includes(radix),
		}
	} else if (system === 'balsum') {
		let half = (chars.length - 1) / 2
		if (allChars) {
			chars = chars.slice(half + 10).toSpliced((half - 9) / 2, 0, chars[half])
			half = (chars.length - 1) / 2
		}
		if (chars.length < radix) invalidNumberOfCharacters(radix, system, radix, chars.length, true)

		const high = (radix - 1) / 2
		let createValues: (order: number) => (c: string, i: number) => [ string, bigint ]
		if (radix === 3) {
			createValues = (order: number) => (c: string, i: number) => [ c, BigInt(3 ** i * order) ]
		} else {
			createValues = (order: number) => (c: string, i: number) => {
				if (i > 0 && i % high === 0) order *= radix
				return [ c, BigInt((i % high + 1) * order) ]
			}
		}

		const plusValues = chars.slice(half + 1).map(createValues(1))
		const minusValues = chars.slice(0, half).toReversed().map(createValues(-1))
		const values = [ ...minusValues.toReversed(), [ chars[half], 0n ], ...plusValues ]  as [ string, bigint ][]

		ret = {
			name: name ?? `balsum-${radix}`,
			system: 'balsum',
			radix: BigInt(radix),
			chars,
			values: new Map(values),
			reversedValues: new Map(values.map(([c, v]) => [v, c])),
			low: -high,
			high,
			enabled: enabled ?? [ 3, 27 ].includes(radix),
		}
	} else {
		throw new Error('createRadix: Unknown system:', system)
	}

	return ret
}

function invalidNumberOfCharacters(radix: number, system: Radix['system'], requiredLength: number, providedLength: number, atLeast = false) {
	throw new Error(`Radix(${system}, ${radix}) needs${atLeast ? ' at least' : ''} ${requiredLength} characarters, ${providedLength} provided`)
}

// const num2strCache = new Map<Radix, Map<bigint, string>>()
export function num2str(num: bigint, radix: Radix, maxLength = 28): string {
	if (num === 0n) return radix.reversedValues.get(0n)!
	// const str = num2strCache.get(radix)?.get(num)
	// if (str != undefined) {
	// 	return str
	// }

	const sum = radix.system === 'sum'
	const bal = radix.system === 'balanced'
	const balsum = radix.system === 'balsum'
	const clock = radix.system === 'clock'

	const ret: string[] = []

	const neg = num < 0n
	let n = neg ? -num : num

	if (sum) {
		let i: number
		let v: string | undefined
		const values = radix.reversedValues
		for (const value of values.keys()) {
			i = 0
			if (!value) continue
			while (n >= value) {
				if (v = values.get(value)) ret.push(v)
				if (++i === maxLength) {
					ret.unshift('…')
					n %= value
				} else {
					n -= value
				}
			}
		}
	// } else if (balsum) {
	// 	let i
	// 	const max = 5
	// 	let v: string | undefined
	// 	const values = radix.reversedValues
	// 	for (const value of neg ? values.keys() : Array(values.keys()).reverse()) {
	// 		if (!value) continue
	// 		i = 0
	// 		while (neg ? num <= value : num >= value) {
	// 			if (v = values.get(value)) ret.push(v)
	// 			if (++i === max) {
	// 				ret.unshift('…')
	// 				num = neg ? -(num % value) : num % value
	// 			} else {
	// 				num = neg ? num + value : num - value
	// 			}
	// 		}
	// 	}
	} else {
		const { radix: rad, system, reversedValues } = radix

		const bij = system === 'bijective'
		const high = BigInt(radix.high)

		let d: bigint
		let q: bigint
		let i = 1n
		for (; n > 0n; i *= rad) {
			d = n % rad
			if (bij) {
				q = d === 0n ? n / rad - 1n : n / rad
				d = n - q * rad
				n = q
			} else {
				if (bal || clock || balsum) {
					if (d > high || clock && neg && d === high) {
						d -= rad
						n += high
					}
					if (neg) d = -d
				}
				n /= rad
			}
			if (balsum) {
				if (d) ret.unshift(reversedValues.get(d * i)!)
			} else {
				ret.unshift(reversedValues.get(d)!)
			}
		}
	}

	if (neg && !(bal || clock || balsum)) ret.unshift('-')

	const str = ret.join('')
	// let rc = num2strCache.get(radix)
	// if (!rc) {
	// 	num2strCache.set(radix, rc = new Map())
	// }
	// rc.set(num, str)
	return str
}

export function str2num(str: string, radix: Radix): bigint {
	if (str === radix.reversedValues.get(0n)) return 0n

	const neg = str.startsWith('-')
	const s = neg ? str.slice(1) : str

	const { radix: rad, values } = radix
	const sum = radix.system === 'sum'
	const balsum = radix.system === 'balsum'
	let v: bigint | undefined
	const ret = Array.from(s).reduce((acc, c) => {
		if (c === '…') return acc
		v = values.get(c)
		if (v == null) throw new Error(`Non-Base character encountered: "${c}". ${allowedCharaters(radix)}`)
		return sum || balsum ? acc + v : acc * rad + v
	}, 0n)

	return neg ? -ret : ret
}

export function filling_shl(value: bigint, radix: Radix): bigint {
	return value ? value > 0 ? value * radix.radix + 1n : value * radix.radix - 1n : 1n
}

export function shl(value: bigint, radix: Radix): bigint {
	return value * radix.radix
}

export function shr(value: bigint, radix: Radix): bigint {
	return radix.system === 'sum' ? str2num(num2str(value, radix).slice(1), radix) : str2num(num2str(value, radix).slice(0, -1), radix)
}

export function allowedCharaters(radix: Radix): string {
	const chars = radix.system === 'bijective' ? radix.chars.slice(1) : radix.chars
	return  `Allowed characters are "${radix.system === 'balanced' ? chars.join('') : [ '-', ...chars ].join('')}"`
}

export function sanitizeInput(input: string, radix: Radix): string[] {
	input = input.toUpperCase()
	const chars = radix.system === 'balanced' ? radix.chars.join('') : [ '-', ...radix.chars ].join('')
	const sanitizedInput = input.replaceAll(new RegExp(`[^${chars}]`, 'g'), '')
	const rest = input.replaceAll(new RegExp(`[${chars}]`, 'g'), '')
	return [ sanitizedInput, rest ]
}

export function getCharsForTooltip(radix: Radix): string {
	return Array.from(radix.values.entries()).slice(radix.system === 'sum' || radix.system === 'bijective' ? 1 : 0).map(([k, v], i) => `${k}:${v}${(i+1) % (radix.system === 'sum' ? 9 : 10) === 0 ? '\n': ' '}`).join('')
}
