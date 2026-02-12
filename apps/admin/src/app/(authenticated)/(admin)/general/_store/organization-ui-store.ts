import { createEntityUIStateStore } from '@/shared/ui-state'
import type { EntityOperation } from '@/shared/ui-state'
import { Organization } from '../_types'
import { ORGANIZATION_SECTION_NAME } from '../_constants'

/**
 * Función placeholder para escribir al journal.
 *
 * TODO: Implementar conectores reales cuando el sistema de journal esté listo.
 * Por ahora solo loguea los cambios a consola para debugging.
 *
 * @param operation - Operación de entidad (ADD, UPDATE, DELETE)
 */
async function writeOrganizationJournal(
  operation: EntityOperation<Organization>
) {
  console.log('[organizationUIStore] Writing to journal:', operation)

  // TODO: Conectar con /shared/change-journal cuando esté implementado
  // await writeChangeEntry({
  //   section: 'organizacion',
  //   action: operation.type,
  //   payload: operation
  // })
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
 *    │       └── Console.log (por ahora)
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
