# Plan de Implementación - Parte 3: Commit, Integración y Testing

**[← Volver a IMPLEMENTATION_PLAN_PART2.md]**

---

## 7. MÓDULO 4: COMMIT SYSTEM

### 7.1 Arquitectura del Módulo

```
/shared/change-commit/
  /_lib/
    commit-executor.ts       # ⚠️ NUEVO - Orquestador de guardado
    validators.ts            # ⚠️ NUEVO - Validación por capas
    conflict-detector.ts     # ⚠️ NUEVO - Detección de conflictos
    types.ts                 # Tipos (existente, ajustar)
  /_store/
    useGlobalSave.ts         # Store (existente, optimizar)
  /components/
    CommitButton.tsx         # Botón de guardado
    CommitNotification.tsx   # Notificación de estado
  /hooks/
    useCommitStatus.ts       # Hook de status
  index.ts                   # API pública
```

### 7.2 Commit Executor (NUEVO)

```typescript
// src/shared/change-commit/_lib/commit-executor.ts

import type { SectionName, ChangeEntry } from '@/shared/change-journal'
import type { ActionReturn, GlobalSaveResult, SaveOptions } from './types'
import { validateJournalEntries } from './validators'
import { detectConflicts } from './conflict-detector'
import { getJournalEntries, clearJournal } from '@/shared/change-journal/lib/db'

/**
 * Ejecuta commit de una sección específica
 */
export async function executeSectionCommit(
  section: SectionName,
  interpreterAction: (entries: ChangeEntry[]) => Promise<ActionReturn>
): Promise<ActionReturn> {
  console.log(`[CommitExecutor] Starting commit for section: ${section}`)

  try {
    // 1. Obtener entries del change-journal
    const entries = await getJournalEntries(section)

    if (entries.length === 0) {
      return {
        success: true,
        data: null,
        meta: { processedCount: 0, failedCount: 0 }
      }
    }

    console.log(
      `[CommitExecutor] Found ${entries.length} entries for ${section}`
    )

    // 2. Validar entries
    const validationResult = await validateJournalEntries(entries)

    if (!validationResult.valid) {
      return {
        success: false,
        error: `Validation failed: ${validationResult.errors.map((e) => e.message).join(', ')}`,
        errorCode: 'VALIDATION_ERROR'
      }
    }

    // 3. Detectar conflictos (opcional - depende de meta.originalUpdatedAt)
    const conflictResult = await detectConflicts(entries)

    if (conflictResult.hasConflicts) {
      return {
        success: false,
        error: `Conflicts detected: ${conflictResult.conflicts.length} conflict(s)`,
        errorCode: 'CONFLICT',
        data: conflictResult.conflicts
      }
    }

    // 4. Ejecutar interpreter action (transacción por sección)
    const result = await interpreterAction(entries)

    if (!result.success) {
      console.error(
        `[CommitExecutor] Interpreter failed for ${section}:`,
        result.error
      )
      return result
    }

    // 5. Limpiar journal de la sección
    await clearJournal(section)

    console.log(`[CommitExecutor] Commit successful for ${section}`)

    return {
      success: true,
      data: result.data,
      meta: {
        timestamp: Date.now(),
        processedCount: entries.length,
        failedCount: 0
      }
    }
  } catch (error) {
    console.error(`[CommitExecutor] Unexpected error for ${section}:`, error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorCode: 'UNKNOWN'
    }
  }
}

/**
 * Ejecuta commit de múltiples secciones
 */
export async function executeMultiSectionCommit(
  sections: Array<{
    section: SectionName
    interpreterAction: (entries: ChangeEntry[]) => Promise<ActionReturn>
  }>,
  options: SaveOptions = {}
): Promise<GlobalSaveResult> {
  const { continueOnError = true, parallel = false, onProgress } = options

  const result: GlobalSaveResult = {
    success: true,
    sectionResults: new Map(),
    errors: new Map(),
    savedSections: [],
    failedSections: [],
    startedAt: Date.now(),
    completedAt: 0
  }

  console.log(
    `[CommitExecutor] Starting multi-section commit: ${sections.length} sections`
  )

  if (parallel) {
    // Ejecutar en paralelo
    const promises = sections.map(({ section, interpreterAction }) =>
      executeSectionCommit(section, interpreterAction).then(
        (sectionResult) => ({ section, sectionResult })
      )
    )

    const results = await Promise.all(promises)

    for (const { section, sectionResult } of results) {
      result.sectionResults.set(section, sectionResult)

      if (sectionResult.success) {
        result.savedSections.push(section)
      } else {
        result.failedSections.push(section)
        result.errors.set(section, sectionResult.error || 'Unknown error')
        result.success = false
      }

      onProgress?.(section, sectionResult.success ? 'saved' : 'error')
    }
  } else {
    // Ejecutar secuencialmente
    for (const { section, interpreterAction } of sections) {
      onProgress?.(section, 'saving')

      const sectionResult = await executeSectionCommit(
        section,
        interpreterAction
      )
      result.sectionResults.set(section, sectionResult)

      if (sectionResult.success) {
        result.savedSections.push(section)
        onProgress?.(section, 'saved')
      } else {
        result.failedSections.push(section)
        result.errors.set(section, sectionResult.error || 'Unknown error')
        result.success = false
        onProgress?.(section, 'error')

        // Si no continuar en error, detener
        if (!continueOnError) {
          break
        }
      }
    }
  }

  result.completedAt = Date.now()

  console.log(`[CommitExecutor] Multi-section commit completed:`, {
    success: result.success,
    saved: result.savedSections.length,
    failed: result.failedSections.length,
    duration: result.completedAt - result.startedAt
  })

  return result
}
```

