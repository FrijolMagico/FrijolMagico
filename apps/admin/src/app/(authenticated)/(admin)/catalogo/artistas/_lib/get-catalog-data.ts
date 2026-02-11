import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { eq, and, like, or, asc, count } from 'drizzle-orm'
import { getAvatarUrl } from '@/lib/cdn'
import type { CatalogArtist, PaginatedResult, CatalogFilters } from '../_types'
import { cacheTag } from 'next/cache'
import { ARTISTA_CACHE_TAG } from '../_constants'

const { catalogoArtista, artista, artistaImagen } = artist

const ITEMS_PER_PAGE = 20

export async function getCatalogArtists(
  filters: CatalogFilters = { activo: null, destacado: null, search: '' }
): Promise<PaginatedResult<CatalogArtist>> {
  'use cache'
  cacheTag(ARTISTA_CACHE_TAG)

  // Build where conditions
  const conditions = []

  // Filter by activo
  if (filters.activo !== null) {
    conditions.push(eq(catalogoArtista.activo, filters.activo))
  }

  // Filter by destacado
  if (filters.destacado !== null) {
    conditions.push(eq(catalogoArtista.destacado, filters.destacado))
  }

  // Filter by search (nombre or pseudonimo)
  if (filters.search) {
    const searchTerm = `%${filters.search}%`
    conditions.push(
      or(like(artista.nombre, searchTerm), like(artista.pseudonimo, searchTerm))
    )
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined

  // Get total count
  const countResult = await db
    .select({ count: count() })
    .from(catalogoArtista)
    .innerJoin(artista, eq(catalogoArtista.artistaId, artista.id))
    .where(whereClause)

  const total = countResult[0]?.count || 0

  // Get ALL data (no pagination)
  const results = await db
    .select({
      artistaId: artista.id,
      nombre: artista.nombre,
      pseudonimo: artista.pseudonimo,
      slug: artista.slug,
      correo: artista.correo,
      rrss: artista.rrss,
      ciudad: artista.ciudad,
      pais: artista.pais,
      catalogoId: catalogoArtista.id,
      orden: catalogoArtista.orden,
      destacado: catalogoArtista.destacado,
      activo: catalogoArtista.activo,
      descripcion: catalogoArtista.descripcion,
      catalogoUpdatedAt: catalogoArtista.updatedAt,
      avatarPath: artistaImagen.imagenUrl
    })
    .from(catalogoArtista)
    .innerJoin(artista, eq(catalogoArtista.artistaId, artista.id))
    .leftJoin(
      artistaImagen,
      and(
        eq(artistaImagen.artistaId, artista.id),
        eq(artistaImagen.tipo, 'avatar')
      )
    )
    .where(whereClause)
    .orderBy(asc(catalogoArtista.orden))

  // Map results to CatalogArtist
  const artistasWithMetadata: CatalogArtist[] = results.map((row) => ({
    artistaId: row.artistaId,
    nombre: row.nombre,
    pseudonimo: row.pseudonimo,
    slug: row.slug,
    correo: row.correo,
    rrss: row.rrss,
    ciudad: row.ciudad,
    pais: row.pais,
    avatarUrl: getAvatarUrl(row.avatarPath),
    catalogoId: row.catalogoId,
    orden: row.orden,
    destacado: Boolean(row.destacado),
    activo: Boolean(row.activo),
    descripcion: row.descripcion,
    catalogoUpdatedAt: row.catalogoUpdatedAt,
    participacionesCount: 0,
    ultimaEdicion: null
  }))

  return {
    data: artistasWithMetadata,
    total,
    page: 1,
    totalPages: 1,
    hasNext: false,
    hasPrev: false
  }
}
