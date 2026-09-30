import { defineConfig } from 'drizzle-kit'

import { migrationCredentials, verifyRemoteName } from './scripts/migrate-target'

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
if (command === 'generate' && (process.env.TURSO_DATABASE_URL !== undefined ||
  process.env.TURSO_AUTH_TOKEN !== undefined || process.env.TURSO_MIGRATION_AUTH_TOKEN !== undefined)) {
  throw new Error('Ambient database credentials are not accepted by drizzle config')
}

const credentials = command === 'migrate' && (target === 'staging' || target === 'production')
  ? migrationCredentials(target) : undefined
if (credentials && (target === 'staging' || target === 'production')) {
  // Direct drizzle-kit migrate must make its own read-only identity lookup.
  verifyRemoteName(target, credentials.url)
}

export default defineConfig({
  dialect: 'turso',
  schema: './src/db/schema',
  out: './migrations/',
  ...(credentials ? { dbCredentials: credentials } : {})
})