### 7.3 Validators (NUEVO)

```typescript
// src/shared/change-commit/_lib/validators.ts

import { z } from 'zod'
import type { ChangeEntry } from '@/shared/change-journal'
import type { ValidationResult, ValidationError } from './types'

/**
 * Schema base de ChangeEntry
 */
const journalEntrySchema = z.object({
  id: z.number().optional(),
  section: z.string().min(1),
  action: z.string().min(1),
  key: z.string().optional(),
  payload: z.any(),
  meta: z.object({
    createdAt: z.number(),
    originalUpdatedAt: z.string().optional(),
    sessionId: z.string().optional()
  })
})

/**
 * Valida estructura básica de entries
 */
function validateStructure(entries: ChangeEntry[]): ValidationError[] {
  const errors: ValidationError[] = []

  for (const entry of entries) {
    const result = journalEntrySchema.safeParse(entry)

    if (!result.success) {
      errors.push({
        entryId: entry.id || -1,
        section: entry.section,
        message: result.error.errors[0]?.message || 'Invalid structure',
        code: 'STRUCTURE_ERROR'
      })
    }
  }

  return errors
}

/**
 * Valida reglas de negocio
 */
function validateBusinessRules(entries: ChangeEntry[]): ValidationError[] {
  const errors: ValidationError[] = []

  // Ejemplo: Validar que no hay más de N creates para una sección
  const createsBySection = new Map<string, number>()

  for (const entry of entries) {
    if (entry.action.includes('create')) {
      const count = createsBySection.get(entry.section) || 0
      createsBySection.set(entry.section, count + 1)

      // Ejemplo: Máximo 10 creates por sección
      if (count >= 10) {
        errors.push({
          entryId: entry.id || -1,
          section: entry.section,
          message: 'Maximum 10 creates per section exceeded',
          code: 'MAX_CREATES_EXCEEDED'
        })
      }
    }
  }

  return errors
}

/**
 * Valida orden cronológico
 */
function validateChronologicalOrder(
  entries: ChangeEntry[]
): ValidationError[] {
  const errors: ValidationError[] = []

  let lastCreatedAt = 0

  for (const entry of entries) {
    if (entry.meta.createdAt < lastCreatedAt) {
      errors.push({
        entryId: entry.id || -1,
        section: entry.section,
        message: 'Entries are not in chronological order',
        code: 'ORDER_ERROR'
      })
    }
    lastCreatedAt = entry.meta.createdAt
  }

  return errors
}

/**
 * Valida entries del change-journal
 */
export async function validateJournalEntries(
  entries: ChangeEntry[]
): Promise<ValidationResult> {
  const errors: ValidationError[] = []
  const warnings: string[] = []

  // 1. Validar estructura
  errors.push(...validateStructure(entries))

  // 2. Validar reglas de negocio
  errors.push(...validateBusinessRules(entries))

  // 3. Validar orden cronológico (warning, no error)
  const orderErrors = validateChronologicalOrder(entries)
  if (orderErrors.length > 0) {
    warnings.push('Some entries are not in chronological order')
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}
```

