import { describe, test } from "node:test"
import { strictEqual } from 'node:assert'

import { Radix, createRadix, num2str, str2num } from './utils'


type Tests = {
    radix: Radix
    pairs: [ bigint, string ][]
}[]

const tests: Tests = [{
	radix: createRadix(9),
	pairs: [
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
		[ 80n, '88' ],
	]
}, {
	radix: createRadix(9, 'bijective'),
	pairs: [
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
		[ 90n, '99' ],
	]
}, {
	radix: createRadix(9, 'balanced'),
	pairs: [
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
}, {
	radix: createRadix(10),
	pairs: [
		[ -99n, '-99' ],
		[ -90n, '-90' ],
		[ -10n, '-10' ],
		[ -9n, '-9' ],
		[ -1n, '-1' ],
		[ 0n, '0' ],
		[ 1n, '1' ],
		[ 9n, '9' ],
		[ 10n, '10' ],
		[ 90n, '90' ],
		[ 99n, '99' ],
	]
}, {
	radix: createRadix(10, 'bijective'),
	pairs: [
		[ -110n, '-AA' ],
		[ -101n, '-A1' ],
		[ -11n, '-11' ],
		[ -10n, '-A' ],
		[ -1n, '-1' ],
		[ 0n, '0' ],
		[ 1n, '1' ],
		[ 10n, 'A' ],
		[ 11n, '11' ],
		[ 101n, 'A1' ],
		[ 110n, 'AA' ],
	]
}, {
	radix: createRadix(12),
	pairs: [
		[ -143n, '-BB' ],
		[ -132n, '-B0' ],
		[ -12n, '-10' ],
		[ -11n, '-B' ],
		[ -1n, '-1' ],
		[ 0n, '0' ],
		[ 1n, '1' ],
		[ 11n, 'B' ],
		[ 12n, '10' ],
		[ 132n, 'B0' ],
		[ 143n, 'BB' ],
	]
}, {
	radix: createRadix(19, 'balanced'),
	pairs: [
		[ -180n, '❾❾' ],
		[ -162n, '❾9' ],
		[ -10n, '❶9' ],
		[ -9n, '❾' ],
		[ -1n, '❶' ],
		[ 0n, '0' ],
		[ 1n, '1' ],
		[ 9n, '9' ],
		[ 10n, '1❾' ],
		[ 162n, '9❾' ],
		[ 180n, '99' ],
	]
}, {
	radix: createRadix(26, 'bijective'),
	pairs: [
		[ -702n, '-ZZ' ],
		[ -677n, '-ZA' ],
		[ -27n, '-AA' ],
		[ -26n, '-Z' ],
		[ -1n, '-A' ],
		[ 0n, '0' ],
		[ 1n, 'A' ],
		[ 26n, 'Z' ],
		[ 27n, 'AA' ],
		[ 677n, 'ZA' ],
		[ 702n, 'ZZ' ],
	]
}, {
	radix: createRadix(27),
	pairs: [
		[ -728n, '-ZZ' ],
		[ -702n, '-Z0' ],
		[ -27n, '-A0' ],
		[ -26n, '-Z' ],
		[ -1n, '-A' ],
		[ 0n, '0' ],
		[ 1n, 'A' ],
		[ 26n, 'Z' ],
		[ 27n, 'A0' ],
		[ 702n, 'Z0' ],
		[ 728n, 'ZZ' ],
	]
}, {
	radix: createRadix(27, 'balanced'),
	pairs: [
		[ -364n, 'AA' ],
		[ -338n, 'AZ' ],
		[ -14n, 'MZ' ],
		[ -13n, 'A' ],
		[ -1n, 'M' ],
		[ 0n, '0' ],
		[ 1n, 'N' ],
		[ 13n, 'Z' ],
		[ 14n, 'NA' ],
		[ 338n, 'ZA' ],
		[ 364n, 'ZZ' ],
	]
}]

describe('num2str', () => {
	tests.forEach(t => test(t.radix.name, () => t.pairs.forEach(([ n, s ]) => strictEqual(num2str(n, t.radix), s)) ))
})

describe('str2num', () => {
	tests.forEach(t => test(t.radix.name, () => t.pairs.forEach(([ n, s ]) => strictEqual(str2num(s, t.radix), n)) ))
})
