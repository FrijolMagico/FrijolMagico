import { spawnSync } from 'node:child_process'

const [environment] = process.argv.slice(2)

if (
  process.argv.length !== 3 ||
  (environment !== 'staging' && environment !== 'production')
) {
  console.error('Usage: bun run scripts/pull-turso-snapshot.ts <staging|production>')
  process.exit(1)
}

const databaseName =
  environment === 'staging'
    ? process.env.TURSO_STAGING_DATABASE_NAME
    : process.env.TURSO_PRODUCTION_DATABASE_NAME
const outputFile = environment === 'staging' ? './local.dev.db' : './local.db'

if (!databaseName) {
  const variableName =
    environment === 'staging'
      ? 'TURSO_STAGING_DATABASE_NAME'
      : 'TURSO_PRODUCTION_DATABASE_NAME'
  console.error(`${variableName} is required`)
  process.exit(1)
}

const result = spawnSync(
  'turso',
  ['db', 'export', databaseName, '--output-file', outputFile, '--overwrite'],
  { stdio: 'inherit' },
)

if (result.error) {
  console.error(`Failed to run turso: ${result.error.message}`)
  process.exitCode = 1
} else {
  process.exitCode = result.status ?? 1
}
