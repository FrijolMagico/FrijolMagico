/**
 * Shared logic for the dev R2 reset script: extracting the set of asset keys
 * that must survive a bucket cleanup (the seed-referenced assets).
 *
 * Pure functions, no I/O — unit-tested in tests/reset-dev-r2-lib.test.ts.
 */

import type { AssetTableColumns } from './types'

/**
 * Normalizes a stored asset value into a raw R2 key.
 *
 * - Absolute HTTP(S) values (foreign URLs or full CDN URLs) are not R2 keys
 *   and are dropped.
 * - The asset version is a query parameter on the public URL, never part of
 *   the stored key, so query strings are stripped.
 * - Leading slashes are removed; empty or nullish values yield null.
 */
export function normalizeAssetKey(
  value: string | null | undefined,
): string | null {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed) return null
  if (/^https?:\/\//i.test(trimmed)) return null
  const withoutQuery = trimmed.split('?')[0] ?? trimmed
  const key = withoutQuery.replace(/^\/+/, '')
  return key === '' ? null : key
}

/** Splits a SQL tuple on commas, respecting single-quoted strings. */
function splitSqlTuple(tupleSql: string): string[] {
  const values: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < tupleSql.length; i++) {
    const char = tupleSql[i]
    if (char === "'") {
      // Doubled quotes escape a literal quote inside the string.
      if (inQuotes && tupleSql[i + 1] === "'") {
        current += "'"
        i++
        continue
      }
      inQuotes = !inQuotes
      current += char
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  values.push(current.trim())
  return values
}

/** Extracts every VALUES tuple of the INSERT statement starting at searchFrom. */
function extractTuples(seedSql: string, searchFrom: number): string[][] {
  // Bound the scan to the current statement (ends at the first ';') so column
  // lists and tuples of later INSERTs are never misread as this one's values.
  const statementEnd = seedSql.indexOf(';', searchFrom)
  const end = statementEnd === -1 ? seedSql.length : statementEnd
  const tuples: string[][] = []
  let i = searchFrom

  while (i < end) {
    while (i < end && seedSql[i] !== '(') i++
    if (i >= end) break

    let j = i + 1
    let inQuotes = false
    while (j < end) {
      const char = seedSql[j]
      if (char === "'") {
        if (seedSql[j + 1] === "'") {
          j += 2
          continue
        }
        inQuotes = !inQuotes
      } else if (char === ')' && !inQuotes) {
        break
      }
      j++
    }
    if (j >= end) break

    tuples.push(splitSqlTuple(seedSql.slice(i + 1, j)))
    i = j + 1
  }
  return tuples
}

const INSERT_INTO_PATTERN =
  /INSERT\s+INTO\s+([a-z_][a-z0-9_]*)\s*\(([^)]*)\)\s*VALUES/gi

/**
 * Extracts the asset keys referenced by a seed SQL file without executing it.
 *
 * Columns are resolved positionally from each INSERT's column list, so the
 * parser survives column reordering. Only single-quoted string values are
 * considered; NULLs, numbers and multi-tuple INSERTs are handled. Which
 * tables/columns hold asset keys is decided by `assetColumns` (config).
 */
export function parseSeedAssetKeys(
  seedSql: string,
  assetColumns: AssetTableColumns,
): string[] {
  const keys = new Set<string>()
  INSERT_INTO_PATTERN.lastIndex = 0

  let match: RegExpExecArray | null
  while ((match = INSERT_INTO_PATTERN.exec(seedSql)) !== null) {
    const table = match[1]
    const columnsForTable = assetColumns[table]
    if (!columnsForTable) continue

    const columnList = match[2]
      .split(',')
      .map((column) => column.trim())
    const positions = columnsForTable
      .map((column) => columnList.indexOf(column))
      .filter((position) => position !== -1)
    if (positions.length === 0) continue

    for (const tuple of extractTuples(seedSql, INSERT_INTO_PATTERN.lastIndex)) {
      for (const position of positions) {
        const raw = tuple[position]
        if (raw === undefined || !raw.startsWith("'") || !raw.endsWith("'")) {
          continue
        }
        const key = normalizeAssetKey(raw.slice(1, -1))
        if (key) keys.add(key)
      }
    }
  }

  return [...keys].sort()
}

