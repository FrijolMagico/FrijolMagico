import { createEntityUIStateStore } from '@/shared/ui-state/entity-state'
import type { EntityOperation } from '@/shared/ui-state/entity-state'
import { writeEntry } from '@/shared/change-journal/change-journal'
import { Organization } from '../_types'
import { ORGANIZATION_SECTION_NAME } from '../_constants'

/**
 * Escribe cambios de Organización al change-journal.
 *
 * Mapea EntityOperations a entradas de journal con estructura:
 * - section: 'organizacion' (scope lógico)
 * - scopeKey: Para ADD/DELETE: 'organizacion:org-123'
 * - scopeKey: Para UPDATE: 'organizacion:org-123:field'
 * - payload: Operación transformada a journal format
 *
 * @param operation - Operación de entidad (ADD, UPDATE, DELETE)
 */
async function writeOrganizationJournal(
  operation: EntityOperation<Organization>
): Promise<void> {
  const section = ORGANIZATION_SECTION_NAME

  switch (operation.type) {
    case 'ADD':
      await writeEntry(section, `${section}:${operation.id}`, {
        op: 'set',
        value: operation.entity
      })
      break

    case 'UPDATE':
      if (operation.data) {
        for (const [field, value] of Object.entries(operation.data)) {
          await writeEntry(section, `${section}:${operation.id}:${field}`, {
            op: 'set',
            value
          })
        }
      }
      break

    case 'DELETE':
      await writeEntry(section, `${section}:${operation.id}`, { op: 'unset' })
      break
  }
}

/**
 * Store de Entity UI State para la sección de Organización.
 *
 * Este store usa la nueva Entity State Factory con modo **singleton**,
 * porque Organización es un objeto individual (no una colección).
 *
 * ## Uso Básico
 *
 * ```tsx
 * import { useOrgUIStore } from './_store/organization-ui-store'
 *
 * function MyComponent() {
 *   // Selector específico (recomendado)
 *   const org = useOrgUIStore((state) => state.selectOne())
 *
 *   // O usar actions
 *   const update = useOrgUIStore((state) => state.update)
 *
 *   return (
 *     <input
 *       value={org?.nombre ?? ''}
 *       onChange={(e) => update({ nombre: e.target.value })}
 *     />
 *   )
 * }
 * ```
 *
 * ## Hooks Recomendados
 *
 * Para evitar repetir selectores, usar los hooks de `../_hooks/use-organization-ui`:
 *
 * ```tsx
 * import {
 *   useOrganizationUI,
 *   useOrganizationHasChanges,
 *   useOrganizationActions
 * } from '../_hooks/use-organization-ui'
 *
 * function SaveButton() {
 *   const hasChanges = useOrganizationHasChanges()
 *   const { commitCurrentEdits } = useOrganizationActions()
 *
 *   return (
 *     <button disabled={!hasChanges} onClick={commitCurrentEdits}>
 *       Guardar
 *     </button>
 *   )
 * }
 * ```
 *
 * ## Flujo de Datos (3-Layer State)
 *
 * ```
 * Servidor (Organizacion)
 *    │
 *    ▼
 * set(data) ──> LAYER 1 (remoteData)
 *    │
 *    ▼
 * Usuario edita campo
 *    │
 *    ▼
 * update({ field: value }) ──> LAYER 3 (currentEdits)
 *    │
 *    ▼
 * selectOne() ──> Merge LAYER 1 + 2 + 3
 *    │
 *    ▼
 * onBlur / debounce
 *    │
 *    ▼
 * commitCurrentEdits()
 *    │
 *    ├──> writeOrganizationJournal(operation)
 *    │       └── Escribe a change-journal
 *    │
 *    └──> LAYER 3 ──> LAYER 2 (appliedChanges)
 * ```
 *
 * ## API Singleton
 *
 * **Modo Singleton** (`isSingleton: true`) simplifica el manejo de objetos individuales:
 *
 * ```typescript
 * // Setear datos del servidor
 * store.set(organizacionData)  // Wrapper que llama setRemoteData([data])
 *
 * // Actualizar campos (sin necesidad de especificar ID)
 * store.update({ nombre: 'Nuevo' })  // Automático para singleton
 *
 * // Obtener datos efectivos
 * const org = store.selectOne()  // Organizacion | null
 *
 * // Verificar cambios
 * const hasChanges = store.getHasChanges()       // Layer 2 + 3
 * const hasUnsaved = store.getHasUnsavedEdits()  // Solo Layer 3
 *
 * // Persistencia
 * await store.commitCurrentEdits()  // Layer 3 → Layer 2 + journal
 * ```
 *
 * ## Tipado
 *
 * - `T`: `Organizacion` - Tipo completo desde base de datos
 * - `idField`: `'id'` - Campo que actúa como clave primaria
 * - `isSingleton`: `true` - Indica que es un objeto individual
 *
 * ## Layer State
 *
 * - **Layer 1 (remoteData)**: Datos originales del servidor
 * - **Layer 2 (appliedChanges)**: Edits comprometidos (post-journal)
 * - **Layer 3 (currentEdits)**: Edits actuales (pre-commit)
 *
 * Los selectores (`selectOne()`, `getEffectiveData()`) devuelven el merge
 * automático de las 3 capas, con Layer 3 teniendo la mayor prioridad.
 */
export const useOrganizationUIStore = createEntityUIStateStore<Organization>({
  sectionName: ORGANIZATION_SECTION_NAME,
  idField: 'id',
  isSingleton: true,
  writeToJournal: writeOrganizationJournal
})
