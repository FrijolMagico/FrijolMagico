import { executeQuery } from '@frijolmagico/database/client'
import { CANONICAL_CATALOG_SLUGS_CACHE_TAG } from '@frijolmagico/cache-tags'
import { unstable_cache } from 'next/cache'
import { NextResponse } from 'next/server'

// Keep this read independent of the full catalog base cache and its longer lifetime.
export const CANONICAL_CATALOG_SLUGS_QUERY = `SELECT a.slug
FROM catalogo_artista ca
JOIN artista a ON ca.artista_id = a.id
WHERE ca.activo = 1 AND ca.deleted_at IS NULL AND a.slug IS NOT NULL`

type LoadSlugs = () => Promise<string[]>

export async function selectCanonicalCatalogSlugs(): Promise<string[]> {
  const result = await executeQuery<{ slug: string }>(CANONICAL_CATALOG_SLUGS_QUERY, [])
  if (result.error) throw result.error
  return result.data.map(({ slug }) => slug)
}

export const getCachedCanonicalCatalogSlugs = unstable_cache(
  selectCanonicalCatalogSlugs,
  ['canonical-catalog-slugs'],
  { tags: [CANONICAL_CATALOG_SLUGS_CACHE_TAG], revalidate: false }
)

export function createCanonicalSlugsGet(loadCached: LoadSlugs) {
  return async function GET() {
    try {
      const slugs = await loadCached()
      return NextResponse.json(
        { slugs },
        { headers: { 'Cache-Control': 'no-store' } }
      )
    } catch {
      return NextResponse.json(
        { error: 'Canonical catalog unavailable' },
        { status: 503, headers: { 'Cache-Control': 'no-store' } }
      )
    }
  }
}

export const GET = createCanonicalSlugsGet(getCachedCanonicalCatalogSlugs)
