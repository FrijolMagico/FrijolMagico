# Plan de Implementación - Parte 2: Módulos Core

**[← Volver a IMPLEMENTATION_PLAN_PART1.md]**

---

## 4. MÓDULO 1: CHANGE JOURNAL SYSTEM

### 4.1 Arquitectura del Módulo

```
/shared/change-journal/
  /_lib/
    db.ts                    # Dexie DB (existente, optimizar)
    types.ts                 # Tipos core (existente, refinar)
    sections.ts              # ⚠️ NUEVO - Section definitions
    draft-writer.ts          # Factory (existente, ajustar)
    session-manager.ts       # ⚠️ NUEVO - Session management
  /hooks/
    useDraftStatus.ts        # Hook de status (existente)
    useDraftWriter.ts        # ⚠️ NUEVO - Hook wrapper
  index.ts                   # API pública
```

### 4.2 Session Manager (NUEVO)

```typescript
// src/shared/change-journal/_lib/session-manager.ts

/**
 * Session Manager para Change Journal System
 *
 * Gestiona sesiones de edición lógicas.
 * Una sesión agrupa cambios relacionados temporalmente.
 *
 * Propósitos:
 * - Debugging: Identificar cambios por sesión
 * - Auditoría: Histórico de sesiones
 * - Cleanup: Detectar sesiones abandonadas
 */

const SESSION_STORAGE_KEY = 'journal:session'
const SESSION_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutos

export interface Session {
  /** ID único de la sesión */
  id: string

  /** Timestamp de inicio */
  startedAt: number

  /** Timestamp de última actividad */
  lastActivityAt: number

  /** Timestamp de fin (si terminó) */
  endedAt?: number

  /** Razón de fin */
  endReason?: 'commit' | 'discard' | 'timeout' | 'manual'
}

class SessionManager {
  private currentSession: Session | null = null

  /**
   * Obtiene o crea sesión actual
   */
  getCurrentSession(): Session {
    if (!this.currentSession || this.isExpired(this.currentSession)) {
      this.currentSession = this.createNewSession()
      this.persistSession(this.currentSession)
    }

    // Actualizar última actividad
    this.currentSession.lastActivityAt = Date.now()
    this.persistSession(this.currentSession)

    return this.currentSession
  }

  /**
   * Obtiene ID de sesión actual
   */
  getCurrentSessionId(): string {
    return this.getCurrentSession().id
  }

  /**
   * Finaliza sesión actual
   */
  endSession(reason: Session['endReason'] = 'manual'): void {
    if (!this.currentSession) return

    this.currentSession.endedAt = Date.now()
    this.currentSession.endReason = reason

    // Guardar historial (opcional)
    this.archiveSession(this.currentSession)

    // Limpiar sesión actual
    this.currentSession = null
    this.clearPersistedSession()
  }

  /**
   * Regenera sesión (después de apply/discard/commit)
   */
  regenerateSession(reason: Session['endReason']): string {
    this.endSession(reason)
    return this.getCurrentSessionId()
  }

  /**
   * Verifica si sesión está expirada
   */
  private isExpired(session: Session): boolean {
    const elapsed = Date.now() - session.lastActivityAt
    return elapsed > SESSION_TIMEOUT_MS
  }

  /**
   * Crea nueva sesión
   */
  private createNewSession(): Session {
    return {
      id: this.generateSessionId(),
      startedAt: Date.now(),
      lastActivityAt: Date.now()
    }
  }

  /**
   * Genera ID único de sesión
   */
  private generateSessionId(): string {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 9)
    return `${timestamp}-${random}`
  }

  /**
   * Persiste sesión en sessionStorage
   */
  private persistSession(session: Session): void {
    if (typeof sessionStorage === 'undefined') return
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
  }

  /**
   * Recupera sesión persistida
   */
  private loadPersistedSession(): Session | null {
    if (typeof sessionStorage === 'undefined') return null

    const stored = sessionStorage.getItem(SESSION_STORAGE_KEY)
    if (!stored) return null

    try {
      return JSON.parse(stored) as Session
    } catch {
      return null
    }
  }

  /**
   * Limpia sesión persistida
   */
  private clearPersistedSession(): void {
    if (typeof sessionStorage === 'undefined') return
    sessionStorage.removeItem(SESSION_STORAGE_KEY)
  }

  /**
   * Archiva sesión en historial (opcional - para debugging)
   */
  private archiveSession(session: Session): void {
    // TODO: Implementar si se necesita historial de sesiones
    // Podría guardarse en IndexedDB en tabla 'sessions'
    console.log('[SessionManager] Session archived:', session)
  }
}

// Singleton instance
export const sessionManager = new SessionManager()

/**
 * Hook para usar session manager
 */
export function useSession() {
  return {
    getCurrentSessionId: () => sessionManager.getCurrentSessionId(),
    endSession: (reason?: Session['endReason']) =>
      sessionManager.endSession(reason),
    regenerateSession: (reason: Session['endReason']) =>
      sessionManager.regenerateSession(reason)
  }
}
```

