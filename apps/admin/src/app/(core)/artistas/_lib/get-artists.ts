import 'server-only'
import { cacheTag } from 'next/cache'

import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { and, asc, count, eq, isNull, sql } from 'drizzle-orm'
import {
  createPaginatedResponse,
  type PaginatedResponse
} from '@/shared/types/pagination'
import { ARTIST_CACHE_TAG } from '../_constants'
import type { ARTIST_STATUS } from '../_constants'
import {
  artistQueryParamsSchema,
  type ArtistQueryParams
} from '../_schemas/query-params.schema'
import type { Artist } from '../_schemas/artista.schema'

const { artist: artistTable } = artist

export interface ArtistListFilterOptions {
  countries: string[]
  cities: string[]
}

interface ArtistRow {
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

function mapArtistRow(row: ArtistRow): Artist {
  return {
    ...row,
    estadoId: row.estadoId as ARTIST_STATUS,
    rrss: row.rrss ? (JSON.parse(row.rrss) as Record<string, string>) : {}
  }
}

function buildArtistWhereClause(query: ArtistQueryParams) {
  const conditions = [isNull(artistTable.deletedAt)]

  if (query.pais) {
    conditions.push(eq(artistTable.pais, query.pais))
  }

  if (query.ciudad) {
    conditions.push(eq(artistTable.ciudad, query.ciudad))
  }

  if (query.estado !== null) {
    conditions.push(eq(artistTable.estadoId, query.estado))
  }

  if (query.search) {
    const searchTerm = `%${query.search.toLowerCase()}%`

    conditions.push(sql`(
      lower(coalesce(${artistTable.nombre}, '')) like ${searchTerm}
      or lower(coalesce(${artistTable.pseudonimo}, '')) like ${searchTerm}
    )`)
  }

  return and(...conditions)
}

function uniqueValues(rows: Array<{ value: string | null }>): string[] {
  return Array.from(
    new Set(
      rows
        .map((row) => row.value?.trim() ?? '')
        .filter((value) => value.length > 0)
    )
  ).sort((left, right) => left.localeCompare(right))
}

export async function getAllArtists(): Promise<Artist[]> {
  'use cache'
  cacheTag(ARTIST_CACHE_TAG)

  const results = await db
    .select({
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
    })
    .from(artistTable)
    .where(isNull(artistTable.deletedAt))
    .orderBy(asc(artistTable.createdAt))

  if (results === undefined || results.length === 0) return []

  return results.map(mapArtistRow)
}

// NOTE: This function is used to populate the filter options in the UI, so we need to fetch all distinct countries and cities from the artists table. We can optimize this by fetching only the distinct values directly from the database, but for simplicity, we'll fetch all and then extract unique values in memory.
// Keep track of the detabase reads to ensure we don't exceed limits, especially if the artists table grows significantly. If performance becomes an issue, consider implementing a caching strategy for the filter options or fetching distinct values directly from the database using SQL's DISTINCT keyword.
export async function getArtistFilterOptions(): Promise<ArtistListFilterOptions> {
  'use cache'
  cacheTag(ARTIST_CACHE_TAG)

  const [countryRows, cityRows] = await Promise.all([
    db
      .select({ value: artistTable.pais })
      .from(artistTable)
      .where(isNull(artistTable.deletedAt)),
    db
      .select({ value: artistTable.ciudad })
      .from(artistTable)
      .where(isNull(artistTable.deletedAt))
  ])

  return {
    countries: uniqueValues(countryRows),
    cities: uniqueValues(cityRows)
  }
}

export async function getArtists(
  queryParams: unknown
): Promise<PaginatedResponse<Artist>> {
  'use cache'
  cacheTag(ARTIST_CACHE_TAG)

  const query = artistQueryParamsSchema.parse(queryParams)
  const whereClause = buildArtistWhereClause(query)
  const offset = (query.page - 1) * query.limit

  const [results, totalResult] = await Promise.all([
    db
      .select({
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
      })
      .from(artistTable)
      .where(whereClause)
      .orderBy(asc(artistTable.createdAt))
      .limit(query.limit)
      .offset(offset),
    db.select({ total: count() }).from(artistTable).where(whereClause)
  ])

  return createPaginatedResponse(results.map(mapArtistRow), {
    total: totalResult[0]?.total ?? 0,
    page: query.page,
    pageSize: query.limit
  })
}
