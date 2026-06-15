import { seededShuffle } from '@/utils/shuffle'
import { CatalogArtist } from '../../types/catalog'

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
