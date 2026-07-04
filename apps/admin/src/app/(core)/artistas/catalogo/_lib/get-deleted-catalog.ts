import 'server-only'
import { cacheTag } from 'next/cache'
import { and, asc, eq, inArray, isNotNull } from 'drizzle-orm'

import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { isNotDeleted } from '@frijolmagico/database/filters'

import { getAvatarUrl } from '@/shared/lib/cdn'
import { parseRRSS } from '@/shared/lib/rrss'

import { ARTIST_CACHE_TAG, CATALOG_CACHE_TAG } from '@frijolmagico/cache-tags'
import type { ARTIST_STATUS } from '../../_constants'
import type { Artist } from '../../_schemas/artista.schema'
import type { CatalogListItem } from '../_types/catalog-list-item'

const { catalogArtist, artistImage, artist: artistTable } = artist

interface DeletedCatalogArtistRow {
  id: number
  pseudonimo: string
  nombre: string | null
  rut: string | null
  telefono: string | null
  correo: string | null
  ciudad: string | null
  pais: string | null
  estadoId: number
  rrss: string | null
}

interface DeletedCatalogRow {
  id: number
  artistaId: number
  orden: string
  destacado: boolean
  activo: boolean
  descripcion: string | null
  deletedAt: string | null
  artist: DeletedCatalogArtistRow
}

function mapDeletedCatalogArtist(row: DeletedCatalogArtistRow): Artist {
  return {
    ...row,
    estadoId: row.estadoId as ARTIST_STATUS,
    rrss: parseRRSS(row.rrss)
  }
}

export async function getDeletedCatalog(): Promise<CatalogListItem[]> {
  'use cache'
  cacheTag(CATALOG_CACHE_TAG)
  cacheTag(ARTIST_CACHE_TAG)

  const results: DeletedCatalogRow[] = await db
    .select({
      id: catalogArtist.id,
      artistaId: catalogArtist.artistaId,
      orden: catalogArtist.orden,
      destacado: catalogArtist.destacado,
      activo: catalogArtist.activo,
      descripcion: catalogArtist.descripcion,
      deletedAt: catalogArtist.deletedAt,
      artist: {
        id: artistTable.id,
        pseudonimo: artistTable.pseudonimo,
        nombre: artistTable.nombre,
        rut: artistTable.rut,
        telefono: artistTable.telefono,
        correo: artistTable.correo,
        ciudad: artistTable.ciudad,
        pais: artistTable.pais,
        estadoId: artistTable.estadoId,
        rrss: artistTable.rrss
      }
    })
    .from(catalogArtist)
    .innerJoin(artistTable, eq(artistTable.id, catalogArtist.artistaId))
    .where(isNotNull(catalogArtist.deletedAt))
    .orderBy(asc(catalogArtist.orden))
    .limit(100)

  if (results.length === 0) {
    return []
  }

  const artistIds = results.map((result) => result.artistaId)
  const avatars = await db
    .select({
      artistaId: artistImage.artistaId,
      imagenUrl: artistImage.imagenUrl,
      orden: artistImage.orden
    })
    .from(artistImage)
    .where(
      and(
        inArray(artistImage.artistaId, artistIds),
        eq(artistImage.tipo, 'avatar'),
        isNotDeleted(artistImage.deletedAt)
      )
    )
    .orderBy(asc(artistImage.orden))

  const avatarMap = new Map<number, string>()
  for (const avatar of avatars) {
    if (!avatarMap.has(avatar.artistaId)) {
      avatarMap.set(avatar.artistaId, avatar.imagenUrl)
    }
  }

  return results.map((row) => ({
    ...row,
    artist: mapDeletedCatalogArtist(row.artist),
    avatarUrl: getAvatarUrl(avatarMap.get(row.artistaId) ?? null)
  }))
}
