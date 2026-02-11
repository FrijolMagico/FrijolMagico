'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { eq, and, asc, sql, inArray } from 'drizzle-orm'
import type {
  CatalogEntryFormData,
  ArtistaFormData,
  OperationResult,
  CatalogArtist
} from '../_types'
import { ARTISTA_CACHE_TAG } from '../_constants'
import { revalidateTag } from 'next/cache'

const { catalogoArtista, artista } = artist

// Actualizar entrada del catálogo (solo campos de catálogo)
export async function updateCatalogEntry(
  artistaId: number,
  data: Partial<CatalogEntryFormData>
): Promise<OperationResult> {
  // TODO: Phase 3 - Change journal implementation pending
  // Stub implementation - database operations commented out

  // // Check if entry exists
  // const catalogEntry = await db
  //   .select({ id: catalogoArtista.id })
  //   .from(catalogoArtista)
  //   .where(eq(catalogoArtista.artistaId, artistaId))
  //   .limit(1)
  //
  // if (catalogEntry.length === 0) {
  //   return {
  //     success: false,
  //     error: 'No se encontró la entrada de catálogo para este artista'
  //   }
  // }
  //
  // // Prepare update data
  // const updateData: any = {
  //   updatedAt: new Date().toISOString()
  // }
  //
  // if (data.destacado !== undefined) updateData.destacado = data.destacado
  // if (data.activo !== undefined) updateData.activo = data.activo
  // if (data.descripcion !== undefined)
  //   updateData.descripcion = data.descripcion || null
  //
  // await db
  //   .update(catalogoArtista)
  //   .set(updateData)
  //   .where(eq(catalogoArtista.artistaId, artistaId))
  //
  // revalidateTag('server-action', ARTISTA_CACHE_TAG)

  return { success: true }
}

// Actualizar información del artista
export async function updateArtista(
  artistaId: number,
  data: ArtistaFormData
): Promise<OperationResult> {
  // TODO: Phase 3 - Change journal implementation pending
  // Stub implementation - database operations commented out

  // // Check if pseudonimo is unique (excluding current artist)
  // const existingPseudonimo = await db
  //   .select({ id: artista.id })
  //   .from(artista)
  //   .where(
  //     and(
  //       eq(artista.pseudonimo, data.pseudonimo),
  //       // Exclude current artist
  //       sql`${artista.id} != ${artistaId}`
  //     )
  //   )
  //   .limit(1)
  //
  // if (existingPseudonimo.length > 0) {
  //   return {
  //     success: false,
  //     error: 'El pseudónimo ya está en uso por otro artista'
  //   }
  // }
  //
  // // Update artist info
  // await db
  //   .update(artista)
  //   .set({
  //     nombre: data.nombre || null,
  //     pseudonimo: data.pseudonimo,
  //     correo: data.correo || null,
  //     rrss: data.rrss || null,
  //     ciudad: data.ciudad || null,
  //     pais: data.pais || null,
  //     updatedAt: new Date().toISOString()
  //   })
  //   .where(eq(artista.id, artistaId))
  //
  // revalidateTag('server-action', ARTISTA_CACHE_TAG)

  return { success: true }
}

// Guardar cambios en batch (updates from ui-state)
export async function saveCatalogBatch(
  updates: Record<number, Partial<CatalogArtist>>
): Promise<OperationResult> {
  // TODO: Phase 3 - Change journal implementation pending
  // Stub implementation - database operations commented out

  // const updatePromises = []
  // const ids = Object.keys(updates).map(Number)
  //
  // for (const id of ids) {
  //   const changes = updates[id]
  //
  //   // Split changes between tables
  //   const catalogChanges: any = {}
  //   const artistChanges: any = {}
  //
  //   let hasCatalogChanges = false
  //   let hasArtistChanges = false
  //
  //   // Map fields to tables
  //   if (changes.orden !== undefined) {
  //     catalogChanges.orden = changes.orden
  //     hasCatalogChanges = true
  //   }
  //   if (changes.destacado !== undefined) {
  //     catalogChanges.destacado = changes.destacado
  //     hasCatalogChanges = true
  //   }
  //   if (changes.activo !== undefined) {
  //     catalogChanges.activo = changes.activo
  //     hasCatalogChanges = true
  //   }
  //   if (changes.descripcion !== undefined) {
  //     catalogChanges.descripcion = changes.descripcion
  //     hasCatalogChanges = true
  //   }
  //
  //   if (changes.nombre !== undefined) {
  //     artistChanges.nombre = changes.nombre
  //     hasArtistChanges = true
  //   }
  //   // ... map other artist fields if editable in list (currently not)
  //
  //   if (hasCatalogChanges) {
  //     catalogChanges.updatedAt = new Date().toISOString()
  //     updatePromises.push(
  //       db
  //         .update(catalogoArtista)
  //         .set(catalogChanges)
  //         .where(eq(catalogoArtista.artistaId, id))
  //     )
  //   }
  //
  //   if (hasArtistChanges) {
  //     artistChanges.updatedAt = new Date().toISOString()
  //     updatePromises.push(
  //       db.update(artista).set(artistChanges).where(eq(artista.id, id))
  //     )
  //   }
  // }
  //
  // await Promise.all(updatePromises)
  //
  // revalidateTag('server-action', ARTISTA_CACHE_TAG)

  return { success: true }
}
