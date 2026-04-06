export function parseRRSS(rrss: string | null): Record<string, string[]> {
  if (!rrss) return {}

  try {
    return Object.entries(JSON.parse(rrss)).reduce(
      (acc, [key, value]) => {
        if (Array.isArray(value)) {
          acc[key] = value.filter(
            (item): item is string => typeof item === 'string'
          )
        } else if (typeof value === 'string') {
          acc[key] = [value]
        }

        return acc
      },
      {} as Record<string, string[]>
    )
  } catch {
    return {}
  }
}

export function getFirstRrssUrl(rrss: string | null, platform: string): string {
  return parseRRSS(rrss)[platform]?.[0] ?? ''
}