/**
 * True only when the environment is development, strictly:
 * - VERCEL_ENV absent (never run on Vercel, not even with the Vercel
 *   'development' value — this script is local-only), and
 * - NODE_ENV exactly 'development' (not production, preview, staging, or any
 *   other value, and not missing). Fail-closed by design.
 *
 * The official `bun run reset:dev-r2` command provides NODE_ENV=development
 * explicitly; any other invocation path that reaches this script without it
 * is rejected.
 */
export function isDevEnvironment(
  env: Record<string, string | undefined>,
): boolean {
  return !env.VERCEL_ENV && env.NODE_ENV === 'development'
}

/**
 * Normalizes an excluded-folder entry into a key prefix (always ends in '/').
 *
 * Accepted forms, all equivalent:
 * - 'artistas/*'  → 'artistas/' (wildcard segment stripped)
 * - 'artistas/'   → 'artistas/'
 * - 'artistas'    → 'artistas/'
 *
 * Blank entries yield null; '*' yields '/' (excludes everything).
 */
export function normalizeExcludedFolder(folder: string): string | null {
  const trimmed = folder.trim()
  if (!trimmed) return null
  if (trimmed === '*') return '/'
  let value = trimmed
  if (value.endsWith('/*')) value = value.slice(0, -2)
  if (!value.endsWith('/')) value += '/'
  return value
}

/**
 * True when the object key falls under any excluded folder prefix, which
 * excludes it (recursively) from deletion.
 */
export function isKeyExcluded(
  key: string,
  excludedFolders: string[],
): boolean {
  const prefixes = new Set<string>()
  for (const folder of excludedFolders) {
    const prefix = normalizeExcludedFolder(folder)
    if (prefix !== null) prefixes.add(prefix)
  }
  for (const prefix of prefixes) {
    if (key.startsWith(prefix)) return true
  }
  return false
}

/**
 * True when the object key is a folder placeholder (ends with '/').
 */
export function isFolderPlaceholder(key: string): boolean {
  return key.endsWith('/')
}

/**
 * Collects every folder prefix that leads to a protected key. For a protected
 * key 'a/b/c.webp' the prefixes 'a/' and 'a/b/' are collected, so folder
 * placeholders matching them are part of a protected path and are kept too —
 * the full path of a preserved asset is protected.
 */
export function collectProtectedFolderPrefixes(
  keys: readonly string[],
  isProtected: (key: string) => boolean,
): Set<string> {
  const prefixes = new Set<string>()
  for (const key of keys) {
    if (!isProtected(key)) continue
    let slashIndex = key.indexOf('/')
    while (slashIndex !== -1) {
      prefixes.add(key.slice(0, slashIndex + 1))
      slashIndex = key.indexOf('/', slashIndex + 1)
    }
  }
  return prefixes
}

export interface CleanupPlan {
  /** Keys protected by config.excludedFolders (kept). */
  excludedKeys: string[]
  /** Every key to delete, in bucket order (assets + folder placeholders). */
  toDelete: string[]
  /** Concrete assets to delete (keys not ending in '/'). */
  assetsToDelete: string[]
  /** Folder placeholders to delete (keys ending in '/'). */
  folderPlaceholdersToDelete: string[]
}

/**
 * Partitions bucket keys according to the cleanup rules:
 * - preserved (seed) keys are kept;
 * - keys under config.excludedFolders are kept;
 * - folder placeholders that are part of a protected path are kept;
 * - everything else is deleted.
 */
export function buildCleanupPlan(
  keys: readonly string[],
  preserved: readonly string[],
  excludedFolders: string[],
): CleanupPlan {
  const preservedSet = new Set(preserved)
  const isProtected = (key: string): boolean =>
    preservedSet.has(key) || isKeyExcluded(key, excludedFolders)
  const protectedFolderPrefixes = collectProtectedFolderPrefixes(
    keys,
    isProtected,
  )

  const excludedKeys: string[] = []
  const toDelete: string[] = []
  for (const key of keys) {
    if (preservedSet.has(key)) continue
    if (isKeyExcluded(key, excludedFolders)) {
      excludedKeys.push(key)
    } else if (protectedFolderPrefixes.has(key)) {
      continue // folder placeholder of a protected path — kept
    } else {
      toDelete.push(key)
    }
  }

  return {
    excludedKeys,
    toDelete,
    assetsToDelete: toDelete.filter((key) => !isFolderPlaceholder(key)),
    folderPlaceholdersToDelete: toDelete.filter(isFolderPlaceholder),
  }
}
