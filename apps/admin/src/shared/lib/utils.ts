export function generateTempId(): string {
  return `temp-${crypto.randomUUID()}`
}

/**
 * Strips undefined values from an object to prevent Drizzle from setting NULL.
 * Use before passing to Drizzle's .set() for partial updates.
 */
export function stripUndefined<T extends Record<string, unknown>>(
  obj: T
): Partial<T> {
  const result: Partial<T> = {}
  for (const key of Object.keys(obj) as (keyof T)[]) {
    if (obj[key] !== undefined) {
      result[key] = obj[key]
    }
  }
  return result
}
