import { paths } from '@/config/paths'

// ── Types ──

type SectionLabel = string | ((name: string) => string)
type SectionPath = string | ((slug: string) => string)

export interface SectionEntry {
  path: SectionPath
  label: SectionLabel
  readonly sub?: SectionEntry | Record<string, SectionEntry>
}

function isSectionEntry(v: unknown): v is SectionEntry {
  return (
    typeof v === 'object' && v !== null && 'path' in v && 'label' in v
  )
}

// ── Slug formatting ──

function formatSlug(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// ── Tree walk helpers ──

function pathMatches(
  entry: SectionEntry,
  href: string,
  segment: string
): boolean {
  if (typeof entry.path === 'string') return entry.path === href
  return entry.path(segment) === href
}

function resolveLabel(entry: SectionEntry, segment: string): string {
  if (typeof entry.label === 'string') return entry.label
  return formatSlug(entry.label(segment))
}

function getSubEntries(sub: unknown): SectionEntry[] {
  if (!sub || typeof sub !== 'object') return []
  // Single entry: has its own path and label
  if ('path' in sub && 'label' in sub) return [sub as SectionEntry]
  // Multiple entries: record keyed by section name (e.g. home.sub)
  return Object.values(sub as Record<string, unknown>).filter(isSectionEntry)
}

// ── Public API ──

export interface BreadcrumbSegment {
  label: string
  href: string
  current: boolean
}

/** Returns the top-level section entries from the paths tree. */
export function getSections(): SectionEntry[] {
  const sub = paths.home.sub
  if (!sub || typeof sub !== 'object') return []
  return Object.values(sub).filter(isSectionEntry)
}

/**
 * Walks the paths tree to build breadcrumb segments from a pathname.
 *
 * @example
 * parsePathname('/catalogo/canela')
 * // → [{ label: 'Catálogo', href: '/catalogo', current: false },
 * //    { label: 'Canela', href: '/catalogo/canela', current: true }]
 */
export function parsePathname(pathname: string): BreadcrumbSegment[] {
  if (pathname === '/' || pathname === paths.home.path) return []

  const parts = pathname.split('/').filter(Boolean)

  let currentLevel: SectionEntry[] = getSections()
  const result: BreadcrumbSegment[] = []

  for (let i = 0; i < parts.length; i++) {
    const segment = parts[i]
    const href = '/' + parts.slice(0, i + 1).join('/')
    const entry = currentLevel.find((e) => pathMatches(e, href, segment))

    result.push({
      label: entry ? resolveLabel(entry, segment) : formatSlug(segment),
      href,
      current: i === parts.length - 1
    })

    currentLevel = entry ? getSubEntries(entry.sub) : []
  }

  return result
}
