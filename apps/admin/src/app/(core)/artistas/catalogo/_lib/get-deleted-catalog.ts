import 'server-only'
import { cacheTag } from 'next/cache'
import { and, asc, eq, inArray, isNotNull } from 'drizzle-orm'

import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { isNotDeleted } from '@frijolmagico/database/filters'
import { getAvatarUrl } from '@frijolmagico/utils/cdn'

import { parseRRSS } from '@/shared/lib/rrss'

import { ARTIST_CACHE_TAG, CATALOG_CACHE_TAG } from '@frijolmagico/cache-tags'
import type { ARTIST_STATUS } from '../../_constants'
import type {
  CatalogArtist,
  CatalogListItem
} from '../_types/catalog-list-item'
import type { ActiveAvatar } from './avatar-history-contracts'

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
  slug: string
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

function mapDeletedCatalogArtist(row: DeletedCatalogArtistRow): CatalogArtist {
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
        rrss: artistTable.rrss,
        slug: artistTable.slug
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
      id: artistImage.id,
      imagenUrl: artistImage.imagenUrl,
      version: artistImage.artistAvatarVersion
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

  const avatarMap = new Map<number, ActiveAvatar>()
  for (const avatar of avatars) {
    if (!avatarMap.has(avatar.artistaId)) {
      avatarMap.set(avatar.artistaId, {
        id: avatar.id,
        // Full public path built server-side (same contract as getCatalogData).
        path: getAvatarUrl(avatar.imagenUrl),
        version: avatar.version
      })
    }
  }

  return results.map((row) => ({
    ...row,
    artist: mapDeletedCatalogArtist(row.artist),
    activeAvatar: avatarMap.get(row.artistaId) ?? null
  }))
}