### 4.3 Draft Writer (Refinado con Retry Logic)

```typescript
// src/shared/change-journal/_lib/draft-writer.ts (refinado)

import {
  addChangeEntry,
  getJournalEntries,
  getDraftCount,
  clearJournal
} from './db'
import { sessionManager } from './session-manager'
import type { ChangeEntry, SectionName, DraftWriter } from './types'

/**
 * Configuración de retry para writes
 */
interface RetryConfig {
  maxRetries: number
  delayMs: number
  backoffMultiplier: number
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  delayMs: 500,
  backoffMultiplier: 2
}

/**
 * Cola de retry para writes fallidos
 */
class RetryQueue {
  private queue: Array<{
    entry: Omit<ChangeEntry, 'id'>
    retries: number
    resolve: (id: number) => void
    reject: (error: Error) => void
  }> = []

  private processing = false

  async add(entry: Omit<ChangeEntry, 'id'>): Promise<number> {
    return new Promise((resolve, reject) => {
      this.queue.push({ entry, retries: 0, resolve, reject })
      this.processQueue()
    })
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) return

    this.processing = true

    while (this.queue.length > 0) {
      const item = this.queue[0]

      try {
        const id = await addChangeEntry(item.entry)
        item.resolve(id)
        this.queue.shift()
      } catch (error) {
        item.retries++

        if (item.retries >= DEFAULT_RETRY_CONFIG.maxRetries) {
          item.reject(new Error('Max retries exceeded'))
          this.queue.shift()
        } else {
          // Exponential backoff
          const delay =
            DEFAULT_RETRY_CONFIG.delayMs *
            Math.pow(DEFAULT_RETRY_CONFIG.backoffMultiplier, item.retries - 1)
          await new Promise((resolve) => setTimeout(resolve, delay))
        }
      }
    }

    this.processing = false
  }
}

const retryQueue = new RetryQueue()

/**
 * Crea un draft writer tipado para una sección
 */
export function createDraftWriter<
  TSection extends SectionName,
  TActions extends Record<string, unknown>
>(section: TSection): DraftWriter<TSection, TActions> {
  const write = async <TAction extends keyof TActions>(
    action: TAction,
    key: string | undefined,
    payload: TActions[TAction],
    meta?: { originalUpdatedAt?: string }
  ): Promise<number> => {
    const entry: Omit<ChangeEntry, 'id'> = {
      section,
      action: action as string,
      key,
      payload,
      meta: {
        createdAt: Date.now(),
        originalUpdatedAt: meta?.originalUpdatedAt,
        sessionId: sessionManager.getCurrentSessionId()
      }
    }

    // Intentar write con retry
    try {
      return await retryQueue.add(entry)
    } catch (error) {
      console.error('[DraftWriter] Failed to write entry after retries:', error)
      throw error
    }
  }

  const getEntries = (): Promise<ChangeEntry[]> => {
    return getJournalEntries(section)
  }

  const count = (): Promise<number> => {
    return getDraftCount(section)
  }

  const clear = (): Promise<void> => {
    return clearJournal(section)
  }

  return { section, write, getEntries, count, clear }
}

/**
 * Crea versión debounced del writer
 */
export function createDebouncedWriter<
  TSection extends SectionName,
  TActions extends Record<string, unknown>
>(
  writer: DraftWriter<TSection, TActions>,
  delayMs: number = 500
): DraftWriter<TSection, TActions> & { flush: () => Promise<void> } {
  // Map de acción+key a timeout
  const timeouts = new Map<string, NodeJS.Timeout>()

  const write = <TAction extends keyof TActions>(
    action: TAction,
    key: string | undefined,
    payload: TActions[TAction],
    meta?: { originalUpdatedAt?: string }
  ): Promise<number> => {
    return new Promise((resolve, reject) => {
      const timeoutKey = `${String(action)}-${key ?? 'undefined'}`

      // Cancelar timeout anterior
      const existingTimeout = timeouts.get(timeoutKey)
      if (existingTimeout) {
        clearTimeout(existingTimeout)
      }

      // Crear nuevo timeout
      const timeout = setTimeout(async () => {
        try {
          const id = await writer.write(action, key, payload, meta)
          timeouts.delete(timeoutKey)
          resolve(id)
        } catch (error) {
          timeouts.delete(timeoutKey)
          reject(error)
        }
      }, delayMs)

      timeouts.set(timeoutKey, timeout)
    })
  }

  /**
   * Flush all pending writes
   */
  const flush = (): Promise<void> => {
    return new Promise((resolve) => {
      const timeoutPromises: Promise<void>[] = []

      for (const timeout of timeouts.values()) {
        timeoutPromises.push(
          new Promise((resolveTimeout) => {
            clearTimeout(timeout)
            resolveTimeout()
          })
        )
      }

      Promise.all(timeoutPromises).then(() => resolve())
    })
  }

  return {
    ...writer,
    write,
    flush
  }
}
```

