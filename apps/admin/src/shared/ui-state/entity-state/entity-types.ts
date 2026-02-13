/**
 * @fileoverview entity-types.ts - Entity State Type System
 *
 * Defines the Entity State architecture (Redux Toolkit style) for large collections:
 * - Normalized state: { entities: Record<ID, T>, ids: ID[] }
 * - Granular operations: EntityOperation<T>[]
 * - 3-layer architecture: remoteData, appliedChanges, currentEdits
 *
 * Performance characteristics:
 * - O(1) lookups, updates, deletes
 * - No full array cloning (memory efficient)
 * - Optimistic updates with temp IDs
 *
 * @connection entity-state-architecture-final.md
 */

/**
 * Estado normalizado (Redux Toolkit style)
 *
 * O(1) lookup por ID, orden preservado en ids[]
 *
 * @template T - Tipo de la entidad (e.g., TeamMember, Artist)
 */
export interface EntityState<T> {
  /**
   * Mapa ID → Entidad para O(1) lookups
   */
  entities: Record<string, T>

  /**
   * Array de IDs preservando orden de presentación
   */
  ids: number[]
}

/**
 * Operación granular (event sourcing style)
 *
 * Cada cambio es un evento trackeable y aplicable
 */
export interface EntityOperation<T> {
  /**
   * Tipo de operación
   */
  type: 'ADD' | 'UPDATE' | 'DELETE'

  /**
   * ID de la entidad afectada
   */
  id: number

  /**
   * Datos parciales para UPDATE
   */
  data?: Partial<T>

  /**
   * Entidad completa para ADD
   */
  entity?: T

  /**
   * Timestamp para orden de aplicación
   */
  timestamp: number

  /**
   * true = ID temporal (optimistic update)
   */
  isOptimistic?: boolean
}

/**
 * LAYER 1: Remote Data (Datos del servidor)
 *
 * Extiende EntityState con metadata de paginación
 */
export interface RemoteEntityData<T> extends EntityState<T> {
  /**
   * Metadata de paginación
   */
  pagination?: {
    total: number
    pageSize: number
    currentPage: number
    pagesLoaded: Set<number>
  }

  /**
   * Timestamp de última fetch
   */
  lastFetched: Date
}

/**
 * LAYER 2: Applied Changes (Journal persistido)
 *
 * Operaciones del journal que han sido aplicadas a la UI
 */
export interface AppliedChanges<T> {
  /**
   * Lista de operaciones aplicadas
   */
  operations: EntityOperation<T>[]

  /**
   * Timestamp de última aplicación
   */
  lastApplied: Date
}

/**
 * LAYER 3: Current Edits (Memoria, no persistido)
 *
 * Ediciones en memoria que aún no están en el journal
 */
export interface CurrentEdits<T> {
  /**
   * Lista de operaciones pendientes
   */
  operations: EntityOperation<T>[]
}

/**
 * Estado completo del Entity UI State Store
 */
export interface EntityUIState<T> {
  /**
   * LAYER 1: Remote data from server
   */
  remoteData: RemoteEntityData<T> | null

  /**
   * LAYER 2: Changes from applied journal entries
   */
  appliedChanges: AppliedChanges<T> | null

  /**
   * LAYER 3: Current in-memory edits
   */
  currentEdits: CurrentEdits<T> | null

  /**
   * MÉTODO COMPUTED: Calcula effective data mergeando las 3 capas
   */
  getEffectiveData(): EntityState<T>

  /**
   * MÉTODO COMPUTED: Indica si hay cambios pendientes
   */
  getHasChanges(): boolean

  /**
   * MÉTODO COMPUTED: Indica si hay ediciones sin guardar
   */
  getHasUnsavedEdits(): boolean

  /**
   * Loading state for remote fetch
   */
  isLoading: boolean

  /**
   * Error state for remote fetch
   */
  error: string | null
}

/**
 * Acciones del Entity UI State Store
 */
export interface EntityUIStateActions<T> {
  // === COMPUTED SELECTORS (Redux compatible) ===

  /**
   * Retorna todas las entidades como array
   */
  selectAll(): T[]

  /**
   * Retorna entidad por ID
   */
  selectById(id: number): T | undefined

  /**
   * Retorna array de IDs
   */
  selectIds(): number[]

  /**
   * Retorna mapa de entidades
   */
  selectEntities(): Record<number, T>

  /**
   * Retorna cantidad total de entidades
   */
  selectTotal(): number

  /**
   * Retorna el único objeto en modo singleton
   * @returns T | null - El objeto singleton o null si no existe
   */
  selectOne(): T | null

  // === ACTIONS LAYER 3 (Single Entity) ===

  /**
   * Agrega una entidad
   * @param entity - Entidad a agregar
   * @param id - ID opcional (si no se provee, genera tempId)
   */
  addOne(entity: T, id?: number): void

  /**
   * Actualiza una entidad existente
   */
  updateOne(id: number, data: Partial<T>): void

  /**
   * Elimina una entidad
   */
  removeOne(id: number): void

  /**
   * Agrega o actualiza una entidad (upsert)
   */
  upsertOne(entity: T): void

  // === ACTIONS LAYER 3 (Bulk Operations) ===

  /**
   * Agrega múltiples entidades
   */
  addMany(entities: T[]): void

  /**
   * Actualiza múltiples entidades
   */
  updateMany(updates: { id: number; data: Partial<T> }[]): void

  /**
   * Elimina múltiples entidades
   */
  removeMany(ids: number[]): void

  /**
   * Agrega o actualiza múltiples entidades
   */
  upsertMany(entities: T[]): void

  /**
   * Reemplaza todas las entidades
   */
  setAll(entities: T[]): void

  /**
   * Actualiza el objeto singleton sin necesidad de ID
   * Solo disponible cuando isSingleton = true
   */
  update(data: Partial<T>): void

  /**
   * Setea el objeto singleton completo
   * Solo disponible cuando isSingleton = true
   */
  set(data: T): void

  // === ACTIONS LAYER 2 ===

  /**
   * Mueve currentEdits a appliedChanges y escribe al journal
   */
  commitCurrentEdits(): Promise<void>

  /**
   * Limpia currentEdits sin persistir
   */
  clearCurrentEdits(): void

  /**
   * Limpia appliedChanges después de guardar en servidor
   */
  clearAppliedChanges(): void

  // === ACTIONS LAYER 1 ===

  /**
   * Setea datos remotos del servidor
   */
  setRemoteData(
    data: T[],
    options?: { page?: number; pageSize?: number; total?: number }
  ): void

  // === UTILITIES ===

  /**
   * Reinicia todo el estado
   */
  reset(): void

  /**
   * Setea estado de loading
   */
  setLoading(loading: boolean): void

  /**
   * Setea mensaje de error
   */
  setError(error: string | null): void
}

/**
 * Store completo (estado + acciones)
 */
export type EntityUIStateStore<T> = EntityUIState<T> & EntityUIStateActions<T>
