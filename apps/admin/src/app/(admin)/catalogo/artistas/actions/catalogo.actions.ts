'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import { artist } from '@frijolmagico/database/schema'
import { eq, and, asc, sql } from 'drizzle-orm'
import type {
  CatalogoEntryFormData,
  ArtistaFormData,
  ReorderPayload,
  OperationResult,
  PendingChanges
} from '../_types/catalogo'

const { catalogoArtista, artista } = artist

// Actualizar entrada del catálogo (solo campos de catálogo)
export async function updateCatalogoEntry(
  artistaId: number,
  data: CatalogoEntryFormData
): Promise<OperationResult> {
  try {
    // Find the catalog entry
    const catalogEntry = await db
      .select({ id: catalogoArtista.id })
      .from(catalogoArtista)
      .where(eq(catalogoArtista.artistaId, artistaId))
      .limit(1)

    if (catalogEntry.length === 0) {
      return {
        success: false,
        error: 'No se encontró la entrada de catálogo para este artista'
      }
    }

    // Update only catalog fields
    await db
      .update(catalogoArtista)
      .set({
        destacado: data.destacado,
        activo: data.activo,
        descripcion: data.descripcion || null,
        updatedAt: new Date().toISOString()
      })
      .where(eq(catalogoArtista.artistaId, artistaId))

    // Revalidate paths
    revalidatePath('/catalogo/artistas')
    revalidatePath('/(sections)/catalogo')

    return { success: true }
  } catch (error) {
    console.error('Error updating catalog entry:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al actualizar el catálogo'
    }
  }
}

// Actualizar información del artista
export async function updateArtista(
  artistaId: number,
  data: ArtistaFormData
): Promise<OperationResult> {
  try {
    // Check if pseudonimo is unique (excluding current artist)
    const existingPseudonimo = await db
      .select({ id: artista.id })
      .from(artista)
      .where(
        and(
          eq(artista.pseudonimo, data.pseudonimo),
          // Exclude current artist
          sql`${artista.id} != ${artistaId}`
        )
      )
      .limit(1)

    if (existingPseudonimo.length > 0) {
      return {
        success: false,
        error: 'El pseudónimo ya está en uso por otro artista'
      }
    }

    // Update artist info
    await db
      .update(artista)
      .set({
        nombre: data.nombre || null,
        pseudonimo: data.pseudonimo,
        correo: data.correo || null,
        rrss: data.rrss || null,
        ciudad: data.ciudad || null,
        pais: data.pais || null,
        updatedAt: new Date().toISOString()
      })
      .where(eq(artista.id, artistaId))

    // Revalidate paths
    revalidatePath('/catalogo/artistas')
    revalidatePath('/(sections)/catalogo')

    return { success: true }
  } catch (error) {
    console.error('Error updating artist:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al actualizar el artista'
    }
  }
}

// Reordenar artista (drag & drop)
export async function reorderCatalogoArtista(
  payload: ReorderPayload
): Promise<OperationResult> {
  try {
    const { artistaId, newOrden } = payload

    // Update the order
    await db
      .update(catalogoArtista)
      .set({
        orden: newOrden,
        updatedAt: new Date().toISOString()
      })
      .where(eq(catalogoArtista.artistaId, artistaId))

    // Revalidate paths
    revalidatePath('/catalogo/artistas')
    revalidatePath('/(sections)/catalogo')

    return { success: true }
  } catch (error) {
    console.error('Error reordering artist:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al reordenar'
    }
  }
}

// Toggle rápido de campos booleanos
export async function toggleCatalogoField(
  artistaId: number,
  field: 'destacado' | 'activo',
  value: boolean
): Promise<OperationResult> {
  try {
    await db
      .update(catalogoArtista)
      .set({
        [field]: value,
        updatedAt: new Date().toISOString()
      })
      .where(eq(catalogoArtista.artistaId, artistaId))

    // Revalidate paths
    revalidatePath('/catalogo/artistas')
    revalidatePath('/(sections)/catalogo')

    return { success: true }
  } catch (error) {
    console.error(`Error toggling ${field}:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : `Error al actualizar ${field}`
    }
  }
}

// Guardar cambios en batch (reorders + toggles)
export async function saveCatalogoChanges(
  changes: PendingChanges
): Promise<OperationResult> {
  try {
    // Process reorders
    for (const reorder of changes.reorders) {
      await db
        .update(catalogoArtista)
        .set({
          orden: reorder.newOrden,
          updatedAt: new Date().toISOString()
        })
        .where(eq(catalogoArtista.artistaId, reorder.artistaId))
    }

    // Process toggles
    for (const toggle of changes.toggles) {
      await db
        .update(catalogoArtista)
        .set({
          [toggle.field]: toggle.value,
          updatedAt: new Date().toISOString()
        })
        .where(eq(catalogoArtista.artistaId, toggle.artistaId))
    }

    // Revalidate paths
    revalidatePath('/catalogo/artistas')
    revalidatePath('/(sections)/catalogo')

    return { success: true }
  } catch (error) {
    console.error('Error saving catalogo changes:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al guardar cambios'
    }
  }
}

// Rebalancear órdenes (cuando hay demasiados decimales)
export async function rebalanceCatalogoOrders(): Promise<OperationResult> {
  try {
    // Get all catalog entries ordered by current order
    const entries = await db
      .select({
        id: catalogoArtista.id,
        artistaId: catalogoArtista.artistaId
      })
      .from(catalogoArtista)
      .orderBy(asc(catalogoArtista.orden))

    // Reassign sequential integer orders
    for (let i = 0; i < entries.length; i++) {
      await db
        .update(catalogoArtista)
        .set({
          orden: (i + 1).toString(),
          updatedAt: new Date().toISOString()
        })
        .where(eq(catalogoArtista.id, entries[i].id))
    }

    // Revalidate paths
    revalidatePath('/catalogo/artistas')
    revalidatePath('/(sections)/catalogo')

    return { success: true }
  } catch (error) {
    console.error('Error rebalancing orders:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al rebalancear órdenes'
    }
  }
}
