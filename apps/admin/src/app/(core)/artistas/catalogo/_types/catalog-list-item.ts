import type { Catalog } from '../_schemas/catalog.schema'
import type { Artist } from '../../_schemas/artista.schema'

export interface CatalogArtist extends Artist {
  slug: string
}

export interface CatalogAvailableArtist {
  id: number
  pseudonimo: string
  nombre: string | null
  slug: string
}

export interface CatalogListItem extends Catalog {
  artist: CatalogArtist
}
