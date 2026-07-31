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

// TODO: Implement poster URL resolution when CDN integration is ready
export function getPosterUrl(path: string | null): string | null {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${R2_PUBLIC_URL}/${path.replace(/^\//, '')}`
}
