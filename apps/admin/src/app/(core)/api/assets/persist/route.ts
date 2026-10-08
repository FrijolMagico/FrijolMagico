import 'server-only'

import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'

import {
  ARTIST_CACHE_TAG,
  ARTIST_DETAIL_CACHE_TAG,
  CATALOG_BASE_CACHE_TAG,
  CATALOG_CACHE_TAG
} from '@frijolmagico/cache-tags'
import { persistArtistAvatarAction } from '@/core/artistas/_actions/persist-artist-avatar.action'
import { getSession } from '@/shared/lib/auth/utils'
import { revalidateWebCacheBatch } from '@/shared/lib/web-invalidation'

function invalidateCatalogCache(): void {
  for (const tag of [
    CATALOG_BASE_CACHE_TAG,
    CATALOG_CACHE_TAG,
    ARTIST_CACHE_TAG,
    ARTIST_DETAIL_CACHE_TAG
  ]) {
    try {
      revalidateTag(tag, { expire: 0 })
    } catch (error) {
      console.error('[assets/persist] Cache invalidation failed', error)
    }
  }
}

export async function POST(request: Request) {
  if (!(await getSession()))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const input: unknown = await request.json().catch(() => null)
  const result = await persistArtistAvatarAction(input)
  if (!result.success || !result.data) {
    const error = result.errors?.[0]
    return NextResponse.json(
      { error: error?.entityType ?? 'artist-avatar' },
      { status: error?.entityType === 'AVATAR_CONFLICT' ? 409 : 400 }
    )
  }
  invalidateCatalogCache()
  const webInvalidation = await revalidateWebCacheBatch(
    [
      { tag: CATALOG_BASE_CACHE_TAG },
      { tag: CATALOG_CACHE_TAG }
    ],
    'assets-persist'
  )
  const webRevalidation =
    result.webRevalidation === 'swr' ||
    webInvalidation.webRevalidation === 'swr'
      ? 'swr'
      : webInvalidation.webRevalidation ?? result.webRevalidation
  return NextResponse.json({
    ...result.data,
    ...(webRevalidation ? { webRevalidation } : {})
  })
}
