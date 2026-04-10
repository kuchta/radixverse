import { defineConfig, globalIgnores } from 'eslint/config'
import js from '@eslint/js'
import css from '@eslint/css'
import tslint from 'typescript-eslint'
import stylisticPlugin from '@stylistic/eslint-plugin'
import importPlugin from 'eslint-plugin-import'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import reactCompilerPlugin from 'eslint-plugin-react-compiler'
import globals from 'globals'
import { tailwind4 } from 'tailwind-csstree'


export default defineConfig(
	globalIgnores([ '.history/**', 'dist/**', 'dev-dist/**', 'deno-deploy-serve.ts' ]),
{
	linterOptions: { reportUnusedDisableDirectives: 'error' }
}, {
	files: [ '**/*.{js,jsx,ts,tsx}' ],
	ignores: [ '.history/', 'dist/', 'dev-dist/' ],
	languageOptions: {
		parser: tslint.parser,
		parserOptions: {
			projectService: true,
		},
		globals: {
			...globals.browser,
			JSX: 'readonly'
		}
	},
	extends: [
		js.configs.recommended,
		tslint.configs.recommended,
		tslint.configs.recommendedTypeChecked,
		stylisticPlugin.configs.recommended,
		importPlugin.flatConfigs.recommended,
		reactPlugin.configs.flat,
		reactHooksPlugin.default.configs.flat,
		// @ts-expect-error Types of property 'sourceCode' are incompatible.
		reactCompilerPlugin.configs.recommended,
	],
	plugins: {
		'@typescript-eslint': tslint.plugin,
		// @ts-expect-error Types of property 'create' are incompatible
		'@stylistic': stylisticPlugin,
		import: importPlugin,
		react: reactPlugin,
		// @ts-expect-error no properties in common with type 'Plugin'
		'react-hooks': reactHooksPlugin,
		// @ts-expect-error Types of property 'plugins' are incompatible.
		'react-compiler': reactCompilerPlugin,
	},
	settings: {
		react: {
		  version: 'detect'
		},
	},
	rules: {
		semi: [ 'error', 'never' ],
		'no-mixed-spaces-and-tabs': [ 'error', 'smart-tabs' ],
		eqeqeq: 'off',
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
}, {
	files: [ '**/*.css' ],
	ignores: [ '.history/**', 'dist/**', 'dev-dist/**' ],
	language: 'css/css',
	languageOptions: { customSyntax: tailwind4 },
	plugins: { css },
	extends: [
		css.configs.recommended
	],
})
