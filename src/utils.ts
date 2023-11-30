const zero = '0'
const base9 = '123456789'
const base10 = zero + base9
const baseMinus9 = '❾❽❼❻❺❹❸❷❶'
const base26 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const bijBase26 = zero + base26
const baseMinus26 = '🅩🅨🅧🅦🅥🅤🅣🅢🅡🅠🅟🅞🅝🅜🅛🅚🅙🅘🅗🅖🅕🅔🅓🅒🅑🅐'
const base27 = zero + base26
const balBase27 = 'ABCDEFGHIJKLM' + zero + 'NOPQRSTUVWXYZ'
// const base36 = base10 + base26
const balBase36 = baseMinus26 + baseMinus9 + base10 + base26
// const base36cz = 'AÁBCČDĎEÉFGHIÍJKLMNŇOÓPQRŘSŠTŤUÚVXZŽ'
// const base42 = [ ' ', 'A', 'Á', 'B', 'C', 'Č', 'D', 'Ď', 'E', 'É', 'Ě', 'F', 'G', 'H', 'Ch', 'I', 'Í', 'J', 'K', 'L', 'M', 'N', 'Ň', 'O', 'Ó', 'P', 'Q', 'R', 'Ř', 'S', 'Š', 'T', 'Ť', 'U', 'Ú', 'Ů', 'V', 'W', 'X', 'Y', 'Ý', 'Z', 'Ž' ]

const LS_THEME = 'theme'
const LS_CHARS = 'chars'
const LS_RADIXES = 'radixes'

export const defaultChars = balBase36
export const defaultCharsArray = Array.from(defaultChars)

export type Radix = {
	name: string
	system: 'standard' | 'bijective' | 'balanced' | 'my'
	radix: bigint
	chars: string[]
	zeroAt: number
	low: number
	high: number
	enabled: boolean
}

export function getThemeLS() {
	return localStorage.getItem(LS_THEME) ?? undefined
}

export function setThemeLS(theme: string) {
	document.documentElement.setAttribute('data-theme', theme)
	localStorage.setItem(LS_THEME, theme)
}

export function getCharsLS() {
	return localStorage.getItem(LS_CHARS) ?? undefined
}

export function setCharsLS(chars?: string) {
	if (chars) {
		localStorage.setItem(LS_CHARS, chars)
	} else {
		localStorage.removeItem(LS_CHARS)
	}
}

export function getRadixesLS() {
	const item = localStorage.getItem(LS_RADIXES)
	if (item == null) return

	const radixes = JSON.parse(item) as Radix[]
	return radixes.map(r => createRadix(r.radix as unknown as number, r.system, r.chars, r.enabled, r.name))
}

export function setRadixesLS(radixes: Radix[]) {
	const rs = radixes.map(r => ({ name: r.name, radix: Number(r.radix), system: r.system, chars: r.chars, enabled: r.enabled }))
	localStorage.setItem(LS_RADIXES, JSON.stringify(rs))
}

export function areRadixesEqual({ radixes: oldRadixes }: { radixes: Radix[] }, { radixes: newRadixes}: { radixes: Radix[] }) {
	const ret = oldRadixes.length === newRadixes.length
		&& oldRadixes.every((radix, i) => radix.name === newRadixes[i].name
			&& radix.chars.every((char, j) => char === newRadixes[i].chars[j]))
	// console.log(`areRadixesEqual(${tab}):`, ret)
	return ret
}

export function createRadixes(chars = defaultChars) {
	const charsArray = chars !== defaultChars ? Array.from(chars) : undefined
	return Array.from(Array(35)).flatMap((_, i) => {
		const radix = i + 2
		const ret = [ createRadix(radix, 'standard', charsArray) ]
		if (radix < 36) ret.push(createRadix(radix, 'bijective', charsArray))
		if (radix & 1) ret.push(createRadix(radix, 'balanced', charsArray))
		// if (radix % 2 === 0) ret.push(createRadix(radix, 'my', chars))
		return ret
	})
}

