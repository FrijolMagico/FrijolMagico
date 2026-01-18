import { unstable_cache } from 'next/cache'

import { formatUrlWithoutQuery } from '@/utils/utils'
import { catalogRepository } from '../adapters/catalogRepository'

import type { CatalogArtist } from '../types/catalog'
import type { ErrorObject } from '@/types/errors'

/**
 * Obtiene los datos del catálogo con cache de Next.js.
 */
const getCachedCatalogData = unstable_cache(
  async (): Promise<CatalogArtist[]> => {
    return catalogRepository()
  },
  ['catalog-list'],
  {
    revalidate: false,
    tags: ['catalog'],
  },
)

export async function getCatalogData(): Promise<{
  data: CatalogArtist[]
  error: ErrorObject
}> {
  try {
    const data = await getCachedCatalogData()

    return {
      data: formatArtistData(data),
      error: null,
    }
  } catch (error) {
    const err = error as Error
    console.error(err.message)
    return {
      data: [],
      error: {
        message:
          'Error al obtener los artistas del catalogo. Por favor intente nuevamente mas tarde.',
      },
    }
  }
}

/**
 * Formatea los datos del artista para la UI.
 * - Formatea bio (markdown)
 * - Formatea URLs de redes sociales
 */
export const formatArtistData = (
  artistsData: CatalogArtist[],
): CatalogArtist[] => {
  return artistsData.map((artist) => {
    const rrssUrl = formatUrlWithoutQuery(artist.rrss)

    let formattedBio = artist.bio
      .replaceAll(/"([^"]+?)"/g, '"_$1_"')
      .replaceAll(/'([^']+?)'/g, "'_$1_'")
      .split('\n')
      .join('  \n')

    const usernameRegex = /\s@(\w+)/g
    if (usernameRegex.test(formattedBio) && rrssUrl) {
      formattedBio = formattedBio.replace(usernameRegex, (_, username) => {
        return ` **[@${username}](${rrssUrl})**`
      })
    }

    return {
      ...artist,
      bio: formattedBio,
      rrss: rrssUrl,
    }
  })
}
