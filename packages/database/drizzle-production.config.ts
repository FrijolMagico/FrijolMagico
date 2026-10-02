import { defineConfig } from 'drizzle-kit'

const databaseName = process.env.TURSO_PRODUCTION_DATABASE_NAME
const databaseUrl = process.env.TURSO_PRODUCTION_DATABASE_URL
const authToken = process.env.TURSO_PRODUCTION_AUTH_TOKEN

if (!databaseName || !/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(databaseName)) {
  throw new Error('Missing or invalid production database name')
}
if (!databaseUrl || databaseUrl !== databaseUrl.trim()) {
  throw new Error('Missing or invalid production database URL')
}
if (!authToken || !authToken.trim() || authToken !== authToken.trim()) {
  throw new Error('Missing production auth token')
}
if (process.env.TURSO_PRODUCTION_MIGRATION_CONFIRM !== `migrate:${databaseName}`) {
  throw new Error('Production migration requires exact confirmation: migrate:<database-name>')
}

let url: URL
try {
  url = new URL(databaseUrl)
} catch {
  throw new Error('Missing or invalid production database URL')
}
if (
  !['libsql:', 'https:'].includes(url.protocol) ||
  !new RegExp(`^${databaseName}-[-a-z0-9]+(?:\\.[-a-z0-9]+)?\\.turso\\.io$`, 'i').test(url.hostname) ||
  url.username ||
  url.password ||
  url.port ||
  (url.pathname !== '/' && url.pathname !== '') ||
  url.search ||
  url.hash
) {
  throw new Error('Production database URL does not match the selected database')
}

export default defineConfig({
  schema: './src/db/schema',
  out: './migrations/',
  dialect: 'turso',
  dbCredentials: { url: databaseUrl, authToken }
})