### 4.4 Hook useDraftWriter (NUEVO)

```typescript
// src/shared/change-journal/hooks/useDraftWriter.ts

import { useCallback, useRef, useEffect } from 'react'
import type { DraftWriter, SectionName } from '../_lib/types'

/**
 * Hook para usar DraftWriter en componentes React
 */
export function useDraftWriter<
  TSection extends SectionName,
  TActions extends Record<string, unknown>
>(writer: DraftWriter<TSection, TActions> & { flush?: () => Promise<void> }) {
  const writerRef = useRef(writer)

  // Actualizar ref si writer cambia
  useEffect(() => {
    writerRef.current = writer
  }, [writer])

  /**
   * Write con manejo de errores
   */
  const write = useCallback(
    async <TAction extends keyof TActions>(
      action: TAction,
      key: string | undefined,
      payload: TActions[TAction],
      meta?: { originalUpdatedAt?: string }
    ) => {
      try {
        const id = await writerRef.current.write(action, key, payload, meta)
        return { success: true, id }
      } catch (error) {
        console.error('[useDraftWriter] Write failed:', error)
        // TODO: Mostrar notificación al usuario
        return { success: false, error: error as Error }
      }
    },
    []
  )

  /**
   * Handler para onBlur que flushea pending writes
   */
  const onBlurHandler = useCallback(async () => {
    if (writerRef.current.flush) {
      await writerRef.current.flush()
    }
  }, [])

  /**
   * Cleanup al unmount - flush pending writes
   */
  useEffect(() => {
    return () => {
      if (writerRef.current.flush) {
        writerRef.current.flush()
      }
    }
  }, [])

  return {
    write,
    onBlurHandler,
    getEntries: writer.getEntries,
    count: writer.count,
    clear: writer.clear
  }
}
```

### 4.5 Ejemplo de Uso - Sección Organización