export function createRadix(radix: number, system: Radix["system"] = "standard", chars = defaultCharsArray, enabled?: boolean, name?: string) {
	if (radix < 0 || radix > (system === 'standard' || system === 'my' ? 36 : 35)) throw new Error(`getRadix: Radix(${system}) of out range: ${radix}`)
	if (system === 'balanced' && radix % 2 === 0) throw new Error(`getRadix: Radix(${system}) must be odd: ${radix}`)
	if (system === 'my' && radix % 2 !== 0) throw new Error(`getRadix: Radix(${system}) must be even: ${radix}`)

	let ret: Radix
	let zeroAt = Math.trunc(chars.length / 2)

	if (system === 'standard') {
		if (chars.length === radix) zeroAt = 0
		ret = {
			name: name ?? `${radix}`,
			system: 'standard',
			radix: BigInt(radix),
			chars: radix === 27 && chars === defaultCharsArray ? Array.from(base27) : chars.slice(zeroAt, zeroAt + radix),
			zeroAt: 0,
			low: 0,
			high: radix - 1,
			enabled: enabled != undefined ? enabled : [ 2, 10, 12, 27 ].includes(radix)
		}
	} else if (system === 'bijective') {
		if (chars.length === radix + 1) zeroAt = 0
		ret = {
			name: name ?? `bij-${radix}`,
			system: 'bijective',
			radix: BigInt(radix),
			chars: radix === 26 && chars === defaultCharsArray ? Array.from(bijBase26) : chars.slice(zeroAt, zeroAt + radix + 1),
			zeroAt: 0,
			low: 1,
			high: radix,
			enabled: enabled != undefined ? enabled : [ 26 ].includes(radix),
		}
	} else if (system === 'balanced') {
		const half = (radix - 1) / 2
		ret = {
			name: name ?? `bal-${radix}`,
			system: 'balanced',
			radix: BigInt(radix),
			chars: radix === 27 && chars === defaultCharsArray ? Array.from(balBase27) : chars.slice(zeroAt - half, zeroAt + half + 1),
			zeroAt: half,
			low: -half,
			high: half,
			enabled: enabled != undefined ? enabled : [ 3, 19, 27 ].includes(radix),
		}
	} else if (system === 'my') {
		if (chars.length === radix) zeroAt -= 1
		const half = radix / 2
		ret = {
			name: name ?? `my-${radix}`,
			system: 'my',
			radix: BigInt(radix),
			chars: chars.slice(zeroAt - half + 1, zeroAt + half + 1),
			zeroAt: half - 1,
			low: -half + 1,
			high: half,
			enabled: enabled != undefined ? enabled : [ 2, 4, 6, 8, 10, 12, 16, 18, 20, 22, 24, 30, 36 ].includes(radix),
		}
	} else {
		throw new Error('createRadix: Unknown system:', system)
	}

	return ret
}

export function num2str(num: bigint, radix: Radix): string {
	if (num === 0n) return radix.chars[radix.zeroAt]

	const { radix: rad, system } = radix
	const bij = system === 'bijective'
	const bal = system === 'balanced'
	const my = system === 'my'
	const high = BigInt(radix.high)
	const zeroAt = BigInt(radix.zeroAt)

	const neg = num < 0n
	let n = neg ? -num : num

	const ret: string[] = []
	let d: bigint
	while (n > 0n) {
		d = n % rad
		if (bij) {
			const q = d === 0n ? n / rad - 1n : n / rad
			d = n - q * rad
			n = q
		} else {
			if (bal || my) {
				if (d > high || my && neg && d === high) {
					d -= rad
					n += high
				}
				if (neg) d = -d
				d = zeroAt + d
			}
			n /= rad
		}
		ret.unshift(radix.chars[Number(d)])
	}

	if (neg && !(bal || my))
		ret.unshift('-')

	return ret.join('')
}

export function str2num(str: string, radix: Radix): bigint {
	if (str === radix.chars[radix.zeroAt]) return 0n

	const { radix: rad, system, chars, low } = radix
	const bij = system === 'bijective'
	const bal = system === 'balanced' || system === 'my'
	const neg = str.startsWith('-')
	const s = neg ? str.slice(1) : str

	let v
	const n = Array.from(s).reduce((acc, c) => {
		v = chars.indexOf(c)
		if (v < (bij ? 1 : 0)) throw new Error(`Non-Base character encountered: "${c}". ${allowedCharaters(radix)}`)
		return acc * rad + BigInt((bal ? low : 0) + v)
	}, 0n)

	return neg ? -n : n
}

export function filling_shl(value: bigint, radix: Radix) {
	return value ? value > 0 ? value * radix.radix + 1n : value * radix.radix - 1n : 1n
}

export function shl(value: bigint, radix: Radix) {
	return value * radix.radix
}

export function shr(value: bigint, radix: Radix) {
	return str2num(num2str(value, radix).slice(0, -1), radix)
}

export function allowedCharaters(radix: Radix) {
	const chars = radix.system === 'bijective' ? radix.chars.slice(1) : radix.chars
	return  `Allowed characters are "${radix.system === 'balanced' ? chars.join('') : [ '-', ...chars ].join('')}"`
}

export function sanitizeInput(input: string, radix: Radix) {
	input = input.toUpperCase()
	const chars = radix.system === 'balanced' ? radix.chars.join('') : [ '-', ...radix.chars ].join('')
	const sanitizedInput = input.replaceAll(new RegExp(`[^${chars}]`, 'g'), '')
	const rest = input.replaceAll(new RegExp(`[${chars}]`, 'g'), '')
	return [ sanitizedInput, rest ]
}

export function sumDigits(number: string, radix: Radix, level = 0) {
	let ret = ''
	if (number.startsWith('-')) {
		number = number.slice(1)
		ret += '-'
	}
	const n = Array.from(number).reduce((a, n) => a + str2num(n, radix), 0n)
	const s = num2str(n, radix)
	ret += `${s}(${num2str(n, createRadix(10))})`
	if (Array.from(s).length > 1) {
		ret += sumDigits(s, radix, level+1)
	}

	return level > 0 ? `=${ret}` : `∑=${ret}`
}
