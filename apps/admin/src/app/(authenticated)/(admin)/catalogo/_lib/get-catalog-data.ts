import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { eq, and, asc, count } from 'drizzle-orm'
import { getAvatarUrl } from '@/lib/cdn'
import type { CatalogArtist, PaginatedResult, CatalogFilters } from '../_types'
import { cacheTag } from 'next/cache'
import { ARTIST_CACHE_TAG } from '../_constants'
import { parseRRSS } from './parse-rrss'

const { catalogoArtista, artista, artistaImagen } = artist

export async function getCatalogArtists(
  _filters: CatalogFilters = { activo: null, destacado: null, search: '' }
): Promise<PaginatedResult<CatalogArtist>> {
  'use cache'
  cacheTag(ARTIST_CACHE_TAG)

  // ✅ Load ALL artists, client handles filtering
  // Server-side filtering breaks client edits that haven't been persisted yet
  // E.g., toggling artist to inactive locally then filtering by "Inactivos"
  // would return 0 results from DB since the edit isn't saved yet

  // Get total count (ALL artists, no filter)
  const countResult = await db
    .select({ count: count() })
    .from(catalogoArtista)
    .innerJoin(artista, eq(catalogoArtista.artistaId, artista.id))

  const total = countResult[0]?.count || 0

  // Get ALL data (no server-side filtering)
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
    .orderBy(asc(catalogoArtista.orden))

  // Map results to CatalogArtist
  const artistasWithMetadata: CatalogArtist[] = results.map((row) => ({
    artistaId: row.artistaId,
    nombre: row.nombre,
    pseudonimo: row.pseudonimo,
    slug: row.slug,
    correo: row.correo,
    // TODO: pass the parseRRSS and the getAvatarURL into a a util package in the monorepo
    rrss: parseRRSS(row.rrss),
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
