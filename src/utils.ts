export type Radix = {
	name: string
	system: "standard" | "bijective" | "balanced"
	radix: bigint
	digits: string
	low: number
	high: number
	enabled: boolean
}

const zero = '0'
const base9 = '123456789'
const base10 = zero + base9
const balBase19 = '❾❽❼❻❺❹❸❷❶' + base10
const base26 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const base27 = zero + base26
const bijBase26 = zero + base26
const belBase27 = 'ABCDEFGHIJKLM' + zero + 'NOPQRSTUVWXYZ'
const base36 = base10 + base26
// const base36cz = 'AÁBCČDĎEÉFGHIÍJKLMNŇOÓPQRŘSŠTŤUÚVXZŽ'
// const base42 = [ ' ', 'A', 'Á', 'B', 'C', 'Č', 'D', 'Ď', 'E', 'É', 'Ě', 'F', 'G', 'H', 'Ch', 'I', 'Í', 'J', 'K', 'L', 'M', 'N', 'Ň', 'O', 'Ó', 'P', 'Q', 'R', 'Ř', 'S', 'Š', 'T', 'Ť', 'U', 'Ú', 'Ů', 'V', 'W', 'X', 'Y', 'Ý', 'Z', 'Ž' ]


export const radixes = [ ...Array(35) ].flatMap((_, i) => {
	const v = i + 2
	const radix = BigInt(v)
	const ret: Radix[] = [{
		name: `${v}`,
		system: "standard",
		radix,
		digits: v === 27 ? base27 : base36.slice(0, v),
		low: 0,
		high: v - 1,
		enabled: [ 2, 3, 9, 10, 12, 27 ].includes(v)
	}]
	if (v < 36) ret.push({
		name: `bij${v}`,
		system: "bijective",
		radix,
		digits: v === 26 ? bijBase26 : base36.slice(0, v + 1),
		low: 1,
		high: v,
		enabled: [ 9, 10, 26 ].includes(v),
	})
	if (v & 1 && (v <= 19 || v === 27)) {
		const half = (v - 1) / 2
		ret.push({
			name: `bal${v}`,
			system: "balanced",
			radix,
			digits: v === 27 ? belBase27 : balBase19.slice(9 - half, 10 + half),
			low: -half,
			high: half,
			enabled:  [ 3, 9, 19, 27 ].includes(v),
		})
	}
	return ret
})

export function areRadixesEqual({ radixes: oldRadixes }: { radixes: Radix[] }, { tab, radixes: newRadixes }: { tab: string, radixes: Radix[] }) {
	const ret = oldRadixes.length === newRadixes.length && oldRadixes.every((radix, i) => radix.name === newRadixes[i].name)
	// console.log(`areRadixesEqual(${tab}): `, ret)
	return ret
}

export function num2str(num: bigint, radix: Radix): string {
	if (num === 0n) {
		return radix.digits[radix.system === 'balanced' ? radix.high : 0]
	}

	const neg = num < 0n
	let n = neg ? -num : num

	const bij = radix.system === 'bijective'
	const bal = radix.system === 'balanced'
	const r = radix.radix

	const ret: string[] = []
	let d: number
	while (n > 0n) {
		if (bij) {
			const q = n % r === 0n ? n / r - 1n : n / r
			d = Number(n - q * r)
			n = q
		} else {
			d = Number(n % r)
			if (bal) {
				if (d > radix.high) {
					d -= Number(r)
					n += BigInt(radix.high)
				}
				if (neg) d = -d
				d += radix.high
			}
			n /= r
		}
		ret.unshift(radix.digits[d])
	}

	if (neg && !bal)
		ret.unshift('-')

	return ret.join('')
}

export function str2num(str: string, radix: Radix): bigint {
	if (str === '0') {
		return 0n
	}

	const neg = str.startsWith('-')
	const s = neg ? str.slice(1) : str
	const digits = radix.digits
	const bal = radix.system === 'balanced'
	const bij = radix.system === 'bijective'
	const low = radix.low
	const r = radix.radix

	const n = Array.from(s).reduce((acc, d) => {
		const v = digits.indexOf(d)
		if (v < (bij ? 1 : 0)) throw new Error(`str2num(${str}, ${radix.digits}): Unrecognized digit character: ${d}`)
		acc = acc * r + BigInt((bal ? low : 0) + v)
		return acc
	}, 0n)

	return neg ? -n : n
}