### 7.4 Conflict Detector (NUEVO)

```typescript
// src/shared/change-commit/_lib/conflict-detector.ts

import { db } from '@frijolmagico/database/orm'
import type { ChangeEntry } from '@/shared/change-journal'
import type { ConflictDetectionResult, Conflict } from './types'

/**
 * Detecta conflictos comparando con DB
 */
export async function detectConflicts(
  entries: ChangeEntry[]
): Promise<ConflictDetectionResult> {
  const conflicts: Conflict[] = []

  // Solo procesar entries que tienen originalUpdatedAt
  const entriesWithTimestamp = entries.filter((e) => e.meta.originalUpdatedAt)

  if (entriesWithTimestamp.length === 0) {
    return { hasConflicts: false, conflicts: [] }
  }

  // Agrupar por sección y key
  const bySection = new Map<string, ChangeEntry[]>()

  for (const entry of entriesWithTimestamp) {
    const key = `${entry.section}:${entry.key || 'root'}`
    const existing = bySection.get(key) || []
    existing.push(entry)
    bySection.set(key, existing)
  }

  // TODO: Implementar detección real por sección
  // Por ahora, retornar sin conflictos
  // En implementación real:
  // 1. Query DB para cada section:key
  // 2. Comparar updatedAt de DB vs originalUpdatedAt de entry
  // 3. Si difieren, agregar a conflicts

  console.log(
    `[ConflictDetector] Checked ${entriesWithTimestamp.length} entries, found 0 conflicts`
  )

  return {
    hasConflicts: conflicts.length > 0,
    conflicts
  }
}
```

---

## 8. MÓDULO 5: SERVER ACTIONS

### 8.1 Patrón de Interpretadores

```typescript
// Template para Server Actions de una sección
// src/app/(authenticated)/(admin)/[seccion]/actions/draft-interpreter.actions.ts

'use server'

import { revalidateTag } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import type { ChangeEntry } from '@/shared/change-journal'
import type { ActionReturn } from '@/shared/change-commit'

/**
 * Ejecuta una acción específica basada en el entry
 */
export async function executeSectionAction(entry: ChangeEntry): Promise<void> {
  switch (entry.action) {
    case 'update-field':
      return interpretUpdateField(entry)
    case 'create':
      return interpretCreate(entry)
    case 'update':
      return interpretUpdate(entry)
    case 'delete':
      return interpretDelete(entry)
    default:
      throw new Error(`Unsupported action: ${entry.action}`)
  }
}

/**
 * Interpretador para 'update-field'
 */
async function interpretUpdateField(entry: ChangeEntry): Promise<void> {
  const { field, value } = entry.payload as any

  // TODO: Implementar update específico de la sección
  console.log(`[Interpreter] Update field: ${field} = ${value}`)

  // Revalidar cache
  revalidateTag('section-tag')
}

/**
 * Interpretador para 'create'
 */
async function interpretCreate(entry: ChangeEntry): Promise<void> {
  const { data } = entry.payload as any

  // TODO: Implementar create específico
  console.log(`[Interpreter] Create:`, data)

  revalidateTag('section-tag')
}

/**
 * Interpretador para 'update'
 */
async function interpretUpdate(entry: ChangeEntry): Promise<void> {
  const { id, field, value } = entry.payload as any

  // TODO: Implementar update específico
  console.log(`[Interpreter] Update ${id}: ${field} = ${value}`)

  revalidateTag('section-tag')
}

/**
 * Interpretador para 'delete'
 */
async function interpretDelete(entry: ChangeEntry): Promise<void> {
  const { id } = entry.payload as any

  // TODO: Implementar delete específico
  console.log(`[Interpreter] Delete: ${id}`)

  revalidateTag('section-tag')
}

/**
 * Ejecuta todos los entries de la sección
 */
export async function executeSectionDrafts(
  entries: ChangeEntry[]
): Promise<ActionReturn> {
  console.log(`[Interpreter] Processing ${entries.length} entries`)

  try {
    // Ejecutar en orden cronológico
    for (const entry of entries) {
      await executeSectionAction(entry)
    }

    return {
      success: true,
      meta: {
        processedCount: entries.length,
        failedCount: 0
      }
    }
  } catch (error) {
    console.error('[Interpreter] Error processing entries:', error)

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorCode: 'DB_ERROR'
    }
  }
}
```

