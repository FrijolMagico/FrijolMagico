import type { CatalogArtist as RawCatalogArtist } from '@frijolmagico/database/orm'
import { ArtistEntry } from '../../_types'

export type RawCatalogEntry = RawCatalogArtist

export type CatalogEntry = Omit<RawCatalogEntry, 'id' | 'artistaId'> & {
  id: string
  artistaId: string
  avatarUrl: string | null
}

export type CatalogArtist = CatalogEntry &
  Pick<
    ArtistEntry,
    'nombre' | 'pseudonimo' | 'correo' | 'rrss' | 'ciudad' | 'pais'
  > & {
    participacionesIds: string[]
  }

export interface ArtistFormData {
  nombre: string
  pseudonimo: string
  correo: string
  rrss: {
    [key: string]: string
  }
  ciudad: string
  pais: string
}

// Para reordenamiento DnD
export interface ReorderPayload {
  artistaId: number
  newOrden: string
  sourcePage: number
  targetPage: number
}

// Cambios pendientes para guardar en batch
export interface PendingChanges {
  reorders: Array<{ artistaId: number; newOrden: string }>
  toggles: Array<{
    artistaId: number
    field: 'destacado' | 'activo'
    value: boolean
  }>
}

// Filtros
export interface CatalogFilters {
  activo: boolean | null
  destacado: boolean | null
  search: string
}

// Estado del formulario completo para draft
export interface CatalogListFormData {
  artistas: CatalogEntry[]
  pendingChanges: PendingChanges
}

// Resultado de operaciones
export interface OperationResult {
  success: boolean
  error?: string
  reindexNeeded?: boolean
  reindexInfo?: {
    maxLength: number
    count: number
  }
}