```typescript
// src/app/(authenticated)/(admin)/organizacion/_lib/draft.ts

import {
  createDraftWriter,
  createDebouncedWriter
} from '@/shared/change-journal'
import { SECTION_NAMES } from '@/shared/change-journal/lib/sections'
import type {
  UpdateFieldPayload,
  CreatePayload,
  UpdateRecordPayload,
  DeletePayload
} from '@/shared/change-journal/lib/types'

/**
 * Tipos específicos de Organización
 */

// Campos actualizables de organización
type OrganizacionField = 'nombre' | 'descripcion' | 'mision' | 'vision'

// Mapa de acciones de Organización
interface OrganizacionActions {
  // Actualizar campo de organización
  'update-field': UpdateFieldPayload<OrganizacionField, string>

  // Crear miembro de equipo
  'equipo-create': CreatePayload<{
    nombre: string
    cargo: string
    rrss: string
  }>

  // Actualizar miembro de equipo
  'equipo-update': UpdateRecordPayload<
    number,
    'nombre' | 'cargo' | 'rrss',
    string
  >

  // Eliminar miembro de equipo
  'equipo-delete': DeletePayload<
    number,
    {
      nombre: string
      cargo: string
      rrss: string
    }
  >
}

/**
 * Draft writer de Organización (sin debounce)
 */
export const organizacionDraft = createDraftWriter<
  typeof SECTION_NAMES.ORGANIZACION,
  OrganizacionActions
>(SECTION_NAMES.ORGANIZACION)

/**
 * Draft writer con debounce (para inputs)
 */
export const organizacionDraftDebounced = createDebouncedWriter(
  organizacionDraft,
  500 // 500ms debounce
)

/**
 * Helpers tipados para escribir al journal
 */

export async function writeFieldChange(
  field: OrganizacionField,
  value: string,
  oldValue: string,
  originalUpdatedAt?: string
): Promise<number> {
  return organizacionDraftDebounced.write(
    'update-field',
    undefined, // No key - es cambio de la organización misma
    { field, value, oldValue },
    { originalUpdatedAt }
  )
}

export async function writeEquipoCreate(data: {
  nombre: string
  cargo: string
  rrss: string
}): Promise<{ entryId: number; tempId: string }> {
  const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

  const entryId = await organizacionDraft.write(
    'equipo-create',
    tempId, // Key = tempId para tracking
    { tempId, data }
  )

  return { entryId, tempId }
}

export async function writeEquipoUpdate(
  id: number,
  field: 'nombre' | 'cargo' | 'rrss',
  value: string,
  oldValue: string
): Promise<number> {
  return organizacionDraft.write(
    'equipo-update',
    `equipo-${id}`, // Key = equipo-{id}
    { id, field, value, oldValue }
  )
}

export async function writeEquipoDelete(
  id: number,
  data: { nombre: string; cargo: string; rrss: string }
): Promise<number> {
  return organizacionDraft.write('equipo-delete', `equipo-${id}`, {
    id,
    deletedData: data
  })
}

/**
 * Helpers de consulta
 */

export async function getOrganizacionDraftEntries() {
  return organizacionDraft.getEntries()
}

export async function getOrganizacionDraftCount() {
  return organizacionDraft.count()
}

export async function clearOrganizacionDraft() {
  return organizacionDraft.clear()
}
```

---

## 5. MÓDULO 1.5: UI STATE (INDEPENDIENTE)

### 5.1 Arquitectura del Módulo

**Propósito**: Módulo independiente para UI State que NO depende de Journal ni Commit.
Permite crear stores de UI State para secciones que pueden o no usar journal.

```
/shared/ui-state/
  /_lib/
    types.ts                 # ⚠️ NUEVO - UIState interfaces
    factory.ts               # ⚠️ NUEVO - createUIStateStore factory
  /hooks/
    useUIState.ts            # ⚠️ NUEVO - Hook genérico (opcional)
  index.ts                   # API pública
```

### 5.2 UI State Types (NUEVO)

