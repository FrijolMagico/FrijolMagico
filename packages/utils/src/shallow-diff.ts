function isEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true

  if (a == null || b == null) return a === b

  if (typeof a !== typeof b) return false

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    return a.every((val, i) => val === b[i])
  }

  if (typeof a === 'object' && typeof b === 'object') {
    const keysA = Object.keys(a)
    const keysB = Object.keys(b)
    if (keysA.length !== keysB.length) return false
    return keysA.every(
      (key) =>
        (a as Record<string, unknown>)[key] ===
        (b as Record<string, unknown>)[key]
    )
  }

  return false
}

/**
 * Returns a partial object with only the fields that differ
 * between `baseline` and `current`. Shallow comparison only.
 */
export function shallowDiff<T extends Record<string, unknown>>(
  baseline: T,
  current: T
): Partial<T> {
  const diff: Partial<T> = {}

  for (const key of Object.keys(baseline) as Array<keyof T>) {
    if (!isEqual(baseline[key], current[key])) {
      diff[key] = current[key]
    }
  }

  return diff
}

/**
 * Returns an array of keys whose values differ between `baseline` and `current`.
 */
export function shallowDiffKeys<T extends Record<string, unknown>>(
  baseline: T,
  current: T
): Array<keyof T> {
  return (Object.keys(baseline) as Array<keyof T>).filter(
    (key) => !isEqual(baseline[key], current[key])
  )
}

/**
 * Returns `true` if any field differs between `baseline` and `current`.
 */
export function hasDiff<T extends Record<string, unknown>>(
  baseline: T,
  current: T
): boolean {
  return shallowDiffKeys(baseline, current).length > 0
}
