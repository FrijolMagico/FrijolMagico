import type { CatalogArtist } from '../../types/catalog'
import { ArtistCard } from '@/components/ArtistCard'

/**
 * String → número hash determinista (djb2).
 * Evita Math.random() — incompatible con prerendering de Next.js.
 */
const hashCode = (str: string): number => {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

/**
 * Shuffle pseudo-aleatorio con seed.
 * Mismo artista → mismos relacionados (estable), distinto artista → distinta selección.
 */
const seededShuffle = <T,>(arr: T[], seed: string): T[] => {
  const shuffled = [...arr]
  let s = hashCode(seed)
  for (let i = shuffled.length - 1; i > 0; i--) {
    s = (s * 16807 + 1) % 2147483647 // Lehmer LCG
    const j = s % (i + 1)
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export interface RelatedArtistsProps {
  artist: CatalogArtist
  catalogData: CatalogArtist[]
}

export const getRelatedArtists = (
  artist: CatalogArtist,
  catalogData: CatalogArtist[],
  limit = 4
) => {
  // 1. Misma categoría
  const sameCategory = catalogData.filter(
    (a) => a.category === artist.category && a.id !== artist.id
  )

  // 2. Misma ciudad (excluyendo los que ya están por categoría)
  const sameCity = catalogData.filter(
    (a) =>
      a.city === artist.city &&
      a.id !== artist.id &&
      !sameCategory.some((c) => c.id === a.id)
  )

  // 3. Resto de artistas (excluyendo los ya seleccionados)
  const others = catalogData.filter(
    (a) =>
      a.id !== artist.id &&
      !sameCategory.some((c) => c.id === a.id) &&
      !sameCity.some((c) => c.id === a.id)
  )

  // Mezclamos cada grupo internamente para que la selección sea variada pero prioritaria
  const shuffledCategory = seededShuffle(sameCategory, artist.id)
  const shuffledCity = seededShuffle(sameCity, artist.id)
  const shuffledOthers = seededShuffle(others, artist.id)

  const pool = [...shuffledCategory, ...shuffledCity, ...shuffledOthers]
  return pool.slice(0, limit)
}

export const RelatedArtists = ({
  artist,
  catalogData
}: RelatedArtistsProps) => {
  const related = getRelatedArtists(artist, catalogData, 4)

  if (related.length === 0) return null

  return (
    <section className='container mx-auto max-w-4xl py-12'>
      <h2 className='text-primary mb-6 text-2xl font-bold'>
        Artistas Relacionados
      </h2>

      <ul className='mx-auto grid w-fit grid-cols-1 items-end gap-6 sm:grid-cols-4'>
        {related.map((relatedArtist) => (
          <li key={relatedArtist.id}>
            <ArtistCard
              artist={{
                pseudonimo: relatedArtist.name,
                imagen_url: relatedArtist.avatar,
                slug: relatedArtist.slug ?? ''
              }}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
