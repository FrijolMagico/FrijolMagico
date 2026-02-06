const CDN_URL = process.env.CDN_URL ?? 'https://cdn.frijolmagico.cl/'

export function getAvatarUrl(path: string | null): string {
  if (!path) return '/images/placeholder-avatar.svg'
  if (path.startsWith('http')) return path
  return `${CDN_URL}/${path.replace(/^\//, '')}`
}