---

## 9. INTEGRACIÓN COMPLETA

### 9.1 Flujo End-to-End: Organización

```typescript
// 1. Page (Server Component)
// src/app/(authenticated)/(admin)/organizacion/page.tsx

import { OrganizacionForm } from './_components/OrganizacionForm'
import { getOrganizacionData } from './_lib/queries'
import { SECTION_NAMES } from '@/shared/change-journal/lib/sections'

export default async function OrganizacionPage() {
  const data = await getOrganizacionData()

  return (
    <div>
      <h1>Organización</h1>
      <OrganizacionForm
        initialData={data}
        section={SECTION_NAMES.ORGANIZACION}
      />
    </div>
  )
}

// 2. Form Container (Client Component)
// src/app/(authenticated)/(admin)/organizacion/_components/OrganizacionForm.tsx

'use client'

import { useEffect } from 'react'
import { DraftNotification } from '@/shared/change-journal-ui'
import { CommitButton } from '@/shared/change-commit'
import { useOrganizacionForm } from '../_hooks/useOrganizacionForm'
import { useOrganizacionDraft } from '../_hooks/useOrganizacionDraft'
import { OrganizacionFormFields } from './OrganizacionFormFields'
import { SECTION_NAMES } from '@/shared/change-journal/lib/sections'
import type { OrganizacionFormData } from '../_types/organizacion'

interface OrganizacionFormProps {
  initialData: OrganizacionFormData
  section: typeof SECTION_NAMES.ORGANIZACION
}

export function OrganizacionForm({ initialData, section }: OrganizacionFormProps) {
  const { initializeWithRemoteData, applyJournalChanges } = useOrganizacionForm()

  // Inicializar con datos remotos al montar
  useEffect(() => {
    initializeWithRemoteData(initialData)
  }, [initialData, initializeWithRemoteData])

  // Handler de apply: merge journal con UI State
  const handleApplyJournal = async (entriesCount: number) => {
    // TODO: Leer change entries, parsear y aplicar a UI State
    console.log(`Applying ${entriesCount} change entries`)
  }

  // Handler de discard: resetear a datos remotos
  const handleDiscardJournal = () => {
    initializeWithRemoteData(initialData)
  }

  return (
    <div>
      {/* Notification de cambios pendientes */}
      <DraftNotification
        section={section}
        onApply={handleApplyJournal}
        onDiscard={handleDiscardJournal}
      />

      {/* Form fields */}
      <OrganizacionFormFields originalUpdatedAt={initialData.updatedAt} />

      {/* Commit button */}
      <div className="mt-8">
        <CommitButton />
      </div>
    </div>
  )
}

// 3. Form Fields (Client Component con inputs)
// src/app/(authenticated)/(admin)/organizacion/_components/OrganizacionFormFields.tsx

'use client'

import { useOrganizacionDraft } from '../_hooks/useOrganizacionDraft'
import { useIsOrganizacionFieldModified } from '../_hooks/useOrganizacionForm'
import { cn } from '@/lib/utils'

interface OrganizacionFormFieldsProps {
  originalUpdatedAt: string
}

export function OrganizacionFormFields({ originalUpdatedAt }: OrganizacionFormFieldsProps) {
  const { setField, displayData } = useOrganizacionDraft(originalUpdatedAt)

  // Selectores de campos modificados
  const isNombreModified = useIsOrganizacionFieldModified('nombre')

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="nombre" className="block text-sm font-medium mb-1.5">
          Nombre de la organización
          {isNombreModified && (
            <span className="ml-2 text-xs text-blue-600 font-normal">
              (modificado)
            </span>
          )}
        </label>
        <input
          id="nombre"
          type="text"
          value={displayData.nombre}
          onChange={(e) => setField('nombre', e.target.value)}
          className={cn(
            "w-full px-3 py-2 border rounded-md",
            isNombreModified && "border-blue-500 ring-1 ring-blue-500"
          )}
        />
      </div>

      {/* ... más campos ... */}
    </div>
  )
}
```

### 9.2 Registro en Commit System

