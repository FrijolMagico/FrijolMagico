# Hooks compartidos

Colección de hooks de utilidad global y sincronización de estado para el panel administrativo.

## Hooks de sincronización

| Hook | Propósito |
| :--- | :--- |
| `useJournalRestore` | Recupera operaciones de IndexedDB al montar, hidrata el store, y registra el callback de descarte en `DiscardRegistry`. |
| `useDirtySync` | **Productor** del dirty read model; escribe cambios en `useSectionDirtyStore`. |
| `useProjectionSync` | Vincula el `operationStore` con el `projectionStore` para reactividad local. |
| `useRouteChanges` | Monitorea estado dirty por ruta y delega el descarte al `DiscardRegistry`. Devuelve solo `{ isDirty, discardAll }`. |
| `useFractionalDnD` | Lógica de reordenamiento usando indexación fraccional para `dnd-kit`. |

## Detalles de implementación

### `useJournalRestore`

Hook de hidratación per-entidad. Gestiona la restauración de operaciones desde IndexedDB.

- **Suscripción**: Utiliza una suscripción Zustand vanilla sobre `appliedOperations` del `operationStore` para detectar cambios externos.
- **`isDiscarding`**: Flag interno que previene re-hidrataciones durante la ejecución de `discardAll` (la suscripción Zustand se dispara al limpiar el store, pero IndexedDB puede no estar vacío aún).
- **DiscardRegistry**: Al montar, registra su función `discardAll` en `useDiscardRegistry`. Al desmontar, se desregistra automáticamente.
- **Retorna**: `void` — los callers (store-initializers) no necesitan el resultado.

### `useDirtySync`

Es el responsable de mantener la integridad del "Dirty Read Model".

- Evalúa recursivamente el estado de `isNew`, `isUpdated` y `isDeleted` de cada entidad en un `projectionStore`.
- Sincroniza el resultado con el store global de secciones sucias para habilitar advertencias de navegación y botones de guardado.

### `useRouteChanges`

Hook de nivel de ruta. Agrega el estado dirty de múltiples entidades y orquesta el descarte.

- **`isDirty`**: `true` si cualquier entidad de la ruta tiene cambios pendientes (via `useSectionDirtyStore`).
- **`discardAll`**: Llama `useDiscardRegistry.discardEntities(entities)` — el registry invoca el `discardAll` de cada `useJournalRestore` registrado para las entidades de la ruta.
- **Sin eventos DOM**: El mecanismo de comunicación es el `DiscardRegistry`, no el bus de eventos `journal-changed`.
