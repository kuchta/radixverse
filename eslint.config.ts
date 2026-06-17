import { defineConfig, globalIgnores } from 'eslint/config'
import js from '@eslint/js'
import css from '@eslint/css'
import globals from 'globals'
import tslint from 'typescript-eslint'
import stylisticPlugin from '@stylistic/eslint-plugin'
// import importPlugin from 'eslint-plugin-import'
// import reactPlugin from 'eslint-plugin-react'
// import reactHooksPlugin from 'eslint-plugin-react-hooks'
import reactPlugin from '@eslint-react/eslint-plugin'
import { tailwind4 } from 'tailwind-csstree'


export default defineConfig(
	globalIgnores([ '.history/**', 'dist/**', 'dev-dist/**', 'deno-deploy-serve.ts' ]),
	{	linterOptions: { reportUnusedDisableDirectives: 'error' } },
	{
		files: [ '**/*.{ts,tsx}' ],
		languageOptions: {
			parser: tslint.parser,
			parserOptions: {
				projectService: true,
			},
			globals: {
				...globals.browser,
				JSX: 'readonly',
			}
		},
		settings: {
			react: { version: 'detect' },
		},
		extends: [
			js.configs.recommended,
			tslint.configs.recommended,
			tslint.configs.recommendedTypeChecked,
			stylisticPlugin.configs.recommended,
			// importPlugin.flatConfigs.recommended,
			// reactPlugin.configs.flat.recommended,
			// reactHooksPlugin.configs.flat.recommended,
			reactPlugin.configs['disable-conflict-eslint-plugin-react-hooks'],
			reactPlugin.configs['strict-type-checked'],
		],
		rules: {
			'semi': [ 'error', 'never' ],
			'no-mixed-spaces-and-tabs': [ 'error', 'smart-tabs' ],
			'eqeqeq': 'off',
			'default-case': 'off',
			'no-cond-assign': 'off',
			'no-mixed-operators': 'off',
			'import/no-anonymous-default-export': 'off',
			'@stylistic/array-bracket-spacing': [ 'error', 'always', { objectsInArrays: false, arraysInArrays: false }],
			'@stylistic/arrow-parens': [ 'error', 'as-needed' ],
			'@stylistic/brace-style': [ 'error', '1tbs', { allowSingleLine: true }],
			'@stylistic/comma-dangle': 'off',
			'@stylistic/indent': [ 'warn', 'tab', {
				offsetTernaryExpressions: true,
				ignoredNodes: [ 'JSXExpressionContainer *' ],
			}],
			'@stylistic/indent-binary-ops': 'off',
			'@stylistic/jsx-closing-tag-location': [ 'warn', 'line-aligned' ],
			'@stylistic/jsx-indent-props': [ 'error', 'tab' ],
			'@stylistic/jsx-one-expression-per-line': 'off',
			'@stylistic/jsx-quotes': [ 'warn', 'prefer-double' ],
			'@stylistic/jsx-tag-spacing': [ 'error', {
				closingSlash: 'never',
				beforeSelfClosing: 'never',
				afterOpening: 'never',
				beforeClosing: 'never'
			}],
			'@stylistic/jsx-wrap-multilines': [ 'error', {
				return: 'parens',
				arrow: 'ignore',
			}],
			'@stylistic/max-statements-per-line': 'off',
			'@stylistic/member-delimiter-style': [ 'error', {
				multiline: {
					delimiter: 'comma',
					requireLast: true,
				},
				singleline: {
					delimiter: 'comma',
					requireLast: false,
				},
				multilineDetection: 'brackets',
			}],
			'@stylistic/multiline-ternary': 'off',
			'@stylistic/no-mixed-operators': 'off',
			'@stylistic/no-mixed-spaces-and-tabs': [ 'warn', 'smart-tabs' ],
			'@stylistic/no-multiple-empty-lines': [ 'error', { max: 2 }],
			'@stylistic/no-tabs': 'off',
			'@stylistic/operator-linebreak': 'off',
			'@stylistic/quotes': [ 'warn', 'single' ],
			'@typescript-eslint/no-misused-promises': 'warn',
			'@typescript-eslint/no-unsafe-argument': 'error',
			'@typescript-eslint/no-unsafe-assignment': 'error',
			'@typescript-eslint/no-unsafe-call': 'error',
			'@typescript-eslint/no-unsafe-member-access': 'error',
			'@typescript-eslint/no-unsafe-return': 'error',
			'react/react-in-jsx-scope': 'off',
		}
	}, {
		files: [ '**/*.css' ],
		language: 'css/css',
		languageOptions: { customSyntax: tailwind4 },
		extends: [ css.configs.recommended ],
	}
)
