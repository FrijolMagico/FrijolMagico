import { defineConfig } from 'drizzle-kit'

import { migrationCredentials } from './scripts/migrate-target'

// drizzle-kit passes its subcommand after the executable path. Never hand credentials
// to push, introspect, an unknown command, or a module import with no command.
const command = process.argv[2]
if (command !== 'migrate' && command !== 'generate') {
  throw new Error('Drizzle config permits only migrate or offline generate')
}
const target = process.env.TURSO_MIGRATION_TARGET
if (command === 'migrate' && target !== 'staging' && target !== 'production') {
  throw new Error('Explicit migration target required')
}
if (command === 'generate' && target !== undefined) {
  throw new Error('Generation cannot select a migration target')
}
if (command === 'generate' && (process.env.TURSO_MIGRATION_TARGET !== undefined ||
  process.env.TURSO_MIGRATION_AUTH_TOKEN !== undefined)) {
  throw new Error('Generation cannot select remote migration credentials')
}

const credentials = command === 'migrate' && (target === 'staging' || target === 'production')
  ? migrationCredentials(target) : undefined

export default defineConfig({
  dialect: 'turso',
  schema: './src/db/schema',
  out: './migrations/',
  ...(credentials ? { dbCredentials: credentials } : {})
})
