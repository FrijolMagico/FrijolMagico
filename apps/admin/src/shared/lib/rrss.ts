export function parseRRSS(rrss: string | null): Record<string, string[]> {
  if (!rrss) return {}
  return Object.entries(JSON.parse(rrss)).reduce(
    (acc, [key, value]) => {
      if (Array.isArray(value)) {
        // Si es array, usarlo directamente (filtrando strings)
        acc[key] = value.filter((item) => typeof item === 'string')
      } else if (typeof value === 'string') {
        // Si es string, envolver en array
        acc[key] = [value]
      }
      return acc
    },
    {} as Record<string, string[]>
  )
}
