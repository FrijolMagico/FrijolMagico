export const CDN_CONFIG = {
  baseUrl: 'https://cdn.frijolmagico.cl',
  paths: {
    images: '/images',
    assets: '/assets',
  },
} as const

export const getCdnUrl = (path: string): string => {
  return `${CDN_CONFIG.baseUrl}${path}`
}