```typescript
// src/app/(authenticated)/(admin)/organizacion/_hooks/useOrganizacionCommit.ts

'use client'

import { useEffect } from 'react'
import { useGlobalSave } from '@/shared/change-commit/_store/useGlobalSave'
import { SECTION_NAMES } from '@/shared/change-journal/lib/sections'
import {
  getOrganizacionDraftCount,
  getOrganizacionDraftEntries
} from '../_lib/draft'
import { executeSectionDrafts } from '../actions/draft-interpreter.actions'
import type { ActionReturn } from '@/shared/change-commit'

export function useOrganizacionCommit() {
  const registerSection = useGlobalSave((state) => state.registerSection)
  const unregisterSection = useGlobalSave((state) => state.unregisterSection)

  useEffect(() => {
    // Registrar sección al montar
    registerSection({
      id: SECTION_NAMES.ORGANIZACION,
      displayName: 'Organización',

      saveFunction: async (): Promise<ActionReturn> => {
        try {
          // 1. Obtener entries del change-journal
          const entries = await getOrganizacionDraftEntries()

          if (entries.length === 0) {
            return { success: true }
          }

          // 2. Ejecutar server action
          const result = await executeSectionDrafts(entries)

          return result
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            errorCode: 'UNKNOWN'
          }
        }
      },

      hasChanges: async () => {
        const count = await getOrganizacionDraftCount()
        return count > 0
      },

      getChangesCount: async () => {
        return getOrganizacionDraftCount()
      }
    })

    // Cleanup al desmontar
    return () => {
      unregisterSection(SECTION_NAMES.ORGANIZACION)
    }
  }, [registerSection, unregisterSection])
}

// Uso en OrganizacionForm:
export function OrganizacionForm({
  initialData,
  section
}: OrganizacionFormProps) {
  // ... código existente ...

  // Registrar en commit system
  useOrganizacionCommit()

  // ... resto del componente ...
}
```

---

## 10. PERFORMANCE Y OPTIMIZACIONES

### 10.1 Optimizaciones Identificadas

**1. Selectors Granulares en Zustand**

```typescript
// ❌ Malo: Re-render cuando cambia cualquier campo
const formData = useOrganizacionForm((state) => state.formData)

// ✅ Bueno: Re-render solo cuando cambia field específico
const nombre = useOrganizacionForm((state) => state.displayData.nombre)
```

**2. Debounce en Journal Writes**

```typescript
// Ya implementado en createDebouncedWriter
// 500ms debounce por defecto
```

**3. Cache de Journal Queries**

```typescript
// TODO: Implementar cache en memoria con invalidación
let journalCache: ChangeEntry[] | null = null

async function getJournalWithCache(section: string) {
  if (!journalCache) {
    journalCache = await getJournalEntries()
    subscribeToJournalChanges(() => (journalCache = null))
  }
  return journalCache.filter((e) => e.section === section)
}
```

**4. Batch Operations en Server Actions**

```typescript
// En lugar de N calls:
for (const entry of entries) {
  await executeAction(entry)
}

// Una call con batch:
await executeActionsBatch(entries)
```

**5. BroadcastChannel Debounce**

```typescript
// Debounce broadcasts para evitar overhead
const debouncedBroadcast = debounce((section: string) => {
  broadcastDraftChange(section)
}, 100)
```

---

## 11. TESTING STRATEGY

### 11.1 Unit Tests - UI State

```typescript
// test: useOrganizacionForm.test.ts
import { renderHook, act } from '@testing-library/react'
import { useOrganizacionForm } from '../_hooks/useOrganizacionForm'

describe('OrganizacionForm Store', () => {
  it('should initialize with remote data', () => {
    const { result } = renderHook(() => useOrganizacionForm())

    act(() => {
      result.current.initializeWithRemoteData({
        id: '1',
        nombre: 'Test Org',
        descripcion: '',
        mision: '',
        vision: '',
        equipo: [],
        updatedAt: '2025-01-01T00:00:00Z'
      })
    })

    expect(result.current.displayData.nombre).toBe('Test Org')
  })

  it('should update field and mark as dirty', () => {
    const { result } = renderHook(() => useOrganizacionForm())

    act(() => {
      result.current.updateField('nombre', 'Updated')
    })

    expect(result.current.displayData.nombre).toBe('Updated')
    expect(result.current.isDirty).toBe(true)
  })
})
```

