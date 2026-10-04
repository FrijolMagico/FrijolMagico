import { FILTER_KEYS } from '../constants/filterConstants'
import { getFiltersData } from '../utils/filterUtils'

import type { CatalogArtist } from '../types/catalog'
import type {
  CatalogListArtist,
  CatalogSearchPayload
} from '../types/catalog-payloads'

export const projectCatalogSearchOptions = (
  catalog: CatalogArtist[]
): CatalogSearchPayload => ({
  city: getFiltersData(catalog, FILTER_KEYS.city),
  country: getFiltersData(catalog, FILTER_KEYS.country),
  category: getFiltersData(catalog, FILTER_KEYS.category)
})

export const projectCatalogList = (
  catalog: CatalogArtist[]
): CatalogListArtist[] =>
  catalog.map((artist) => ({
    id: artist.id,
    name: artist.name,
    slug: artist.slug,
    avatar: artist.avatar,
    city: artist.city,
    country: artist.country,
    category: artist.category,
    collective: artist.collective,
    email: artist.email,
    rrss: artist.rrss
  }))
