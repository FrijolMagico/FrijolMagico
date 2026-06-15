import { and, eq, sql } from 'drizzle-orm'
import { artist as artistSchema } from '@frijolmagico/database/schema'
import { isNotDeleted } from '@frijolmagico/database/filters'
import type { Transaction } from '@frijolmagico/database/orm'

const { catalogArtist } = artistSchema
const artistTable = artistSchema.artist

/**
 * Soft-delete a catalog entry and handle featured-artist replacement.
 *
 * 1. Reads current state (checks if the entry is currently featured)
 * 2. Soft-deletes: sets deletedAt, activo=false, destacado=false
 * 3. If it was featured, picks 1 random eligible replacement and marks it
 *
 * @returns whether the deleted entry was featured before deletion
 */
export async function deleteCatalogEntry(
  tx: Transaction,
  id: number,
): Promise<{ wasFeatured: boolean }> {
  // Step 1: Read current state
  const [current] = await tx
    .select({ destacado: catalogArtist.destacado })
    .from(catalogArtist)
    .where(
      and(eq(catalogArtist.id, id), isNotDeleted(catalogArtist.deletedAt)),
    )
    .limit(1)

  if (!current) {
    throw new Error('Registro de catálogo no encontrado o ya fue eliminado')
  }

  // Step 2: Soft-delete
  await tx
    .update(catalogArtist)
    .set({
      deletedAt: sql`CURRENT_TIMESTAMP`,
      activo: false,
      destacado: false,
    })
    .where(eq(catalogArtist.id, id))

  // Step 3: If it was featured, pick 1 random replacement
  if (current.destacado) {
    const [replacement] = await tx
      .select({ id: catalogArtist.id })
      .from(catalogArtist)
      .innerJoin(artistTable, eq(catalogArtist.artistaId, artistTable.id))
      .where(
        and(
          eq(catalogArtist.activo, true),
          eq(catalogArtist.destacado, false),
          isNotDeleted(catalogArtist.deletedAt),
          isNotDeleted(artistTable.deletedAt),
        ),
      )
      .orderBy(sql`RANDOM()`)
      .limit(1)

    if (replacement) {
      await tx
        .update(catalogArtist)
        .set({ destacado: true })
        .where(eq(catalogArtist.id, replacement.id))
    }
  }

  return { wasFeatured: current.destacado }
}
