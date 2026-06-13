/**
 * String → número hash determinista (djb2).
 * Evita Math.random() — incompatible con prerendering de Next.js.
 */
export const hashCode = (str: string): number => {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

/**
 * Shuffle pseudo-aleatorio con seed.
 * Mismo artista → mismos relacionados (estable), distinto artista → distinta selección.
 */
export const seededShuffle = <T>(arr: T[], seed: string): T[] => {
  const shuffled = [...arr]
  let s = hashCode(seed)
  for (let i = shuffled.length - 1; i > 0; i--) {
    s = (s * 16807 + 1) % 2147483647 // Lehmer LCG
    const j = s % (i + 1)
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}
