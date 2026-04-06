import { isNull } from 'drizzle-orm'
import type { AnyColumn, SQL, SQLWrapper } from 'drizzle-orm'

/**
 * Soft-delete filter predicate.
 * Returns IS NULL check for the given deleted_at column.
 * Use in WHERE clauses to exclude soft-deleted records.
 *
 * @example
 * .where(isNotDeleted(artistTable.deletedAt))
 * .where(and(eq(table.id, id), isNotDeleted(table.deletedAt)))
 */
export function isNotDeleted(column: SQLWrapper | AnyColumn): SQL {
  return isNull(column)
}
