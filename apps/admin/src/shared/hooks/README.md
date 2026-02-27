# Hooks compartidos

Colección de hooks de utilidad global y sincronización de estado para el panel administrativo.

## Hooks de sincronización

| Hook | Propósito |
| :--- | :--- |
| `useJournalRestore` | Recupera operaciones de IndexedDB al montar y las hidrata en el store. |
| `useDirtySync` | **Productor** del dirty read model; escribe cambios en `useSectionDirtyStore`. |
| `useProjectionSync` | Vincula el `operationStore` con el `projectionStore` para reactividad local. |
| `useRouteChanges` | Monitorea estado dirty por ruta para prevenir pérdidas de datos. |
| `useFractionalDnD` | Lógica de reordenamiento usando indexación fraccional para `dnd-kit`. |

## Detalles de implementación

### `useJournalRestore`

Este hook gestiona la persistencia offline del diario de cambios (journal).

- **Suscripción**: Utiliza una suscripción Zustand vanilla sobre `persistedOperations` del `operationStore` para detectar cambios externos.
- **`isDiscarding`**: Flag interno que previene re-hidrataciones accidentales durante la ejecución de `discardAll` (cuando IndexedDB aún no se ha vaciado completamente).

### `useDirtySync`

Es el responsable de mantener la integridad del "Dirty Read Model".

- Evalúa recursivamente el estado de `isNew`, `isUpdated` y `isDeleted` de cada entidad en un `projectionStore`.
- Sincroniza el resultado con el store global de secciones sucias para habilitar advertencias de navegación y botones de guardado.