```typescript
// src/shared/ui-state/_lib/types.ts

/**
 * Patrón de 3 capas para UI State
 *
 * Este pattern permite:
 * - Comparar cambios contra datos remotos
 * - Aplicar change entries sin perder ediciones actuales
 * - Rollback granular (descartar layer 2 o 3 independientemente)
 * - Performance (solo re-render cuando cambia layer relevante)
 *
 * @template TData - Tipo de datos completos (ej: OrganizacionData)
 * @template TForm - Tipo de datos de formulario (ej: OrganizacionFormData)
 */
export interface UIState<TData, TForm = TData> {
  /**
   * LAYER 1: Datos remotos originales del servidor
   *
   * - Se setea al inicializar desde Server Component
   * - NO cambia hasta nuevo fetch del servidor
   * - Es la "fuente de verdad" para comparaciones
   */
  remoteData: TData | null

  /**
   * LAYER 2: Cambios aplicados desde el journal
   *
   * - Se setea cuando usuario hace "Apply" en notification
   * - Son los cambios que vienen de change entries previos
   * - Se limpian al hacer commit exitoso
   */
  appliedChanges: Partial<TForm> | null

  /**
   * LAYER 3: Ediciones actuales en memoria
   *
   * - Se actualiza en onChange de inputs
   * - Son cambios que AÚN NO están en journal
   * - Se persisten a journal con debounce/onBlur
   */
  currentEdits: Partial<TForm> | null
}

/**
 * Helpers para UI State
 */
export interface UIStateHelpers<TData, TForm = TData> {
  /**
   * COMPUTED: Datos que ve el usuario (merge de 3 layers)
   *
   * Orden de precedencia: currentEdits > appliedChanges > remoteData
   */
  getEffectiveData(): TData | TForm | null

  /**
   * COMPUTED: Si hay cambios desde journal pendientes de aplicar
   */
  hasUnappliedJournal(): boolean

  /**
   * COMPUTED: Si hay ediciones actuales sin guardar
   */
  hasUnsavedEdits(): boolean

  /**
   * Setea datos remotos (layer 1)
   */
  setRemoteData(data: TData | null): void

  /**
   * Aplica cambios desde journal (layer 2)
   */
  applyJournalChanges(data: Partial<TForm>): void

  /**
   * Setea ediciones actuales (layer 3)
   */
  setCurrentEdits(formData: Partial<TForm> | null): void

  /**
   * Resetea todo a estado inicial
   */
  reset(): void
}
```

### 5.3 UI State Factory (NUEVO)

```typescript
// src/shared/ui-state/_lib/factory.ts

import { create } from 'zustand'
import type { UIState, UIStateHelpers } from './types'

/**
 * Factory para crear UI State store tipado
 *
 * @template TData - Tipo de datos de la sección
 * @template TForm - Tipo de datos de formulario (default = TData)
 *
 * @example
 * const useOrganizacionUIState = createUIStateStore<OrganizacionData, OrganizacionForm>()
 */
export function createUIStateStore<TData, TForm = TData>() {
  return create<UIState<TData, TForm> & UIStateHelpers<TData, TForm>>(
    (set, get) => ({
      // ==================== Estado inicial ====================
      remoteData: null,
      appliedChanges: null,
      currentEdits: null,

      // ==================== Helpers computados ====================
      getEffectiveData() {
        const { remoteData, appliedChanges, currentEdits } = get()

        if (currentEdits !== null) {
          // Si hay edits actuales, mergeamos todo
          return {
            ...(remoteData || {}),
            ...(appliedChanges || {}),
            ...currentEdits
          } as TForm
        }

        if (appliedChanges !== null) {
          // Si hay cambios aplicados del journal
          return {
            ...(remoteData || {}),
            ...appliedChanges
          } as TForm
        }

        // Solo datos remotos
        return remoteData
      },

      hasUnappliedJournal() {
        const { appliedChanges, currentEdits } = get()
        // Hay journal pendiente si appliedChanges NO es null y no hay edits actuales
        return appliedChanges !== null && currentEdits === null
      },

      hasUnsavedEdits() {
        const { currentEdits } = get()
        return currentEdits !== null
      },

      // ==================== Acciones ====================
      setRemoteData(data: TData | null) {
        set({ remoteData: data })
      },

      applyJournalChanges(data: Partial<TForm>) {
        set((state) => ({
          appliedChanges:
            state.appliedChanges === null
              ? data
              : { ...state.appliedChanges, ...data }
        }))
      },

      setCurrentEdits(formData: Partial<TForm> | null) {
        set({ currentEdits: formData })
      },

      reset() {
        set({
          remoteData: null,
          appliedChanges: null,
          currentEdits: null
        })
      }
    })
  )
}
```

### 5.4 Exports Públicos