### 11.2 Integration Tests - Journal

```typescript
// test: journal.test.ts
import { setupTestDB, cleanupTestDB } from './test-utils'
import { organizacionDraft } from '../_lib/draft'

describe('Journal System', () => {
  beforeEach(() => {
    setupTestDB()
  })

  afterEach(() => {
    cleanupTestDB()
  })

  it('should write entry to journal', async () => {
    await organizacionDraft.write('update-field', undefined, {
      field: 'nombre',
      value: 'New Value',
      oldValue: 'Old Value'
    })

    const entries = await organizacionDraft.getEntries()
    expect(entries).toHaveLength(1)
    expect(entries[0].action).toBe('update-field')
  })

  it('should clear journal', async () => {
    await organizacionDraft.write('update-field', undefined, {
      field: 'nombre',
      value: 'X'
    })
    await organizacionDraft.clear()

    const count = await organizacionDraft.count()
    expect(count).toBe(0)
  })
})
```

### 11.3 E2E Tests - Playwright

```typescript
// test: organizacion.e2e.test.ts
import { test, expect } from '@playwright/test'

test.describe('Organización Edit Flow', () => {
  test('should edit field and save', async ({ page }) => {
    await page.goto('/organizacion')

    // Editar campo
    await page.fill('input[name="nombre"]', 'Nueva Organización')

    // Esperar que se muestre indicador de modificado
    await expect(page.locator('text=modificado')).toBeVisible()

    // Guardar
    await page.click('button:has-text("Guardar")')

    // Esperar success
    await expect(page.locator('text=Guardado exitosamente')).toBeVisible()
  })

  test('should show draft notification after reload', async ({ page }) => {
    await page.goto('/organizacion')

    // Editar
    await page.fill('input[name="nombre"]', 'Test')

    // Esperar que se persista
    await page.waitForTimeout(600) // Debounce

    // Reload
    await page.reload()

    // Debe mostrar notification
    await expect(page.locator('text=Cambios pendientes')).toBeVisible()
  })
})
```

---

## 12. MIGRATION PLAN

### 12.1 Fase 1: Setup (Semana 1)

**Objetivos:**

- Crear estructura de carpetas
- Implementar tipos base
- Setup de testing

**Tareas:**

- [ ] Crear `/shared/change-journal/_lib/sections.ts`
- [ ] Crear `/shared/change-journal/_lib/session-manager.ts`
- [ ] Crear `/shared/ui-state/_lib/types.ts` y `factory.ts`
- [ ] Refinar tipos en `change-journal/_lib/types.ts`
- [ ] Setup Jest/Vitest para unit tests
- [ ] Setup Playwright para E2E

**Criterios de éxito:**

- Todos los tipos compilan sin errores
- Tests infrastructure funcional

---

### 12.2 Fase 2: Journal System (Semana 2)

**Objetivos:**

- Implementar session manager
- Refinar draft writer con retry logic
- Implementar hooks

**Tareas:**

- [ ] Implementar `SessionManager` class
- [ ] Refinar `createDraftWriter` con retry queue
- [ ] Implementar `createDebouncedWriter`
- [ ] Implementar `useDraftWriter` hook
- [ ] Unit tests para cada módulo

**Criterios de éxito:**

- Session manager funcional
- Retry logic funcional
- Debounce funcional
- 90%+ test coverage

---

### 12.3 Fase 3: Change Journal UI Store (Semana 3)

**Objetivos:**

- Refinar journal UI store con granularidad
- Implementar hooks y componentes
- Integrar con journal system

**Tareas:**

- [ ] Refinar `journalUIStore.ts` con tracking por sección
- [ ] Implementar `useJournalUI` hook
- [ ] Refinar `DraftNotification` component
- [ ] Implementar `ApplyDiscardDialog`
- [ ] Integration tests

**Criterios de éxito:**

- Notification muestra correctamente
- Apply/Discard funcional
- Multi-tab sync funcional

---

### 12.4 Fase 4: UI State Pattern (Semana 4)

**Objetivos:**

- Implementar patrón de 3 layers en Organización
- Crear template reutilizable
- Migrar sección Organización

**Tareas:**

