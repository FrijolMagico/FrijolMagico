import { defineConfig } from 'drizzle-kit'

const databaseName = process.env.TURSO_STAGING_DATABASE_NAME
const databaseUrl = process.env.TURSO_STAGING_DATABASE_URL
const authToken = process.env.TURSO_STAGING_AUTH_TOKEN

if (!databaseName || !/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(databaseName)) {
  throw new Error('Missing or invalid staging database name')
}
if (!databaseUrl || databaseUrl !== databaseUrl.trim()) {
  throw new Error('Missing or invalid staging database URL')
}
if (!authToken || !authToken.trim() || authToken !== authToken.trim()) {
  throw new Error('Missing staging auth token')
}

let url: URL
try {
  url = new URL(databaseUrl)
} catch {
  throw new Error('Missing or invalid staging database URL')
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
  throw new Error('Staging database URL does not match the selected database')
}

export default defineConfig({
  schema: './src/db/schema',
  out: './migrations/',
  dialect: 'turso',
  dbCredentials: { url: databaseUrl, authToken }
})