```typescript
// src/shared/ui-state/index.ts

export { createUIStateStore } from './_lib/factory'
export type { UIState, UIStateHelpers } from './_lib/types'
```

### 5.5 Ejemplo de Uso

```typescript
// src/app/(authenticated)/(admin)/organizacion/_store/useOrganizacionUIState.ts

import { createUIStateStore } from '@/shared/ui-state'
import type { OrganizacionData, OrganizacionForm } from '../_types'

/**
 * UI State store de Organización
 *
 * Usa el factory para crear un store tipado con 3 layers.
 */
export const useOrganizacionUIState = createUIStateStore<
  OrganizacionData,
  OrganizacionForm
>()

/**
 * Selectores granulares (para performance)
 */

// Selector de datos efectivos
export const useOrganizacionData = () =>
  useOrganizacionUIState((state) => state.getEffectiveData())

// Selector de si hay journal pendiente
export const useHasUnappliedJournal = () =>
  useOrganizacionUIState((state) => state.hasUnappliedJournal())

// Selector de si hay ediciones sin guardar
export const useHasUnsavedEdits = () =>
  useOrganizacionUIState((state) => state.hasUnsavedEdits())
```

---

## 6. MÓDULO 2: JOURNAL UI STORE

### 6.1 Arquitectura del Módulo

```
/shared/change-journal-ui/
  /store/
    journalUIStore.ts        # ⚠️ MEJORAR - Granularidad por sección
  /components/
    DraftNotification.tsx    # Notification al reload
    DraftBadge.tsx           # Badge de "X cambios"
    ApplyDiscardDialog.tsx   # ⚠️ NUEVO - Dialog para apply/discard
  /hooks/
    useJournalUI.ts          # ⚠️ NUEVO - Hook conveniente
  index.ts
```

### 6.2 Change Journal UI Store (Refinado con Granularidad)

```typescript
// src/shared/change-journal-ui/store/journalUIStore.ts (refinado)

'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { SectionName } from '@/shared/change-journal'

/**
 * Estado de aplicación de cambios por sección
 */
export interface SectionAppliedState {
  /** Si los cambios de esta sección están aplicados */
  isApplied: boolean

  /** Timestamp de cuándo se aplicaron */
  appliedAt?: number

  /** Cantidad de entries que se aplicaron */
  entriesCount?: number
}

/**
 * Change Journal UI Store
 */
interface JournalUIState {
  /**
   * Map de sección → estado de aplicación
   */
  appliedSections: Map<SectionName, SectionAppliedState>

  /**
   * Session ID actual (para detectar nueva sesión)
   */
  sessionId: string

  /**
   * Timestamp de última acción apply/discard
   */
  lastActionAt: number

  /**
   * Acciones
   */
  markAsApplied: (section: SectionName, entriesCount: number) => void
  markAsDiscarded: (section: SectionName) => void
  markAllAsApplied: (
    sections: Array<{ section: SectionName; entriesCount: number }>
  ) => void
  clearAll: () => void
  isApplied: (section: SectionName) => boolean
  shouldShowNotification: (
    section: SectionName,
    hasJournalChanges: boolean
  ) => boolean
  regenerateSession: () => void
}

export const useJournalUI = create<JournalUIState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      appliedSections: new Map(),
      sessionId: generateSessionId(),
      lastActionAt: Date.now(),

      // Acciones
      markAsApplied: (section, entriesCount) => {
        set((state) => {
          const newAppliedSections = new Map(state.appliedSections)
          newAppliedSections.set(section, {
            isApplied: true,
            appliedAt: Date.now(),
            entriesCount
          })

          return {
            appliedSections: newAppliedSections,
            lastActionAt: Date.now()
          }
        })
      },

      markAsDiscarded: (section) => {
        set((state) => {
          const newAppliedSections = new Map(state.appliedSections)
          newAppliedSections.delete(section)

          return {
            appliedSections: newAppliedSections,
            lastActionAt: Date.now()
          }
        })
      },

      markAllAsApplied: (sections) => {
        set((state) => {
          const newAppliedSections = new Map(state.appliedSections)

          for (const { section, entriesCount } of sections) {
            newAppliedSections.set(section, {
              isApplied: true,
              appliedAt: Date.now(),
              entriesCount
            })
          }

          return {
            appliedSections: newAppliedSections,
            lastActionAt: Date.now()
          }
        })
      },

      clearAll: () => {
        set({
          appliedSections: new Map(),
          lastActionAt: Date.now()
        })
      },

      isApplied: (section) => {
        const state = get().appliedSections.get(section)
        return state?.isApplied ?? false
      },

      shouldShowNotification: (section, hasJournalChanges) => {
        // Si no hay cambios en journal, no mostrar
        if (!hasJournalChanges) return false

        // Si ya están aplicados en esta sesión, no mostrar
        const isApplied = get().isApplied(section)
        if (isApplied) return false

        // Hay cambios y no están aplicados → mostrar
        return true
      },

      regenerateSession: () => {
        set({
          sessionId: generateSessionId(),
          lastActionAt: Date.now()
        })
      }
    }),
    {
      name: 'change-journal-ui-state',
      storage: createJSONStorage(() => localStorage),
      // Serializar Map correctamente
      partialize: (state) => ({
        appliedSections: Array.from(state.appliedSections.entries()),
        sessionId: state.sessionId,
        lastActionAt: state.lastActionAt
      }),
      // Deserializar Map correctamente
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray(state.appliedSections)) {
          state.appliedSections = new Map(state.appliedSections as any)
        }
      }
    }
  )
)

function generateSessionId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 9)
  return `${timestamp}-${random}`
}
```

