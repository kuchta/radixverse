import { describe, test } from 'node:test'
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
	radix: createRadix(10, 'sum'),
	pairs: [
		[ 0n, '0' ],
		[ 1n, 'A' ],
		[ 2n, 'B' ],
		[ 3n, 'C' ],
		[ 4n, 'D' ],
		[ 5n, 'E' ],
		[ 6n, 'F' ],
		[ 7n, 'G' ],
		[ 8n, 'H' ],
		[ 9n, 'I' ],
		[ 10n, 'J' ],
		[ 11n, 'JA' ],
		[ 19n, 'JI' ],
		[ 20n, 'K' ],
		[ 21n, 'KA' ],
		[ 28n, 'KH' ],
		[ 29n, 'KI' ],
		[ 30n, 'L' ],
		[ 31n, 'LA' ],
		[ 37n, 'LG' ],
		[ 39n, 'LI' ],
		[ 40n, 'M' ],
		[ 41n, 'MA' ],
		[ 46n, 'MF', ],
		[ 49n, 'MI' ],
		[ 50n, 'N' ],
		[ 51n, 'NA' ],
		[ 55n, 'NE' ],
		[ 59n, 'NI' ],
		[ 60n, 'O' ],
		[ 61n, 'OA' ],
		[ 64n, 'OD' ],
		[ 69n, 'OI' ],
		[ 70n, 'P' ],
		[ 71n, 'PA' ],
		[ 73n, 'PC' ],
		[ 79n, 'PI' ],
		[ 80n, 'Q' ],
		[ 81n, 'QA' ],
		[ 82n, 'QB' ],
		[ 89n, 'QI' ],
		[ 90n, 'R' ],
		[ 91n, 'RA' ],
		[ 99n, 'RI' ],
		[ 100n, 'S' ],
		[ 101n, 'SA' ],
		[ 109n, 'SI' ],
		[ 199n, 'SRI' ],
		[ 200n, 'T' ],
		[ 201n, 'TA' ],
		[ 299n, 'TRI' ],
		[ 300n, 'U' ],
		[ 301n, 'UA' ],
		[ 399n, 'URI' ],
		[ 400n, 'V' ],
		[ 401n, 'VA' ],
		[ 409n, 'VI' ],
		[ 499n, 'VRI' ],
		[ 500n, 'W' ],
		[ 501n, 'WA' ],
		[ 509n, 'WI' ],
		[ 599n, 'WRI' ],
		[ 600n, 'X' ],
		[ 601n, 'XA' ],
		[ 609n, 'XI' ],
		[ 699n, 'XRI' ],
		[ 700n, 'Y' ],
		[ 701n, 'YA' ],
		[ 709n, 'YI' ],
		[ 799n, 'YRI' ],
		[ 800n, 'Z' ],
		[ 801n, 'ZA' ],
		[ 809n, 'ZI' ],
		[ 899n, 'ZRI' ],
		[ 900n, 'ZS' ],
		[ 901n, 'ZSA' ],
		[ 999n, 'ZSRI' ],
		[ 1000n, 'ZT' ],
		[ 1001n, 'ZTA' ],
		[ 1234n, 'ZVLD' ],
		[ 1567n, 'ZYOG' ],
		[ 2345n, 'ZZYME' ],
		[ 3894n, 'ZZZZXRD' ],
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
	tests.forEach(t => test(`num2str(${t.radix.name})`, () => t.pairs.forEach(([ n, s ]) => strictEqual(num2str(n, t.radix), s)) ))
})

describe('str2num', () => {
	tests.forEach(t => test(`str2num(${t.radix.name})`, () => t.pairs.forEach(([ n, s ]) => strictEqual(str2num(s, t.radix), n)) ))
})
