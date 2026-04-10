import { createContext } from 'react'
import { createRadix, type Radix } from "./utils.ts"


export const LS_CHARS = 'chars'
export const LS_RADIXES = 'radixes'

export const AppContext = createContext<{ updateError: (error: unknown) => void }>({ updateError: () => undefined })

export function getCharsLS(): string | undefined {
	return localStorage.getItem(LS_CHARS) ?? undefined
}

export function sanitizeInput(input: string, radix: Radix): string[] {
	input = input.toUpperCase()
	const chars = radix.system === 'balanced' ? radix.chars : `-${radix.chars}`
	const sanitizedInput = input.replaceAll(new RegExp(`[^${chars}]`, 'g'), '')
	const rest = input.replaceAll(new RegExp(`[${chars}]`, 'g'), '')
	return [ sanitizedInput, rest ]
}

export function serializeRadixes(radixes: Radix[]) {
	return JSON.stringify(
		radixes.map(r => ({ name: r.name, radix: Number(r.radix), system: r.system, chars: r.chars, enabled: r.enabled })),
		undefined,
		'\t'
	)
}

export function unserializeRadixes(content: string): Radix[] {
	const radixes = JSON.parse(content) as Radix[]
	return radixes.map(r => createRadix(r.radix as unknown as number, r.system, r.chars, r.enabled, r.name, false))
}
