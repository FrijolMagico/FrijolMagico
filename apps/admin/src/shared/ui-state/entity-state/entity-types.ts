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
   * Array de IDs para preservar orden y facilitar iteración (id especial de UI, no necesariamente el ID del backend)
   */
  entityIds: number[]
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
   * ID de UI de la entidad afectada
   */
  entityId: number

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
   * Counter for auto-incrementing negative temporary IDs (-1, -2, -3...)
   */
  nextTempId: number

  /**
   * MÉTODO COMPUTED: Calcula effective data mergeando las 3 capas
   */
  getEffectiveData(): EntityState<T>

  /**
   * MÉTODO COMPUTED: Indica si hay cambios pendientes
   */
  getHasChanges(): boolean

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
  selectById(uiId: number): T | undefined

  /**
   * Retorna array de IDs
   */
  selectIds(): number[]

  /**
   * Retorna mapa de entidades
   */
  selectEntities(): Record<number, T>

  // === ACTIONS LAYER 3 (Single Entity) ===

  /**
   * Agrega una entidad
   * @param entity - Entidad a agregar
   * @param id - ID opcional (si no se provee, genera tempId)
   */
  add(entity: T, id: number | null): void

  /**
   * Elimina una entidad
   */
  remove(id: number): void

  /**
   * Actualiza el objeto singleton sin necesidad de ID
   * Solo disponible cuando isSingleton = true
   */
  update(data: Partial<T>, id: number | null): void

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
  setRemoteData(data: T[]): void

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
