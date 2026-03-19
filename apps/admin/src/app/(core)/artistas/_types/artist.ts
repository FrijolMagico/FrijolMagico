import type { History } from '../_lib/aggregate-history'
import type { Artist } from '../_schemas/artista.schema'

export interface ArtistWithHistory extends Artist {
  history: History
}
