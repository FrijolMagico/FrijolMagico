import {
  createClient,
  type Client,
  type ResultSet,
  type InValue,
} from '@libsql/client'

let client: Client | null = null

export interface TursoConfig {
  url?: string
  authToken?: string
}

/**
 * Get or create a Turso database client
 * Uses environment variables by default: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN
 *
 * Supports both remote databases (https:// or libsql://) and local files (file:)
 */
export function getTursoClient(config?: TursoConfig): Client {
  if (client) return client

  const url = config?.url || process.env.TURSO_DATABASE_URL

  if (!url) {
    throw new Error(
      'Missing Turso database URL. Set TURSO_DATABASE_URL environment variable.',
    )
  }

  const authToken = config?.authToken || process.env.TURSO_AUTH_TOKEN

  client = createClient({
    url,
    authToken,
  })

  return client
}

/**
 * Execute a SQL query with optional parameters
 */
export async function executeQuery<T = Record<string, unknown>>(
  sql: string,
  params: InValue[] = [],
): Promise<{ data: T[]; error: Error | null }> {
  try {
    const db = getTursoClient()
    const result: ResultSet = await db.execute({ sql, args: params })

    const data = result.rows.map((row) => {
      const obj: Record<string, unknown> = {}
      result.columns.forEach((col, index) => {
        obj[col] = row[index]
      })
      return obj as T
    })

    return { data, error: null }
  } catch (error) {
    return { data: [], error: error as Error }
  }
}

/**
 * Execute multiple SQL statements in a batch
 */
export async function executeBatch(
  statements: { sql: string; params?: InValue[] }[],
): Promise<{ success: boolean; error: Error | null }> {
  try {
    const db = getTursoClient()

    await db.batch(
      statements.map((stmt) => ({
        sql: stmt.sql,
        args: stmt.params || [],
      })),
    )

    return { success: true, error: null }
  } catch (error) {
    return { success: false, error: error as Error }
  }
}

/**
 * Execute a single INSERT and return the last inserted row ID
 */
export async function executeInsert(
  sql: string,
  params: InValue[] = [],
): Promise<{ lastInsertRowid: bigint | undefined; error: Error | null }> {
  try {
    const db = getTursoClient()
    const result = await db.execute({ sql, args: params })

    return { lastInsertRowid: result.lastInsertRowid, error: null }
  } catch (error) {
    return { lastInsertRowid: undefined, error: error as Error }
  }
}
