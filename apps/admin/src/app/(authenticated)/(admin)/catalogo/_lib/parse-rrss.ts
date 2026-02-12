export function parseRRSS(
  rrss: string | null
): { [key: string]: string } | null {
  if (!rrss) return null

  try {
    const parsed = JSON.parse(rrss)
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed
    }
    return null
  } catch (error) {
    console.error('Error parsing rrss:', error)
    return null
  }
}
