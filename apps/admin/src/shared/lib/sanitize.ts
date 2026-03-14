/**
 * Transforms empty string values to null for nullable DB columns.
 * Prevents empty strings from violating UNIQUE constraints
 * and maintains semantic correctness ('' is not null).
 */
export function emptyStringsToNull<T extends Record<string, unknown>>(
  data: T
): T {
  const result = { ...data }
  for (const key in result) {
    if (result[key] === '') {
      ;(result as Record<string, unknown>)[key] = null
    }
  }
  return result
}
