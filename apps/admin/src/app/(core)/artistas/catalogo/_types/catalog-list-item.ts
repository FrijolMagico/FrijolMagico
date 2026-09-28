import type { Catalog } from '../_schemas/catalog.schema'
import type { Artist } from '../../_schemas/artista.schema'

export interface CatalogArtist extends Artist {
  slug: string
  activePseudonyms?: Array<{ id: number; pseudonimo: string }>
}

export interface CatalogAvailableArtist {
  id: number
  pseudonimoId: number
  pseudonimo: string
  nombre: string | null
  slug: string
}

export interface CatalogListItem extends Catalog {
  artist: CatalogArtist
}
