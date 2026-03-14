import 'server-only'
import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { isNotDeleted } from '@frijolmagico/database/filters'
import { eq, and, asc } from 'drizzle-orm'
import { getAvatarUrl } from '@/lib/cdn'
import { cacheTag } from 'next/cache'
import { CATALOG_CACHE_TAG } from '../_constants'
import { Catalog } from '../_schemas/catalogo.schema'

const { catalogArtist, artistImage } = artist

export async function getCatalogData(): Promise<Catalog[] | null> {
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
      deletedAt: catalogArtist.deletedAt,
      avatarUrl: artistImage.imagenUrl
    })
    .from(catalogArtist)
    .leftJoin(
      artistImage,
      and(
        eq(artistImage.artistaId, catalogArtist.artistaId),
        eq(artistImage.tipo, 'avatar'),
        isNotDeleted(artistImage.deletedAt)
      )
    )
    .where(isNotDeleted(catalogArtist.deletedAt))
    .orderBy(asc(catalogArtist.orden))

  if (results === undefined) return null

  return results.map((row) => ({
    ...row,
    avatarUrl: getAvatarUrl(row.avatarUrl)
  }))
}
