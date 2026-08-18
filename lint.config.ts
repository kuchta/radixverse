import type { ITtscLintConfig } from '@ttsc/lint'

export default {
	// format: {
	// 	printWidth: 100,
	// 	singleQuote: true,
	// 	trailingComma: 'all',
	// },
	rules: {
		'no-var': 'error',
		'prefer-const': 'error',
		'typescript/no-explicit-any': 'error',
		'typescript/no-floating-promises': 'error',
	},
} satisfies ITtscLintConfig
