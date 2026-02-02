import { formatUrl } from './url'

export const normalizeString = (str: string): string => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replaceAll(' ', '')
}

export const getInstagramUserTag = (url: string): string => {
  if (!url) return ''
  const formattedUrl = formatUrl(url)
  const match = formattedUrl.match(
    /(?:https?:\/\/)?(?:www\.)?instagram\.com\/([^/]+)/i,
  )
  const userTag = match?.[1].split('?')[0]
  return match ? `@${userTag}` : formattedUrl
}
