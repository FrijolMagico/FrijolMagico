import { executeQuery } from '@frijolmagico/database/client'
import { CATALOG_BASE_CACHE_TAG } from '@frijolmagico/cache-tags'
import { cacheLife, cacheTag } from 'next/cache'
import { NextResponse } from 'next/server'

// Keep this read independent of the full catalog base cache and its longer lifetime.
export const CANONICAL_CATALOG_SLUGS_QUERY = `SELECT a.slug
FROM catalogo_artista ca
JOIN artista a ON ca.artista_id = a.id
WHERE ca.activo = 1 AND ca.deleted_at IS NULL AND a.slug IS NOT NULL`

type CanonicalSlugsSnapshot = { slugs: string[]; loadedAt: number }
type LoadSnapshot = () => Promise<CanonicalSlugsSnapshot>

export async function selectCanonicalCatalogSlugs(): Promise<CanonicalSlugsSnapshot> {
  const result = await executeQuery<{ slug: string }>(CANONICAL_CATALOG_SLUGS_QUERY, [])
  if (result.error) throw result.error
  return { slugs: result.data.map(({ slug }) => slug), loadedAt: Date.now() }
}

export async function getCachedCanonicalCatalogSlugs(): Promise<CanonicalSlugsSnapshot> {
  'use cache'
  cacheTag(CATALOG_BASE_CACHE_TAG)
  cacheLife({ stale: 0, revalidate: 45, expire: 60 })
  return selectCanonicalCatalogSlugs()
}

export function createCanonicalSlugsGet(
  loadCached: LoadSnapshot,
  loadFresh: LoadSnapshot,
  now: () => number = Date.now
) {
  return async function GET() {
    try {
      const cached = await loadCached()
      const age = now() - cached.loadedAt
      const snapshot = age < 0 || age > 60_000 ? await loadFresh() : cached
      // The fresh read must not accidentally authorize a canonical hit from an old snapshot.
      const freshAge = now() - snapshot.loadedAt
      if (freshAge < 0 || freshAge > 60_000) throw new Error('Expired canonical slug snapshot')
      return NextResponse.json(
        { slugs: snapshot.slugs },
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

export const GET = createCanonicalSlugsGet(
  getCachedCanonicalCatalogSlugs,
  selectCanonicalCatalogSlugs
)
