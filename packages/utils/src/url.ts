export const formatUrl = (url: string): string => {
  if (!url) return ''
  return url.startsWith('http') ? url : `https://${url}`
}

export const formatUrlWithoutQuery = (url: string): string => {
  if (!url) return ''
  const formattedUrl = formatUrl(url)
  const urlWithoutQuery = formattedUrl.split('?')[0]
  return urlWithoutQuery.endsWith('/')
    ? urlWithoutQuery.slice(0, -1)
    : urlWithoutQuery
}
