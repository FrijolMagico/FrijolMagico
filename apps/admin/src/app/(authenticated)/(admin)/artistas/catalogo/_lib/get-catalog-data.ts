'use server'

import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { eq, and, asc } from 'drizzle-orm'
import { getAvatarUrl } from '@/lib/cdn'
import type { CatalogEntry } from '../_types'
import { cacheTag } from 'next/cache'
import { CATALOG_CACHE_TAG } from '../_constants'

const { catalogoArtista, artistaImagen } = artist

export async function getCatalogData(): Promise<CatalogEntry[] | null> {
  'use cache'
  cacheTag(CATALOG_CACHE_TAG)

  const results = await db
    .select({
      id: catalogoArtista.id,
      artistaId: catalogoArtista.artistaId,
      orden: catalogoArtista.orden,
      destacado: catalogoArtista.destacado,
      activo: catalogoArtista.activo,
      descripcion: catalogoArtista.descripcion,
      createdAt: catalogoArtista.createdAt,
      updatedAt: catalogoArtista.updatedAt,
      avatarPath: artistaImagen.imagenUrl
    })
    .from(catalogoArtista)
    .leftJoin(
      artistaImagen,
      and(
        eq(artistaImagen.artistaId, catalogoArtista.artistaId),
        eq(artistaImagen.tipo, 'avatar')
      )
    )
    .orderBy(asc(catalogoArtista.orden))

  if (results === undefined) return null

  return results.map((row) => ({
    artistaId: String(row.artistaId),
    orden: row.orden,
    destacado: row.destacado,
    activo: row.activo,
    descripcion: row.descripcion,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    id: String(row.id),
    avatarUrl: getAvatarUrl(row.avatarPath)
  }))
}
