import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import { defineConfig, globalIgnores } from 'eslint/config'

// shortcut: JS/JSX only (no TS parser installed); add typescript-eslint to lint .ts/.tsx.
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [js.configs.recommended, reactHooks.configs['recommended-latest']],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: { ecmaVersion: 'latest', ecmaFeatures: { jsx: true }, sourceType: 'module' },
    },
    // motion: used as <motion.x/> (eslint core can't see JSX usage).
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^(motion|[A-Z_])', argsIgnorePattern: '^[A-Z_]', caughtErrors: 'none' }],
      'no-case-declarations': 'error',
      'react-hooks/rules-of-hooks': 'error',
    },
  },
])