### 6.3 Hook Conveniente (NUEVO)

```typescript
// src/shared/change-journal-ui/hooks/useJournalUI.ts

import { useCallback } from 'react'
import { useJournalUI as useJournalUIStore } from '../store/journalUIStore'
import type { SectionName } from '@/shared/change-journal'

/**
 * Hook conveniente para usar Change Journal UI Store
 */
export function useJournalUI() {
  const store = useJournalUIStore()

  /**
   * Aplica cambios de una sección
   */
  const applySection = useCallback(
    (section: SectionName, entriesCount: number) => {
      store.markAsApplied(section, entriesCount)
    },
    [store]
  )

  /**
   * Descarta cambios de una sección
   */
  const discardSection = useCallback(
    async (section: SectionName) => {
      // Limpiar journal de la sección
      const { clearJournal } = await import('@/shared/change-journal/lib/db')
      await clearJournal(section)

      // Limpiar estado de aplicación
      store.markAsDiscarded(section)
    },
    [store]
  )

  /**
   * Aplica todas las secciones con cambios
   */
  const applyAll = useCallback(
    async (
      sectionsWithChanges: Array<{ section: SectionName; entriesCount: number }>
    ) => {
      store.markAllAsApplied(sectionsWithChanges)
    },
    [store]
  )

  /**
   * Descarta todas las secciones con cambios
   */
  const discardAll = useCallback(async () => {
    // Limpiar todo el journal
    const { clearJournal } = await import('@/shared/change-journal/lib/db')
    await clearJournal() // Sin sección = clear all

    // Limpiar estado de aplicación
    store.clearAll()
  }, [store])

  return {
    // Estado
    isApplied: store.isApplied,
    shouldShowNotification: store.shouldShowNotification,

    // Acciones
    applySection,
    discardSection,
    applyAll,
    discardAll,

    // Internal
    regenerateSession: store.regenerateSession,
    clearAll: store.clearAll
  }
}
```

### 6.4 Componente DraftNotification (Refinado)

