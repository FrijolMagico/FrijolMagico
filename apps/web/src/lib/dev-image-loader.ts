export default function devImageLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  if (process.env.NODE_ENV !== 'development') {
    return src
  }

  const params = new URLSearchParams()
  params.set('url', src)
  params.set('w', width.toString())
  if (quality) params.set('q', quality.toString())

  return `/api/dev-image?${params.toString()}`
}