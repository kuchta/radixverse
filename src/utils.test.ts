import { describe, it } from 'node:test'
import { strictEqual } from 'node:assert';

import { radixes, num2str, str2num } from './utils'


const radix9 = radixes.find(r => r.name === '9')!
const radixBij9 = radixes.find(r => r.name === 'bij9')!
const radixBal9 = radixes.find(r => r.name === 'bal9')!

type Pair = [ bigint, string ]

const radix9Pairs: Pair[] = [
	[ -80n, '-88' ],
	[ -40n, '-44' ],
	[ -9n, '-10' ],
	[ -8n, '-8' ],
	[ -1n, '-1' ],
	[ 0n, '0' ],
	[ 1n, '1' ],
	[ 8n, '8' ],
	[ 9n, '10' ],
	[ 40n, '44' ],
	[ 80n, '88' ]
]

const radixBij9Pairs: Pair[] = [
	[ -90n, '-99' ],
	[ -50n, '-55' ],
	[ -10n, '-11' ],
	[ -9n, '-9' ],
	[ -1n, '-1' ],
	[ 0n, '0' ],
	[ 1n, '1' ],
	[ 9n, '9' ],
	[ 10n, '11' ],
	[ -50n, '-55' ],
	[ 90n, '99' ]
]

const radixBal9Pairs: Pair[] = [
	[ -40n, '❹❹' ],
	[ -18n, '❷0' ],
	[ -5n, '❶4' ],
	[ -4n, '❹' ],
	[ -1n, '❶' ],
	[ 0n, '0' ],
	[ 1n, '1' ],
	[ 4n, '4' ],
	[ 5n, '1❹' ],
	[ 18n, '20' ],
	[ 40n, '44' ],
]

describe('num2str', () => {
	it('standard', () => radix9Pairs.forEach(([ n, s ]) => strictEqual(num2str(n, radix9), s)) )
	it('bijective', () => radixBij9Pairs.forEach(([ n, s ]) => strictEqual(num2str(n, radixBij9), s)) )
	it('balanced', () => radixBal9Pairs.forEach(([ n, s ]) => strictEqual(num2str(n, radixBal9), s)) )
})

describe('str2num', () => {
	it('standard', () => radix9Pairs.forEach(([ n, s ]) => strictEqual(str2num(s, radix9), n)) )
	it('bijective', () => radixBij9Pairs.forEach(([ n, s ]) => strictEqual(str2num(s, radixBij9), n)) )
	it('balanced', () => radixBal9Pairs.forEach(([ n, s ]) => strictEqual(str2num(s, radixBal9), n)) )
})
