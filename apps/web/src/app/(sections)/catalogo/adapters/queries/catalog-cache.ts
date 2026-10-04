import { executeQuery } from '@frijolmagico/database/client'
import {
  CATALOG_BASE_CACHE_TAG,
  CATALOG_EDITION_DATES_CACHE_TAG,
  CATALOG_PARTICIPATION_CACHE_TAG
} from '@frijolmagico/cache-tags'
import { cacheLife, cacheTag } from 'next/cache'

import {
  CATALOG_BASE_QUERY,
  CATALOG_EDITION_DATES_QUERY,
  CATALOG_PARTICIPATION_QUERY
} from './catalog-batched'

import type { CatalogBaseRow } from './catalog-batched'
import type { EditionDateRow, ParticipationRow } from './catalog-batched'

export async function getCachedCatalogBaseRows(): Promise<CatalogBaseRow[]> {
  'use cache'
  cacheLife({ stale: 5 * 60, revalidate: Infinity, expire: Infinity })
  cacheTag(CATALOG_BASE_CACHE_TAG)

  const result = await executeQuery<CatalogBaseRow>(CATALOG_BASE_QUERY, [])
  if (result.error) throw result.error
  return result.data
}

export async function getCachedCatalogParticipationRows(): Promise<ParticipationRow[]> {
  'use cache'
  cacheLife({ stale: 5 * 60, revalidate: Infinity, expire: Infinity })
  cacheTag(CATALOG_PARTICIPATION_CACHE_TAG)

  const result = await executeQuery<ParticipationRow>(CATALOG_PARTICIPATION_QUERY, [])
  if (result.error) throw result.error
  return result.data
}

export async function getCachedCatalogEditionDateRows(): Promise<EditionDateRow[]> {
  'use cache'
  cacheLife({ stale: 5 * 60, revalidate: Infinity, expire: Infinity })
  cacheTag(CATALOG_EDITION_DATES_CACHE_TAG)

  const result = await executeQuery<EditionDateRow>(CATALOG_EDITION_DATES_QUERY, [])
  if (result.error) throw result.error
  return result.data
}
