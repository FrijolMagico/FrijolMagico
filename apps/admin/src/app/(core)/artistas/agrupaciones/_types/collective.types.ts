export interface CollectiveRow {
  id: number
  nombre: string
  descripcion: string | null
  correo: string | null
  activo: boolean
  memberCount: number
  createdAt: string
}

export interface DeletedCollectiveRow extends CollectiveRow {
  deletedAt: string
}

export interface MemberDraftItem {
  artistId: number
  pseudonym: string
  city: string | null
  role: string | null
  active: boolean
}

export interface ArtistOption {
  id: number
  pseudonym: string
  city: string | null
}

export type MembersByCollectiveId = Record<number, MemberDraftItem[]>

export interface CollectiveDetailResult {
  membersByCollectiveId: MembersByCollectiveId
  availableArtists: ArtistOption[] | null
}
