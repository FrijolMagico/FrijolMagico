'use server'

import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { eq, and, asc } from 'drizzle-orm'
import { getAvatarUrl } from '@/lib/cdn'
import type { CatalogEntry } from '../_types'
import { cacheTag } from 'next/cache'
import { CATALOG_CACHE_TAG } from '../_constants'

const { catalogArtist, artistImage } = artist

export async function getCatalogData(): Promise<CatalogEntry[] | null> {
  'use cache'
  cacheTag(CATALOG_CACHE_TAG)

  const results = await db
    .select({
      id: catalogArtist.id,
      artistaId: catalogArtist.artistaId,
      orden: catalogArtist.orden,
      destacado: catalogArtist.destacado,
      activo: catalogArtist.activo,
      descripcion: catalogArtist.descripcion,
      createdAt: catalogArtist.createdAt,
      updatedAt: catalogArtist.updatedAt,
      deletedAt: catalogArtist.deletedAt,
      avatarPath: artistImage.imagenUrl
    })
    .from(catalogArtist)
    .leftJoin(
      artistImage,
      and(
        eq(artistImage.artistaId, catalogArtist.artistaId),
        eq(artistImage.tipo, 'avatar')
      )
    )
    .orderBy(asc(catalogArtist.orden))

  if (results === undefined) return null

  return results.map((row) => ({
    artistaId: String(row.artistaId),
    orden: row.orden,
    destacado: row.destacado,
    activo: row.activo,
    descripcion: row.descripcion,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt,
    id: String(row.id),
    avatarUrl: getAvatarUrl(row.avatarPath)
  }))
}
