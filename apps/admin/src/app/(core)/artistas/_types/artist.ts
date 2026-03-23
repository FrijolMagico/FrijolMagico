import type { History } from '../_lib/aggregate-history'
import type { Artist } from '../_schemas/artista.schema'

export interface ArtistListItem extends Artist {
  deletedAt: string | null
}

export interface ArtistWithHistory extends ArtistListItem {
  history: History
}