- [ ] Refinar `useOrganizacionForm` con 3 layers
- [ ] Implementar `useOrganizacionDraft` bridge
- [ ] Actualizar `OrganizacionFormFields` con selectors granulares
- [ ] Documentar template para otras secciones
- [ ] Unit tests + E2E

**Criterios de éxito:**

- Organización usa 3 layers correctamente
- Performance óptima (selectores granulares)
- Tests passing

---

### 12.5 Fase 5: Commit System (Semana 5-6)

**Objetivos:**

- Implementar commit executor
- Implementar validators
- Implementar conflict detector
- Integrar con global save

**Tareas:**

- [ ] Implementar `commit-executor.ts`
- [ ] Implementar `validators.ts`
- [ ] Implementar `conflict-detector.ts`
- [ ] Refinar `useGlobalSave` store
- [ ] Integration tests

**Criterios de éxito:**

- Commit por sección funcional
- Multi-section commit funcional
- Validación funcional
- Error handling robusto

---

### 12.6 Fase 6: Server Actions (Semana 7)

**Objetivos:**

- Refinar interpretadores de Organización
- Implementar transacciones
- Implementar cache revalidation

**Tareas:**

- [ ] Refinar `draftInterpreter.actions.ts`
- [ ] Implementar transacciones por sección
- [ ] Implementar revalidation con tags
- [ ] Error handling + logging
- [ ] Integration tests con test DB

**Criterios de éxito:**

- Interpretadores ejecutan correctamente
- Transacciones rollback en error
- Cache se revalida correctamente

---

### 12.7 Fase 7: Integración y Optimización (Semana 8)

**Objetivos:**

- Integración completa end-to-end
- Optimizaciones de performance
- Testing exhaustivo

**Tareas:**

- [ ] Integrar todos los módulos en Organización
- [ ] Implementar optimizaciones identificadas
- [ ] E2E testing completo
- [ ] Performance testing
- [ ] Documentación final

**Criterios de éxito:**

- Flujo completo funcional
- Performance targets alcanzados
- Todos los tests passing
- Documentación completa

---

### 12.8 Fase 8: Migración de Catálogo (Semana 9-10)

**Objetivos:**

- Migrar Catálogo de sistema legacy a nuevo sistema
- Aplicar mismo patrón que Organización

**Tareas:**

- [ ] Crear draft writer de Catálogo
- [ ] Implementar UI State con 3 layers
- [ ] Implementar interpretadores
- [ ] Migrar componentes legacy
- [ ] Testing

**Criterios de éxito:**

- Catálogo migrado completamente
- Legacy code eliminado
- Tests passing

---

## 13. CHECKLIST DE VALIDACIÓN FINAL

Antes de considerar la implementación completa:

### ✅ Arquitectura

- [ ] Las 3 capas están claramente separadas
- [ ] No hay mezcla de responsabilidades
- [ ] Tipos TypeScript completos y correctos

### ✅ Funcionalidad

- [ ] Edición con persistencia local funciona
- [ ] Apply/Discard de cambios funciona
- [ ] Multi-sección coordinada funciona
- [ ] Guardado global funciona
- [ ] Cache revalidation funciona

### ✅ Performance

- [ ] Selectors granulares implementados
- [ ] Debounce funcional
- [ ] No hay re-renders innecesarios
- [ ] IndexedDB operations optimizadas

### ✅ UX

- [ ] Notificaciones claras
- [ ] Indicadores de estado visible
- [ ] Feedback de guardado
- [ ] Error handling amigable

### ✅ Testing

- [ ] Unit tests > 80% coverage
- [ ] Integration tests críticos
- [ ] E2E tests flujos principales
- [ ] Performance tests

### ✅ Documentación

- [ ] README actualizado
- [ ] API documentada
- [ ] Ejemplos de uso
- [ ] Guía de migración

---

## 14. CONTACTOS Y PRÓXIMOS PASOS

**Plan creado por**: AI Assistant  
**Fecha**: Febrero 2026  
**Estado**: **Pendiente de revisión**

### Próximos pasos:

1. **Revisar este plan completo** (las 3 partes)
2. **Validar decisiones** sobre las dudas
3. **Aprobar o ajustar** arquitectura propuesta
4. **Comenzar implementación** fase por fase

---

**[FIN DEL PLAN DE IMPLEMENTACIÓN]**
