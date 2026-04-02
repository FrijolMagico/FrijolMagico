export interface AgrupacionRow {
  id: number
  nombre: string
  descripcion: string | null
  correo: string | null
  activo: boolean
  memberCount: number
  createdAt: string
}

export interface DeletedAgrupacionRow {
  id: number
  nombre: string
  descripcion: string | null
  correo: string | null
  activo: boolean
  memberCount: number
  deletedAt: string
  createdAt: string
}

export interface CollectiveMember {
  agrupacionId: number
  artistaId: number
  rol: string | null
  activo: boolean
  createdAt: string
  artistPseudonimo: string
  artistCiudad: string | null
}

export interface ArtistLookup {
  id: number
  pseudonimo: string
  ciudad: string | null
}

export interface PendingMember {
  artistaId: number
  pseudonimo: string
  ciudad: string | null
  rol: string
  activo: boolean
}
