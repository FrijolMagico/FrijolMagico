# Plan de Implementación - Parte 1: Fundamentos y Decisiones

**Versión**: 1.0  
**Fecha**: Febrero 2026  
**Estado**: Pendiente de revisión

---

## 📋 ÍNDICE GENERAL

### Parte 1 (Este archivo)

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Decisiones sobre Dudas del System Design](#2-decisiones-sobre-dudas-del-system-design)
3. [Arquitectura de Tipos y Contratos](#3-arquitectura-de-tipos-y-contratos)

### Parte 2 (IMPLEMENTATION_PLAN_PART2.md)

4. Módulo 1: Change Journal System
5. Módulo 2: Change Journal UI Store
6. Módulo 3: UI State (por sección)

### Parte 3 (IMPLEMENTATION_PLAN_PART3.md)

7. Módulo 4: Commit System
8. Módulo 5: Server Actions
9. Integración Completa
10. Performance y Optimizaciones
11. Testing Strategy
12. Migration Plan

---

## 1. RESUMEN EJECUTIVO

### 1.1 Arquitectura General

Este sistema implementa una arquitectura de 3 capas claramente separadas para manejo de edición multi-sección con persistencia temporal:

```
┌─────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  CAPA 1: UI STATE (Zustand)                                 │
│  ─────────────────────────────────────────────────────────  │
│  • Estado reactivo visual por sección                       │
│  • 3 layers: remote + applied + current                     │
│  • Selectors granulares                                     │
│  • NO persiste directamente                                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  CAPA 2: JOURNAL SYSTEM (IndexedDB)                         │
│  ─────────────────────────────────────────────────────────  │
│  • Log estructurado de intenciones                          │
│  • Append-only (no updates a entries)                       │
│  • Persistencia en IndexedDB (Dexie)                        │
│  • BroadcastChannel para multi-tab                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  CAPA 3: COMMIT SYSTEM (Server Actions)                     │
│  ─────────────────────────────────────────────────────────  │
│  • Orquestador de persistencia                              │
│  • Validación por capas                                     │
│  • Transacciones por sección                                │
│  • Conflict detection                                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE (Drizzle ORM)                    │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Principios Fundamentales

**NUNCA mezclar responsabilidades entre capas:**

- **UI State** = Representación (qué ve el usuario)
- **Journal** = Intención (qué quiere cambiar)
- **Commit** = Verdad persistente (qué se guarda en DB)

**Características clave:**

- ✅ Edición offline con persistencia local
- ✅ Multi-sección con estado consistente
- ✅ Apply/Discard de cambios pendientes
- ✅ Conflict detection básica
- ✅ Guardado coordinado global
- ✅ Type-safe en todas las capas
- ❌ NO es Event Sourcing completo
- ❌ NO hay autosave implícito
- ❌ NO hay sincronización bidireccional

### 1.3 Flujo de Datos Completo

```typescript
// 1. INICIALIZACIÓN (Server → Client)
Server Component
  → fetch data from DB
  → pass to Client Component
  → UI State.initializeWithRemoteData(data)
  → Check Journal for pending changes
  → If exists: show DraftNotification

// 2. EDICIÓN (Client)
User types in input
  → onChange: UI State.updateField(field, value)  // Inmediato
  → debounce(500ms) → Journal.write(entry)        // Background
  → UI shows "modified" indicator

// 3. RELOAD/NAVIGATE (Client)
New route loads
  → UI State.initializeWithRemoteData(remoteData)
  → Check JournalUIStore.isApplied(section)
  → If NOT applied: show DraftNotification
  → If applied: UI State.applyJournalChanges(journalData)

// 4. APPLY CHANGES (Client)
User clicks "Apply" in DraftNotification
  → Read Journal.getEntries(section)
  → Parse entries → create Partial<FormData>
  → UI State.applyJournalChanges(parsedData)
  → JournalUIStore.markAsApplied(section)
  → User sees edited values in UI

// 5. SAVE/COMMIT (Client → Server)
User clicks "Save All"
  → GlobalSave.saveAll()
  → For each dirty section:
    - Get Journal.getEntries(section)
    - Validate entries
    - Call Server Action with entries
  → Server Action:
    - Execute interpreters in order
    - Transaction per section
    - Revalidate cache
  → On success:
    - Journal.clear(section)
    - UI State.markAsSaved(newRemoteData)
    - Show success toast
```

---

## 2. DECISIONES SOBRE DUDAS DEL SYSTEM DESIGN

### 2.1 ❓ sectionName: ¿Exponer nombre de tablas y asignarlas como ID?

**✅ DECISIÓN: Usar enums tipados que mapean a lógica de negocio**

**Alternativas consideradas:**

- A) Usar nombre de tabla DB directamente → ❌ Acopla lógica a implementación DB
- B) Identificadores independientes → ❌ Desconexión semántica
- C) Enums tipados como wrapper → ✅ **SELECCIONADA**

**Razones:**

1. **Type safety**: TypeScript valida en compile time
2. **Refactoring-friendly**: Si tabla DB cambia, solo cambiamos el enum
3. **Autodocumentación**: Lista explícita de secciones disponibles
4. **Sin abstracción excesiva**: Nomenclatura consistente con dominio

**Implementación:**

```typescript
// src/shared/change-journal/_lib/sections.ts
export const SECTION_NAMES = {
  ORGANIZACION: 'organizacion',
  CATALOGO_ENTRY: 'catalogo-entry',
  ARTISTA: 'artista',
  EVENTO: 'evento'
  // Agregar nuevas secciones aquí
} as const

export type SectionName = (typeof SECTION_NAMES)[keyof typeof SECTION_NAMES]

// Validación runtime
export function isValidSection(section: string): section is SectionName {
  return Object.values(SECTION_NAMES).includes(section as SectionName)
}

// Helper para cada sección
export const SECTION_CONFIG: Record<
  SectionName,
  { displayName: string; icon?: string }
> = {
  [SECTION_NAMES.ORGANIZACION]: { displayName: 'Organización' },
  [SECTION_NAMES.CATALOGO_ENTRY]: { displayName: 'Catálogo' },
  [SECTION_NAMES.ARTISTA]: { displayName: 'Artistas' },
  [SECTION_NAMES.EVENTO]: { displayName: 'Eventos' }
}
```

---

### 2.2 ❓ oldValue: ¿Es realmente necesario? ¿Qué casos de uso resuelve?

**✅ DECISIÓN: Mantener oldValue como campo OPCIONAL**

**Casos de uso donde SÍ es útil:**

1. **Conflict detection**: Comparar con valor del servidor
2. **Auditoría visual**: Mostrar diff "antes → después" en UI de revisión
3. **Rollback manual**: Usuario ve qué cambió antes de descartar
4. **Debugging**: Histórico de cambios completo

**Casos donde NO es necesario:**

- Actions tipo `create` (no hay valor anterior)
- Actions tipo `delete` (solo necesitamos ID)
- Commit final (solo se persiste newValue)

**Implementación:**

```typescript
// En types.ts
export interface ChangeEntry {
  // ...
  payload: {
    // Para updates
    field?: string
    value?: unknown // Nuevo valor (siempre presente en updates)
    oldValue?: unknown // ⚠️ OPCIONAL - valor anterior

    // Para creates
    data?: unknown // Datos del registro nuevo

    // Para deletes
    id: string // ID del registro a eliminar
    deletedData?: unknown // ⚠️ OPCIONAL - datos del registro eliminado (para restaurar)
  }
}
```

**UX Benefit - Mostrar cambios antes de guardar:**

```tsx
// Componente de revisión antes de commit
<div className='change-review'>
  <h3>Cambios pendientes de guardar:</h3>
  {entries.map((entry) => (
    <div key={entry.id}>
      <span className='field'>{entry.payload.field}</span>
      <span className='old'>{entry.payload.oldValue}</span>
      <span className='arrow'>→</span>
      <span className='new'>{entry.payload.value}</span>
    </div>
  ))}
</div>
```

---

### 2.3 ❓ Orden de entries: ¿Qué pasa cuando usuario edita campo A, luego B, luego vuelve a A?

**✅ DECISIÓN: Append-only, procesar en orden cronológico estricto**

**Escenario:**

```
T1: User edita 'nombre': "Viejo" → "Nuevo1"
T2: User edita 'descripcion': "..." → "..."
T3: User edita 'nombre': "Nuevo1" → "Nuevo2"
```

**Alternativas:**

- A) Crear múltiples entries (append-only) → ✅ **SELECCIONADA**
- B) Actualizar entry existente → ❌ Perdemos historial, lógica compleja

**Resultado en Journal:**

```typescript
;[
  { id: 1, field: 'nombre', value: 'Nuevo1', createdAt: T1 },
  { id: 2, field: 'descripcion', value: '...', createdAt: T2 },
  { id: 3, field: 'nombre', value: 'Nuevo2', createdAt: T3 } // Nuevo entry
]
```

**Razones:**

1. **Simplicidad**: No hay lógica de búsqueda/merge de entries
2. **Debugging**: Histórico completo visible
3. **Idempotencia**: Aplicar N veces da mismo resultado
4. **Event sourcing pattern**: Standard en la industria
5. **Commit System maneja orden**: Ya procesa cronológicamente

**Commit System aplicará:**

```sql
-- Entry 1 (T1)
UPDATE organizacion SET nombre = 'Nuevo1' WHERE id = 1;

-- Entry 2 (T2)
UPDATE organizacion SET descripcion = '...' WHERE id = 1;

-- Entry 3 (T3) - Sobrescribe entry 1
UPDATE organizacion SET nombre = 'Nuevo2' WHERE id = 1;
```

El resultado final es correcto: `{ nombre: 'Nuevo2', descripcion: '...' }`

---

### 2.4 ❓ Prioridad de acciones: ¿Usuario edita un registro y posteriormente lo elimina?

**✅ DECISIÓN: Orden cronológico estricto (sin optimización inicial)**

**Escenario problemático:**

```
T1: UPDATE equipo SET nombre = 'Juan Pérez' WHERE id = 5
T2: UPDATE equipo SET cargo = 'Senior Dev' WHERE id = 5
T3: DELETE FROM equipo WHERE id = 5
```

**Alternativas:**

- A) Aplicar todo en orden → ✅ **SELECCIONADA para MVP**
- B) Análisis de dependencias + optimización → 🔮 **Fase posterior**
- C) Priorización por tipo de acción → ❌ Rompe cronología

**Razones para A:**

1. **Correctitud sobre performance**: El resultado final es correcto
2. **Simplicidad**: Sin lógica de análisis compleja
3. **Predecibilidad**: Orden cronológico es intuitivo
4. **Debugging**: Fácil de rastrear
5. **Los UPDATEs "desperdiciados" no afectan performance significativamente**

**Para el futuro (Fase de Optimización):**

```typescript
// Detectar conflictos: UPDATE + DELETE del mismo ID
function analyzeConflicts(entries: ChangeEntry[]): OptimizedPlan {
  const byKey = groupBy(entries, (e) => e.key)

  for (const [key, keyEntries] of Object.entries(byKey)) {
    const hasDelete = keyEntries.some((e) => e.action === 'delete')
    const hasUpdates = keyEntries.some((e) => e.action === 'update')

    if (hasDelete && hasUpdates) {
      // Optimización: Solo ejecutar DELETE, ignorar UPDATEs previos
      return {
        optimized: true,
        entries: keyEntries.filter((e) => e.action === 'delete')
      }
    }
  }

  return { optimized: false, entries }
}
```

---

### 2.5 ❓ UI para Commit System: ¿Dónde mantener lógica de UI?

**✅ DECISIÓN: Feature-based con folders privados (\_folder pattern)**

**Estructura:**

```
/shared/change-commit/         # Feature completa
  /_lib/                       # Lógica privada
    commit-executor.ts
    validators.ts
    conflict-detector.ts
  /_store/                     # Store privado
    useGlobalSave.ts
  /components/                 # UI pública
    CommitButton.tsx
    CommitNotification.tsx
    SectionCommitIndicator.tsx
  /hooks/                      # Hooks públicos
    useCommitStatus.ts
    useSectionCommit.ts
  index.ts                     # API pública (exports)
```

**Razones:**

1. **Aligns con Next.js App Router**: Patrón `_folder` es idiomático
2. **API clara**: `index.ts` expone solo lo necesario
3. **Encapsulación**: Implementación interna privada por convención
4. **Testeable**: Feature como unidad independiente
5. **Consistente**: Ya usamos este patrón en routes
6. **Screaming Architecture**: "change-commit" comunica claramente su responsabilidad (commitear cambios)

**API pública exportada:**

```typescript
// /shared/change-commit/index.ts
export { CommitButton } from './components/CommitButton'
export { CommitNotification } from './components/CommitNotification'
export { useCommitStatus } from './hooks/useCommitStatus'
export { useSectionCommit } from './hooks/useSectionCommit'

// NO exportar:
// - useGlobalSave (store interno)
// - commit-executor (lógica privada)
// - validators (helpers internos)
```

---

## 3. ARQUITECTURA DE TIPOS Y CONTRATOS

### 3.1 Core Types - Section System

```typescript
// src/shared/change-journal/_lib/sections.ts

/**
 * Identificadores de secciones del sistema
 *
 * Cada sección representa una entidad de negocio que puede tener
 * cambios pendientes en el journal.
 */
export const SECTION_NAMES = {
  /** Información de la organización (única) */
  ORGANIZACION: 'organizacion',

  /** Entradas del catálogo (múltiples) */
  CATALOGO_ENTRY: 'catalogo-entry',

  /** Artistas (múltiples) */
  ARTISTA: 'artista',

  /** Eventos (múltiples) */
  EVENTO: 'evento'
} as const

export type SectionName = (typeof SECTION_NAMES)[keyof typeof SECTION_NAMES]

/**
 * Configuración de cada sección
 */
export interface SectionConfig {
  /** Identificador único */
  name: SectionName

  /** Nombre para mostrar en UI */
  displayName: string

  /** Ícono opcional */
  icon?: string

  /** Si la sección es singleton (una sola entidad) o múltiple */
  isSingleton: boolean

  /** Tags de cache de Next.js para revalidar */
  cacheTags: string[]
}

export const SECTION_CONFIG: Record<SectionName, SectionConfig> = {
  [SECTION_NAMES.ORGANIZACION]: {
    name: SECTION_NAMES.ORGANIZACION,
    displayName: 'Organización',
    isSingleton: true,
    cacheTags: ['organizacion', 'equipo']
  },
  [SECTION_NAMES.CATALOGO_ENTRY]: {
    name: SECTION_NAMES.CATALOGO_ENTRY,
    displayName: 'Catálogo',
    isSingleton: false,
    cacheTags: ['catalogo']
  },
  [SECTION_NAMES.ARTISTA]: {
    name: SECTION_NAMES.ARTISTA,
    displayName: 'Artistas',
    isSingleton: false,
    cacheTags: ['artistas']
  },
  [SECTION_NAMES.EVENTO]: {
    name: SECTION_NAMES.EVENTO,
    displayName: 'Eventos',
    isSingleton: false,
    cacheTags: ['eventos']
  }
}
```

### 3.2 Core Types - Journal Entry (Refinado)

```typescript
// src/shared/change-journal/_lib/types.ts

/**
 * Tipos de acciones soportadas en el journal
 *
 * Cada sección define sus propias acciones específicas,
 * pero estos son los tipos base comunes.
 */
export type ChangeActionType =
  | 'create' // Crear nuevo registro
  | 'update' // Actualizar registro existente
  | 'delete' // Eliminar registro
  | 'reorder' // Cambiar orden
  | 'toggle' // Toggle de boolean (ej: published)

/**
 * Entrada del journal - Representa una intención de cambio
 *
 * El journal es append-only: nunca se editan entries, solo se agregan.
 *
 * @template TPayload - Tipo específico del payload (cada sección define el suyo)
 */
export interface ChangeEntry<TPayload = unknown> {
  /**
   * ID único asignado por IndexedDB (auto-incremental)
   * Undefined al crear, asignado por Dexie al persistir
   */
  id?: number

  /**
   * Identificador de la sección
   * @see SectionName para valores válidos
   */
  section: SectionName

  /**
   * Tipo de acción (específico por sección)
   * Ejemplos: 'update-field', 'equipo-create', 'artista-toggle-published'
   */
  action: string

  /**
   * Identificador lógico opcional del registro afectado
   *
   * - Para cambios en registros específicos: ID del registro (ej: 'artista-123')
   * - Para cambios globales de sección: undefined (ej: actualizar nombre de organización)
   * - Para nuevos registros: tempId generado por cliente (ej: 'temp-uuid-abc')
   */
  key?: string

  /**
   * Datos específicos del cambio
   * Cada sección define su propio tipo de payload
   */
  payload: TPayload

  /**
   * Metadata del entry
   */
  meta: {
    /**
     * Timestamp de creación del entry (Date.now())
     * Usado para ordenar entries cronológicamente
     */
    createdAt: number

    /**
     * Timestamp original del servidor (ISO string)
     * Usado para conflict detection al hacer commit
     *
     * @example "2025-01-01T10:00:00.000Z"
     */
    originalUpdatedAt?: string

    /**
     * ID de sesión de edición
     * Agrupa cambios por sesión lógica de edición
     * Útil para debugging y auditoría
     *
     * @see SessionManager
     */
    sessionId?: string
  }
}

/**
 * Payload para acciones de tipo 'update' de campos
 */
export interface UpdateFieldPayload<
  TField extends string = string,
  TValue = unknown
> {
  /** Campo a actualizar */
  field: TField

  /** Nuevo valor */
  value: TValue

  /** Valor anterior (opcional, para auditoría) */
  oldValue?: TValue
}

/**
 * Payload para acciones de tipo 'create'
 */
export interface CreatePayload<TData = unknown> {
  /** ID temporal generado por cliente */
  tempId: string

  /** Datos del nuevo registro */
  data: TData
}

/**
 * Payload para acciones de tipo 'update' de registros completos
 */
export interface UpdateRecordPayload<
  TId = string | number,
  TField extends string = string,
  TValue = unknown
> {
  /** ID del registro a actualizar */
  id: TId

  /** Campo a actualizar */
  field: TField

  /** Nuevo valor */
  value: TValue

  /** Valor anterior (opcional) */
  oldValue?: TValue
}

/**
 * Payload para acciones de tipo 'delete'
 */
export interface DeletePayload<TId = string | number, TData = unknown> {
  /** ID del registro a eliminar */
  id: TId

  /** Datos del registro eliminado (opcional, para restaurar) */
  deletedData?: TData
}

/**
 * Payload para acciones de tipo 'reorder'
 */
export interface ReorderPayload<TId = string | number> {
  /** ID del registro reordenado */
  id: TId

  /** Índice anterior */
  previousIndex: number

  /** Nuevo índice */
  newIndex: number

  /** Nuevo valor de campo de orden (opcional) */
  newOrder?: string | number
}

/**
 * Payload para acciones de tipo 'toggle'
 */
export interface TogglePayload<
  TId = string | number,
  TField extends string = string
> {
  /** ID del registro */
  id: TId

  /** Campo booleano a togglear */
  field: TField

  /** Nuevo valor */
  value: boolean

  /** Valor anterior */
  oldValue: boolean
}

/**
 * DraftWriter interface (tipado por sección)
 */
export interface DraftWriter<
  TSection extends SectionName,
  TActions extends Record<string, unknown>
> {
  /** Nombre de la sección */
  section: TSection

  /**
   * Escribe un nuevo entry al journal
   */
  write: <TAction extends keyof TActions>(
    action: TAction,
    key: string | undefined,
    payload: TActions[TAction],
    meta?: { originalUpdatedAt?: string }
  ) => Promise<number>

  /**
   * Obtiene todos los entries de esta sección
   */
  getEntries: () => Promise<ChangeEntry[]>

  /**
   * Cuenta entries de esta sección
   */
  count: () => Promise<number>

  /**
   * Limpia todos los entries de esta sección
   */
  clear: () => Promise<void>
}
```

### 3.4 Core Types - Commit System

```typescript
// src/shared/change-commit/_lib/types.ts

import type { SectionName } from '@/shared/change-journal'

/**
 * Resultado de una operación de Server Action
 */
export interface ActionReturn<TData = unknown> {
  /** Si la operación fue exitosa */
  success: boolean

  /** Mensaje de error si falló */
  error?: string

  /** Código de error tipado */
  errorCode?: 'VALIDATION_ERROR' | 'CONFLICT' | 'DB_ERROR' | 'UNKNOWN'

  /** Datos retornados (opcional) */
  data?: TData

  /** Metadata adicional */
  meta?: {
    /** Timestamp de la operación */
    timestamp?: number

    /** Entries procesados */
    processedCount?: number

    /** Entries fallidos */
    failedCount?: number
  }
}

/**
 * Función de guardado de una sección
 *
 * Esta función:
 * 1. Lee change entries de la sección
 * 2. Valida entries
 * 3. Llama a Server Action con entries
 * 4. Limpia journal si éxito
 * 5. Retorna resultado
 */
export type SaveFunction = () => Promise<ActionReturn>

/**
 * Estado de una sección en el sistema de guardado
 */
export type SaveSectionStatus =
  | 'idle' // Sin cambios
  | 'dirty' // Con cambios pendientes
  | 'saving' // Guardando en progreso
  | 'saved' // Guardado exitoso reciente
  | 'error' // Error en último guardado

/**
 * Información de una sección registrada
 */
export interface SaveSection {
  /** Identificador único de la sección */
  id: SectionName

  /** Nombre para mostrar en UI */
  displayName: string

  /** Estado actual */
  status: SaveSectionStatus

  /** Mensaje de error si existe */
  error?: string

  /** Timestamp del último cambio */
  lastModified?: number

  /** Timestamp del último guardado exitoso */
  lastSaved?: number

  /** Número de cambios pendientes */
  pendingChangesCount: number
}

/**
 * Configuración para registrar una sección
 */
export interface RegisterSectionConfig {
  /** Identificador de la sección */
  id: SectionName

  /** Nombre para mostrar */
  displayName: string

  /** Función que ejecuta el guardado */
  saveFunction: SaveFunction

  /** Función que determina si hay cambios */
  hasChanges: () => boolean | Promise<boolean>

  /** Función que retorna conteo de cambios */
  getChangesCount?: () => number | Promise<number>

  /** IDs de secciones que deben guardarse antes (dependencias) */
  dependencies?: SectionName[]
}

/**
 * Resultado de una operación de guardado global
 */
export interface GlobalSaveResult {
  /** Si todos los guardados fueron exitosos */
  success: boolean

  /** Resultados individuales por sección */
  sectionResults: Map<SectionName, ActionReturn>

  /** Errores por sección */
  errors: Map<SectionName, string>

  /** Secciones guardadas exitosamente */
  savedSections: SectionName[]

  /** Secciones que fallaron */
  failedSections: SectionName[]

  /** Timestamp de inicio */
  startedAt: number

  /** Timestamp de fin */
  completedAt: number
}

/**
 * Opciones para operación de guardado
 */
export interface SaveOptions {
  /** Guardar solo secciones específicas (default: todas dirty) */
  sectionIds?: SectionName[]

  /** Continuar con otras secciones si una falla (default: true) */
  continueOnError?: boolean

  /** Ejecutar en paralelo o secuencial (default: false - secuencial) */
  parallel?: boolean

  /** Mostrar notificaciones toast (default: true) */
  showNotifications?: boolean

  /** Callback de progreso */
  onProgress?: (section: SectionName, status: SaveSectionStatus) => void
}

/**
 * Resultado de validación de journal
 */
export interface ValidationResult {
  /** Si la validación pasó */
  valid: boolean

  /** Errores de validación */
  errors: ValidationError[]

  /** Warnings (no bloquean guardado) */
  warnings: string[]
}

/**
 * Error de validación
 */
export interface ValidationError {
  /** ID del entry que falló */
  entryId: number

  /** Sección del entry */
  section: SectionName

  /** Campo que falló (opcional) */
  field?: string

  /** Mensaje de error */
  message: string

  /** Código de error */
  code: string
}

/**
 * Resultado de detección de conflictos
 */
export interface ConflictDetectionResult {
  /** Si hay conflictos */
  hasConflicts: boolean

  /** Conflicts detectados */
  conflicts: Conflict[]
}

/**
 * Conflicto detectado
 */
export interface Conflict {
  /** Entry en conflicto */
  entryId: number

  /** Sección */
  section: SectionName

  /** Campo en conflicto */
  field: string

  /** Valor que queríamos escribir */
  ourValue: unknown

  /** Valor actual en DB */
  theirValue: unknown

  /** updatedAt que teníamos */
  ourUpdatedAt: string

  /** updatedAt actual en DB */
  theirUpdatedAt: string
}
```

---

**[Continúa en IMPLEMENTATION_PLAN_PART2.md →]**
