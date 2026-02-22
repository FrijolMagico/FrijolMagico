import type { Artista } from '@frijolmagico/database/orm'

export type RawArtist = Artista

export type ArtistEntry = Omit<RawArtist, 'id' | 'rrss'> & {
  id: string
  rrss: Record<string, string> | null
  estadoSlug?: string
}
