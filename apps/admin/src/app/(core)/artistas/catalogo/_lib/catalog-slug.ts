import 'server-only'

import { and, eq, ne } from 'drizzle-orm'
import { artist as artistTables } from '@frijolmagico/database/schema'
import { toSlug } from '@/shared/lib/utils'

const { artist, artistSlugAlias } = artistTables

type ArtistTransaction = Parameters<Parameters<typeof import('@frijolmagico/database/orm').db.transaction>[0]>[0]

async function isSlugOccupied(
  transaction: ArtistTransaction,
  slug: string,
  artistId: number
) {
  const [canonical] = await transaction
    .select({ id: artist.id })
    .from(artist)
    .where(and(eq(artist.slug, slug), ne(artist.id, artistId)))
    .limit(1)
  if (canonical) return true

  const [alias] = await transaction
    .select({ artistaId: artistSlugAlias.artistaId })
    .from(artistSlugAlias)
    .where(and(eq(artistSlugAlias.slug, slug), ne(artistSlugAlias.artistaId, artistId)))
    .limit(1)
  return Boolean(alias)
}

export async function allocateCatalogSlug(
  transaction: ArtistTransaction,
  artistId: number,
  selectedPseudonym: string
): Promise<boolean> {
  const [currentArtist] = await transaction
    .select({ slug: artist.slug })
    .from(artist)
    .where(eq(artist.id, artistId))
    .limit(1)
  if (!currentArtist) throw new Error('No se encontró el artista del catálogo')

  const desired = toSlug(selectedPseudonym) || `artist-${artistId}`
  let candidate = desired
  if (await isSlugOccupied(transaction, candidate, artistId)) {
    candidate = `${currentArtist.slug}-${desired}`
    while (await isSlugOccupied(transaction, candidate, artistId)) {
      candidate = `${candidate}-${desired}`
    }
  }

  if (candidate === currentArtist.slug) return false

  await transaction
    .delete(artistSlugAlias)
    .where(and(eq(artistSlugAlias.slug, candidate), eq(artistSlugAlias.artistaId, artistId)))
  await transaction.update(artist).set({ slug: candidate }).where(eq(artist.id, artistId))
  await transaction.insert(artistSlugAlias).values({ slug: currentArtist.slug, artistaId: artistId })
  return true
}
