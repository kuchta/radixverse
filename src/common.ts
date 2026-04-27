import { createContext } from 'react'
import { z } from 'zod'

import { createRadix, type Radix } from './radixes.ts'
import { getErrorMessage } from 'react-error-boundary'


export const LS_CHARS = 'chars'
export const LS_RADIXES = 'radixes'

const ExportRadixes = z.array(z.object({
	name: z.string(),
	radix: z.number(),
	system: z.enum([ 'standard', 'bijective', 'balanced', 'clock', 'sum', 'balsum' ]),
	chars: z.string(),
	enabled: z.boolean(),
}))

export const AppContext = createContext<{ updateError: (error: unknown) => void }>({ updateError: () => {} })

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
		'\t',
	)
}

export function unserializeRadixes(content: string): Radix[] {
	try {
		const radixes = ExportRadixes.parse(JSON.parse(content), { reportInput: true })
		return radixes.map(r => createRadix(r.radix, r.system, r.chars, r.enabled, r.name, false))
	} catch (error) {
		if (error instanceof z.ZodError) throw new Error(`Error validating input file:\n\n${z.prettifyError(error)}`, { cause: error })
		throw new Error(`Error parsing input file:\n\n${getErrorMessage(error)}`, { cause: error })
	}
}
