# UI State Module

Este módulo implementa el sistema de estado optimista para el panel de administración. Resuelve la reconciliación de cambios locales con datos del servidor sin mutar el estado remoto prematuramente.

## Propósito

Permite una experiencia fluida donde el usuario ve sus cambios (ADD, UPDATE, DELETE) de inmediato, mientras estos se mantienen en un log de operaciones pendiente de ser persistido en el servidor.

## Arquitectura y Fábricas

El sistema se divide en dos stores de Zustand y un conjunto de hooks orquestadores:

1. **Operation Log (`createEntityOperationStore`)**:
   - Mantiene una cola secuencial de cambios pendientes.
   - Gestiona operaciones `ADD`, `UPDATE`, `DELETE` y `RESTORE`.
   - Se usa para capturar las intenciones del usuario.

2. **Projection Engine (`createProjectionStore`)**:
   - Sistema de proyección de datos: genera una vista coherente combinando el snapshot del servidor + el log de operaciones.
   - Realiza reconciliación "net-zero": si un cambio manual devuelve una entidad a su estado original del servidor, limpia los flags de edición.

## Flujo de Datos

`Snapshot Servidor → operationStore → projectionStore → Vista UI`

- `useProjectionSync`: conecta operationStore ↔ projectionStore — re-calcula la proyección cuando cambian operaciones o datos remotos.
- `useDirtySync`: conecta projectionStore → `useSectionDirtyStore` (dirty read model global) — notifica si hay cambios netos pendientes.
- **Flujo de descarte**: `RouteSaveToolbar onDiscard → useRouteChanges.discardAll() → DiscardRegistry → useJournalRestore.discardAll() por entidad → clearSection (IndexedDB) + resetStore (Zustand)`

## Archivos Clave

- `operation-log/factory.ts`: Lógica de captura de operaciones.
- `ui-projection-engine/factory.ts`: Algoritmo de proyección y reconciliación.
- `hooks/use-projection-sync.ts`: Sincronización automática operation log → projection store.
- `hooks/use-dirty-sync.ts`: Propagación del veredicto net-change al dirty read model.