```typescript
// src/shared/change-journal-ui/components/DraftNotification.tsx

'use client'

import { useEffect, useState } from 'react'
import { useJournalUI } from '../hooks/useJournalUI'
import { getDraftCount } from '@/shared/change-journal/lib/db'
import type { SectionName } from '@/shared/change-journal'

interface DraftNotificationProps {
  /** Sección a monitorear */
  section: SectionName

  /** Callback cuando se aplican cambios */
  onApply?: (entriesCount: number) => void

  /** Callback cuando se descartan cambios */
  onDiscard?: () => void
}

/**
 * Notificación de cambios pendientes
 */
export function DraftNotification({
  section,
  onApply,
  onDiscard
}: DraftNotificationProps) {
  const { shouldShowNotification, applySection, discardSection } = useJournalUI()
  const [entriesCount, setEntriesCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // Check journal al montar
  useEffect(() => {
    async function checkJournal() {
      const count = await getDraftCount(section)
      setEntriesCount(count)
      setLoading(false)
    }

    checkJournal()
  }, [section])

  // Determinar si mostrar
  const shouldShow = !loading && shouldShowNotification(section, entriesCount > 0)

  if (!shouldShow) return null

  const handleApply = async () => {
    applySection(section, entriesCount)
    onApply?.(entriesCount)
  }

  const handleDiscard = async () => {
    await discardSection(section)
    onDiscard?.()
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-blue-900">
              Cambios pendientes
            </h3>
            <p className="mt-1 text-sm text-blue-700">
              Tienes {entriesCount} cambio{entriesCount !== 1 ? 's' : ''} sin guardar en esta sección.
            </p>

            <div className="mt-3 flex gap-2">
              <button
                onClick={handleApply}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700"
              >
                Aplicar cambios
              </button>

              <button
                onClick={handleDiscard}
                className="px-3 py-1.5 bg-white border border-blue-300 text-blue-700 text-sm font-medium rounded hover:bg-blue-50"
              >
                Descartar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

## 7. MÓDULO 3: UI STATE POR SECCIÓN (USANDO UI-STATE)

### 7.1 Patrón de Uso - Sección específica con UI State Factory

```typescript
// src/app/(authenticated)/(admin)/[seccion]/_store/use[Seccion]UIState.ts

'use client'

import { createUIStateStore } from '@/shared/ui-state'
import type { SectionData, SectionForm } from '../_types'

/**
 * UI State store de la sección usando el factory
 */
export const useSectionUIState = createUIStateStore<SectionData, SectionForm>()

/**
 * Selectores granulares (para performance)
 */

// Datos efectivos (merge de 3 layers)
export const useSectionData = () =>
  useSectionUIState((state) => state.getEffectiveData())

// Campo específico
export const useSectionField = <K extends keyof SectionForm>(field: K) =>
  useSectionUIState((state) => {
    const data = state.getEffectiveData()
    return data ? data[field] : undefined
  })

// Flags de estado
export const useHasUnappliedJournal = () =>
  useSectionUIState((state) => state.hasUnappliedJournal())

export const useHasUnsavedEdits = () =>
  useSectionUIState((state) => state.hasUnsavedEdits())
```

### 7.2 Hook Bridge UI ↔ Journal

```typescript
// src/app/(authenticated)/(admin)/[seccion]/_hooks/use[Seccion]Draft.ts

'use client'

import { useCallback } from 'react'
import { useSectionUIState } from '../_store/useSectionUIState'
import { writeSectionChange } from '../_lib/draft'
import type { SectionForm } from '../_types'

/**
 * Hook bridge entre UI State y Journal
 */
export function useSectionDraft(originalUpdatedAt?: string) {
  const remoteData = useSectionUIState((state) => state.remoteData)
  const currentEdits = useSectionUIState((state) => state.currentEdits)
  const setCurrentEdits = useSectionUIState((state) => state.setCurrentEdits)
  const effectiveData = useSectionUIState((state) => state.getEffectiveData())

  /**
   * Actualiza campo
   */
  const setField = useCallback(
    async <K extends keyof SectionForm>(field: K, value: SectionForm[K]) => {
      // 1. Update UI State (optimistic) - layer 3
      const newEdits = { ...(currentEdits || {}), [field]: value }
      setCurrentEdits(newEdits)

      // 2. Get old value from remote data or applied changes
      const oldValue = remoteData ? remoteData[field] : undefined

      // 3. Write to journal (debounced)
      await writeSectionChange(
        field as string,
        value,
        oldValue,
        originalUpdatedAt
      )
    },
    [remoteData, currentEdits, setCurrentEdits, originalUpdatedAt]
  )

  return {
    setField,
    displayData: effectiveData
  }
}
```

---

**[Continúa en IMPLEMENTATION_PLAN_PART3.md →]**
