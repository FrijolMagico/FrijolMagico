import 'server-only'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Load a colocated .sql file and return its contents as a string.
 *
 * Resolves `relativePath` against the directory of the calling module.
 * Pass `import.meta.url` as the first argument so the path resolves
 * relative to the file that calls this function, not to `cwd`.
 *
 * Intended for server-only usage (Node.js runtime).
 *
 * @example
 * ```ts
 * import { loadSql } from '@frijolmagico/database/sql'
 *
 * export const MY_QUERY = loadSql(import.meta.url, './myQuery.sql')
 * ```
 */
export function loadSql(importMetaUrl: string, relativePath: string): string {
  const callerDir = dirname(fileURLToPath(importMetaUrl))
  const sqlPath = resolve(callerDir, relativePath)
  return readFileSync(sqlPath, 'utf-8').trim()
}
