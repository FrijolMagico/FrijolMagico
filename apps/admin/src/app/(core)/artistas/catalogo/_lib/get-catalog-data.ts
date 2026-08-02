import 'server-only'
import { cacheTag } from 'next/cache'
import { and, asc, count, eq, inArray, notExists, sql } from 'drizzle-orm'

import { isNotDeleted } from '@frijolmagico/database/filters'
import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { getAvatarUrl } from '@frijolmagico/utils/cdn'

import {
  createPaginatedResponse,
  type PaginatedResponse
} from '@/shared/types/pagination'
import { parseRRSS } from '@/shared/lib/rrss'

import { ARTIST_CACHE_TAG, CATALOG_CACHE_TAG } from '@frijolmagico/cache-tags'
import { type ARTIST_STATUS } from '../../_constants'
import {
  catalogQueryParamsSchema,
  type CatalogQueryParams
} from '../_schemas/query-params.schema'
import type {
  CatalogArtist,
  CatalogAvailableArtist,
  CatalogListItem
} from '../_types/catalog-list-item'
import type { ActiveAvatar } from './avatar-history-contracts'

const { catalogArtist, artistImage, artist: artistTable } = artist

interface CatalogArtistRow {
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

interface CatalogResultRow {
  id: number
  artistaId: number
  orden: string
  destacado: boolean
  activo: boolean
  descripcion: string | null
  deletedAt: string | null
  artist: CatalogArtistRow
}

function mapCatalogArtist(row: CatalogArtistRow): CatalogArtist {
  return {
    ...row,
    estadoId: row.estadoId as ARTIST_STATUS,
    rrss: parseRRSS(row.rrss)
  }
}

export async function getCatalogData(
  rawParams: unknown
): Promise<PaginatedResponse<CatalogListItem>> {
  'use cache'
  cacheTag(CATALOG_CACHE_TAG)
  cacheTag(ARTIST_CACHE_TAG)

  const query: CatalogQueryParams = catalogQueryParamsSchema.parse(rawParams)
  const conditions = [isNotDeleted(catalogArtist.deletedAt)]

  if (query.activo !== null) {
    conditions.push(eq(catalogArtist.activo, query.activo))
  }

  if (query.destacado !== null) {
    conditions.push(eq(catalogArtist.destacado, query.destacado))
  }

  if (query.search) {
    const searchTerm = `%${query.search.toLowerCase()}%`

    conditions.push(sql`(
      lower(coalesce(${artistTable.nombre}, '')) like ${searchTerm}
      or lower(coalesce(${artistTable.pseudonimo}, '')) like ${searchTerm}
    )`)
  }

  const whereClause = and(...conditions)
  const offset = (query.page - 1) * query.limit

  const catalogResults: CatalogResultRow[] = await db
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
    .where(whereClause)
    .orderBy(asc(catalogArtist.orden))
    .limit(query.limit)
    .offset(offset)

  const artistIds = catalogResults.map((result) => result.artistaId)
  const avatars =
    artistIds.length > 0
      ? await db
          .select({
            id: artistImage.id,
            artistaId: artistImage.artistaId,
            imagenUrl: artistImage.imagenUrl,
            version: artistImage.artistAvatarVersion,
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
      : []

  const avatarMap = new Map<number, ActiveAvatar>()
  for (const avatar of avatars) {
    if (!avatarMap.has(avatar.artistaId)) {
      avatarMap.set(avatar.artistaId, {
        id: avatar.id,
        // Full public path built server-side (getAvatarUrl). The persistence
        // boundaries compare full paths: the guard builds the same full path
        // from `imagenUrl` and `persistArtistAvatarAction` reverts it with
        // toRawAssetPath() for the SQL equality.
        path: getAvatarUrl(avatar.imagenUrl),
        version: avatar.version
      })
    }
  }

  const results = catalogResults.map((row) => ({
    ...row,
    artist: mapCatalogArtist(row.artist),
    activeAvatar: avatarMap.get(row.artistaId) ?? null
  }))

  const totalResult = await db
    .select({ total: count() })
    .from(catalogArtist)
    .innerJoin(artistTable, eq(artistTable.id, catalogArtist.artistaId))
    .where(whereClause)

  return createPaginatedResponse(results, {
    total: totalResult[0]?.total ?? 0,
    page: query.page,
    pageSize: query.limit
  })
}

export async function getArtistsNotInCatalog(): Promise<
  CatalogAvailableArtist[]
> {
  'use cache'
  cacheTag(CATALOG_CACHE_TAG)
  cacheTag(ARTIST_CACHE_TAG)

  const artists = await db
    .select({
      id: artistTable.id,
      pseudonimo: artistTable.pseudonimo,
      nombre: artistTable.nombre,
      slug: artistTable.slug
    })
    .from(artistTable)
    .where(
      and(
        isNotDeleted(artistTable.deletedAt),
        notExists(
          db
            .select({ id: catalogArtist.id })
            .from(catalogArtist)
            .where(
              and(
                eq(catalogArtist.artistaId, artistTable.id),
                isNotDeleted(catalogArtist.deletedAt)
              )
            )
        )
      )
    )
    .orderBy(asc(artistTable.pseudonimo), asc(artistTable.nombre))

  return artists
}
