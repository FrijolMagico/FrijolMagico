import type { Catalog } from '../_schemas/catalog.schema'
import type { Artist } from '../../_schemas/artista.schema'

export interface CatalogAvailableArtist {
  id: number
  pseudonimo: string
  nombre: string | null
}

export interface CatalogListItem extends Catalog {
  artist: Artist
}
