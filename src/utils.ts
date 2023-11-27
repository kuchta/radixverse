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
export const defaultCharsArray = str2arr(defaultChars)

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
	if (!item) {
		return
	}

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

export function str2arr(s: string): string[]
export function str2arr(s: string | undefined): string[] | undefined
export function str2arr(s: string | undefined): string[] | undefined {
	return s ? [...new Intl.Segmenter().segment(s)].map(s => s.segment) : undefined
}

export function createRadixes(chars = defaultCharsArray) {
	return [ ...Array(35) ].flatMap((_, i) => {
		const radix = i + 2
		const ret = [ createRadix(radix, 'standard', chars) ]
		if (radix < 36) ret.push(createRadix(radix, 'bijective', chars))
		if (radix & 1) ret.push(createRadix(radix, 'balanced', chars))
		// if (radix % 2 === 0) ret.push(createRadix(radix, 'my', chars))
		return ret
	})
}

export function updateRadixes(radixes: Radix[], chars = defaultCharsArray) {
	return radixes.map(r => createRadix(Number(r.radix), r.system, chars, r.enabled, r.name))
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
			chars: radix === 27 && chars === defaultCharsArray ? str2arr(base27) : chars.slice(zeroAt, zeroAt + radix),
			zeroAt: 0,
			low: 0,
			high: radix - 1,
			enabled: enabled != undefined ? enabled : [ 2, 3, 6, 9, 10, 12, 27 ].includes(radix)
		}
	} else if (system === 'bijective') {
		if (chars.length === radix + 1) zeroAt = 0
		ret = {
			name: name ?? `bij-${radix}`,
			system: 'bijective',
			radix: BigInt(radix),
			chars: radix === 26 && chars === defaultCharsArray ? str2arr(bijBase26) : chars.slice(zeroAt, zeroAt + radix + 1),
			zeroAt: 0,
			low: 1,
			high: radix,
			enabled: enabled != undefined ? enabled : [ 9, 26 ].includes(radix),
		}
	} else if (system === 'balanced') {
		const half = (radix - 1) / 2
		ret = {
			name: name ?? `bal-${radix}`,
			system: 'balanced',
			radix: BigInt(radix),
			chars: radix === 27 && chars === defaultCharsArray ? str2arr(balBase27) : chars.slice(zeroAt - half, zeroAt + half + 1),
			zeroAt: half,
			low: -half,
			high: half,
			enabled: enabled != undefined ? enabled : [ 3, 9, 19, 27 ].includes(radix),
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
	if (num === 0n) {
		return radix.chars[radix.zeroAt]
	}

	const neg = num < 0n
	let n = neg ? -num : num

	const bij = radix.system === 'bijective'
	const my = radix.system === 'my'
	const bal = radix.system === 'balanced'
	const r = radix.radix
	const rh = BigInt(radix.high)
	const za = BigInt(radix.zeroAt)

	const ret: string[] = []
	let d: bigint
	while (n > 0n) {
		d = n % r
		if (bij) {
			const q = d === 0n ? n / r - 1n : n / r
			d = n - q * r
			n = q
		} else {
			if (bal || my) {
				if (d > rh || my && neg && d === rh) {
					d -= r
					n += rh
				}
				if (neg) d = -d
				d = za + d
			}
			n /= r
		}
		ret.unshift(radix.chars[Number(d)])
	}

	if (neg && !(bal || my))
		ret.unshift('-')

	return ret.join('')
}

export function str2num(str: string, radix: Radix): bigint {
	if (str === radix.chars[radix.zeroAt]) {
		return 0n
	}

	const neg = str.startsWith('-')
	const s = neg ? str.slice(1) : str
	const bij = radix.system === 'bijective'
	const bal = radix.system === 'balanced' || radix.system === 'my'
	const r = radix.radix
	const chars = radix.chars
	const low = radix.low

	const n = Array.from(s).reduce((acc, d) => {
		const v = chars.indexOf(d)
		if (v < (bij ? 1 : 0)) throw new Error(`Non-Base character encountered: "${d}". ${allowedCharaters(radix)}`)
		return acc * r + BigInt((bal ? low : 0) + v)
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
