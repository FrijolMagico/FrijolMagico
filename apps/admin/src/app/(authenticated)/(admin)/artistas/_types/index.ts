import type { Artist } from '@frijolmagico/database/orm'

export type RawArtist = Artist

export type ArtistEntry = Omit<RawArtist, 'id' | 'rrss'> & {
  id: string
  rrss: Record<string, string> | null
  estadoSlug?: string
}

export interface ArtistListFilters {
  search: string
  country: string | null
  city: string | null
  statusId: number | null
}
import type { ArtistHistory } from '@frijolmagico/database/orm'

export type RawHistoryEntry = ArtistHistory

export type HistoryEntry = Omit<
  RawHistoryEntry,
  'id' | 'artistaId' | 'rrss'
> & {
  id: string
  artistaId: string
  rrss: Record<string, string> | null
}
