// Datos del catálogo (solo lectura + editable)
export interface CatalogoArtista {
  // From artista table (readonly)
  artistaId: number
  nombre: string | null
  pseudonimo: string
  slug: string
  correo: string | null
  rrss: string | null
  ciudad: string | null
  pais: string | null
  avatarUrl: string | null

  // From catalogo_artista table
  catalogoId: number
  orden: string
  destacado: boolean
  activo: boolean
  descripcion: string | null
  catalogoUpdatedAt: string

  // Metadata
  participacionesCount: number
  ultimaEdicion: string | null
}

// Formulario Entrada Catálogo (sin orden - se maneja por DnD)
export interface CatalogoEntryFormData {
  destacado: boolean
  activo: boolean
  descripcion: string
}

// Formulario Artista
export interface ArtistaFormData {
  nombre: string
  pseudonimo: string
  correo: string
  rrss: string
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

// Paginación
export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

// Filtros
export interface CatalogoFilters {
  activo: boolean | null
  destacado: boolean | null
  search: string
}

// Estado del formulario completo para draft
export interface CatalogoListFormData {
  artistas: CatalogoArtista[]
  pendingChanges: PendingChanges
}

// Resultado de operaciones
export interface OperationResult {
  success: boolean
  error?: string
}
