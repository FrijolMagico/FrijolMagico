import type { CatalogArtist } from './catalog'

export type CatalogSearchOption = { value: string }

export interface CatalogSearchPayload {
  city: CatalogSearchOption[]
  country: CatalogSearchOption[]
  category: CatalogSearchOption[]
}

export type CatalogListArtist = Pick<
  CatalogArtist,
  | 'id'
  | 'name'
  | 'slug'
  | 'avatar'
  | 'city'
  | 'country'
  | 'category'
  | 'collective'
  | 'email'
  | 'rrss'
>
