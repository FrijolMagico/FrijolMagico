export type ActivityArtistContact =
  | { kind: 'social'; href: string }
  | { kind: 'email'; href: string }
  | null

const validHttpUrl = (value: unknown): string | null => {
  if (typeof value !== 'string' || value.trim() !== value || !value) return null

  try {
    const url = new URL(value)
    if (
      (url.protocol !== 'http:' && url.protocol !== 'https:') ||
      !url.hostname ||
      url.username ||
      url.password
    ) {
      return null
    }
    return url.href
  } catch {
    return null
  }
}

const valueUrls = (value: unknown): string[] => {
  const values = typeof value === 'string' ? [value] : Array.isArray(value) ? value : []
  return values
    .map(validHttpUrl)
    .filter((url): url is string => url !== null)
}

const parseSocialLinks = (rrss: unknown): Record<string, unknown> | null => {
  if (typeof rrss !== 'string' || !rrss.trim()) return null

  try {
    const parsed: unknown = JSON.parse(rrss)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null
    return parsed as Record<string, unknown>
  } catch {
    return null
  }
}

const validEmail = (value: unknown): string | null => {
  if (
    typeof value !== 'string' ||
    value.trim() !== value ||
    value.length > 254 ||
    /[\s<>]/.test(value)
  ) {
    return null
  }

  const separator = value.lastIndexOf('@')
  if (separator <= 0 || separator === value.length - 1) return null
  const local = value.slice(0, separator)
  const domain = value.slice(separator + 1)
  if (
    local.length > 64 ||
    !/^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(local) ||
    local.startsWith('.') ||
    local.endsWith('.') ||
    local.includes('..') ||
    !/^(?=.{1,253}$)(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\.)+[A-Za-z]{2,63}$/.test(
      domain
    )
  ) {
    return null
  }
  return `mailto:${value}`
}

export const getActivityArtistContact = (
  rrss: unknown,
  correo: unknown
): ActivityArtistContact => {
  const socialLinks = parseSocialLinks(rrss)
  if (socialLinks) {
    const instagram = valueUrls(socialLinks.instagram)[0]
    if (instagram) return { kind: 'social', href: instagram }

    for (const [key, value] of Object.entries(socialLinks)) {
      if (key === 'instagram') continue
      const href = valueUrls(value)[0]
      if (href) return { kind: 'social', href }
    }
  }

  const email = validEmail(correo)
  return email ? { kind: 'email', href: email } : null
}
