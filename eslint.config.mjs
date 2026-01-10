import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier/flat'

const eslintConfig = defineConfig([
  // Next.js core-web-vitals (includes react, react-hooks, next, jsx-a11y)
  ...nextVitals,
  // TypeScript rules
  ...nextTs,
  // Prettier (disables rules that conflict with prettier)
  prettier,
  // Ignores
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'node_modules/**',
    'next-env.d.ts',
  ]),
])

export default eslintConfig
