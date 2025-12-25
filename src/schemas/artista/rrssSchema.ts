import { z } from 'zod'

/**
 * Plataformas de redes sociales soportadas
 */
export const RRSS_PLATFORMS = [
  'instagram',
  'facebook',
  'twitter',
  'tiktok',
  'youtube',
  'web',
] as const

export type RrssPlatform = (typeof RRSS_PLATFORMS)[number]

/**
 * Schema para el objeto de redes sociales
 * Cada plataforma es opcional y debe ser una URL valida
 */
export const rrssObjectSchema = z
  .object({
    instagram: z.string().url().optional(),
    facebook: z.string().url().optional(),
    twitter: z.string().url().optional(),
    tiktok: z.string().url().optional(),
    youtube: z.string().url().optional(),
    web: z.string().url().optional(),
  })
  .partial()

/**
 * Tipo inferido del objeto RRSS
 * Ejemplo: { instagram: "https://instagram.com/user", web: "https://mysite.com" }
 */
export type RrssObject = z.infer<typeof rrssObjectSchema>

/**
 * Detecta la plataforma de una URL
 * Retorna null si la URL es invalida
 */
export function detectPlatform(url: string): RrssPlatform | null {
  const normalizedUrl = url.toLowerCase()

  if (normalizedUrl.includes('instagram.com')) return 'instagram'
  if (
    normalizedUrl.includes('facebook.com') ||
    normalizedUrl.includes('fb.com')
  )
    return 'facebook'
  if (normalizedUrl.includes('twitter.com') || normalizedUrl.includes('x.com'))
    return 'twitter'
  if (normalizedUrl.includes('tiktok.com')) return 'tiktok'
  if (
    normalizedUrl.includes('youtube.com') ||
    normalizedUrl.includes('youtu.be')
  )
    return 'youtube'

  // Si no es una red social conocida, validamos que sea una URL valida
  // antes de asumir que es web personal
  try {
    new URL(url)
    return 'web'
  } catch {
    // URL invalida, retornamos null
    return null
  }
}

/**
 * Asegura que una URL tenga protocolo https
 */
export function ensureHttps(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) return trimmed

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed
  }

  return `https://${trimmed}`
}

/**
 * Convierte un string de URL a un objeto RrssObject
 * Detecta automaticamente la plataforma
 *
 * @param url - URL cruda (puede no tener protocolo)
 * @returns RrssObject con la plataforma detectada, o null si vacio
 */
export function urlToRrssObject(
  url: string | null | undefined,
): RrssObject | null {
  if (!url || !url.trim()) return null

  const normalizedUrl = ensureHttps(url)
  const platform = detectPlatform(normalizedUrl)

  if (!platform) return null

  return { [platform]: normalizedUrl }
}

/**
 * Serializa un RrssObject a JSON string para guardar en DB
 */
export function rrssToJson(rrss: RrssObject | null): string | null {
  if (!rrss || Object.keys(rrss).length === 0) return null
  return JSON.stringify(rrss)
}

/**
 * Parsea un JSON string de la DB a RrssObject
 */
export function jsonToRrss(json: string | null): RrssObject | null {
  if (!json) return null

  try {
    const parsed = JSON.parse(json)
    const result = rrssObjectSchema.safeParse(parsed)
    return result.success ? result.data : null
  } catch {
    return null
  }
}
