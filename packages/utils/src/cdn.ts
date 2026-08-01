const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL ?? 'https://cdn.frijolmagico.cl'

function isAbsoluteUrl(value: string): boolean {
  return /^https?:\/\//i.test(value)
}

function normalizePath(path: string): string {
  return path
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join('/')
}

export function composeAssetUrl(
  base: string,
  path: string,
  version: string | null
): string {
  if (isAbsoluteUrl(path)) return path

  const normalizedBase = base.replace(/\/+$/, '')
  const normalizedPath = normalizePath(path)
  const url = `${normalizedBase}/${normalizedPath}`

  return version === null ? url : `${url}?v=${encodeURIComponent(version)}`
}

export function getAvatarUrl(path: string | null): string {
  if (!path) return '/images/placeholder-avatar.svg'
  if (path.startsWith('http')) return path
  return `${R2_PUBLIC_URL}/${path.replace(/^\//, '')}`
}

/**
 * Inverse of `getAvatarUrl` for server-side comparison boundaries: strips the
 * known public CDN base back to the raw R2 key stored in `imagenUrl`.
 * Non-HTTP values (already-raw keys or foreign absolute URLs) pass through
 * unchanged. Server-only consumers only (persistence boundaries).
 */
export function toRawAssetPath(path: string): string {
  if (!path.startsWith('http')) return path
  const base = R2_PUBLIC_URL.replace(/\/+$/, '')
  return path.startsWith(`${base}/`) ? path.slice(base.length + 1) : path
}

// TODO: Implement poster URL resolution when CDN integration is ready
export function getPosterUrl(path: string | null): string | null {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${R2_PUBLIC_URL}/${path.replace(/^\//, '')}`
}
