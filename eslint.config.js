import eslint from '@eslint/js'
import tslint from 'typescript-eslint'
import stylistic from '@stylistic/eslint-plugin'
import globals from 'globals'
import reactConfig from 'eslint-config-react-app'
import importPlugin from 'eslint-plugin-import'
import flowtypePlugin from 'eslint-plugin-flowtype'
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import reactCompilerPlugin from 'eslint-plugin-react-compiler'


export default tslint.config({
	files: ['**/*.{js,jsx}'],
	extends: [ eslint.configs.recommended ],
}, {
	files: ['**/*.{js,jsx,ts,tsx}'],
	extends: [
		eslint.configs.recommended,
		...tslint.configs.recommended,
	],
	plugins: {
		'@typescript-eslint': tslint.plugin,
		'@stylistic': stylistic,
		import: importPlugin,
		flowtype: flowtypePlugin,
		'jsx-a11y': jsxA11yPlugin,
		react: reactPlugin,
		'react-hooks': reactHooksPlugin,
		'react-compiler': reactCompilerPlugin,
	},
	languageOptions: {
		parser: tslint.parser,
		parserOptions: {
			project: true,
		},
		globals: {
			...globals.browser,
			JSX: 'readonly'
		}
	},
	settings: {
		react: {
		  version: 'detect'
		}
	},
	rules: {
		...reactConfig.overrides.rules,
		...reactConfig.rules,
		semi: [ 'error', 'never' ],
		'no-mixed-spaces-and-tabs': [ 'error', 'smart-tabs' ],
		eqeqeq: ['error', 'always', { null: 'ignore' }],
		'default-case': 'off',
		'no-cond-assign': 'off',
		'no-mixed-operators': 'off',
		'import/no-anonymous-default-export': 'off',
		'@stylistic/quotes': [ 'warn', 'single' ],
		'@stylistic/jsx-quotes': [ 'warn', 'prefer-double' ],
		'@typescript-eslint/no-unsafe-argument': 'error',
		'@typescript-eslint/no-unsafe-assignment': 'error',
		'@typescript-eslint/no-unsafe-call': 'error',
		'@typescript-eslint/no-unsafe-member-access': 'error',
		'@typescript-eslint/no-unsafe-return': 'error',
	}
})
