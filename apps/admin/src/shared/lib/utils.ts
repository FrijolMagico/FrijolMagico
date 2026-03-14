export function toSlug(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
}

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

/**
 * Converts all null values in a flat object to undefined.
 * Use before Zod validation to handle UI payloads that send null
 * instead of undefined for optional fields.
 */
export function nullsToUndefined<T extends Record<string, unknown>>(
  obj: T
): {
  [K in keyof T]: Exclude<T[K], null> | (null extends T[K] ? undefined : never)
} {
  const result = { ...obj }
  for (const key of Object.keys(result)) {
    if (result[key] === null) {
      ;(result as Record<string, unknown>)[key] = undefined
    }
  }
  return result as {
    [K in keyof T]:
      | Exclude<T[K], null>
      | (null extends T[K] ? undefined : never)
  }
}
