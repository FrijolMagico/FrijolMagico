import type { Artista } from '@frijolmagico/database/orm'

export type RawArtist = Artista

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
import type { ArtistaHistorial } from '@frijolmagico/database/orm'

export type RawHistoryEntry = ArtistaHistorial

export type HistoryEntry = Omit<
  RawHistoryEntry,
  'id' | 'artistaId' | 'rrss'
> & {
  id: string
  artistaId: string
  rrss: Record<string, string> | null
}
