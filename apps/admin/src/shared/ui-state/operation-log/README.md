# Operation Log

Cola de operaciones de usuario para el sistema de journal. Captura intenciones (ADD/UPDATE/DELETE/RESTORE) antes de que sean persistidas al servidor.

## Fábrica

`createEntityOperationStore<T>()` — retorna un Zustand store con:

- `pendingOperations` — operaciones aún no escritas en IndexedDB
- `persistedOperations` — operaciones recuperadas de IndexedDB o tras commit
- `add / update / remove` — agregan operaciones a `pendingOperations`
- `commitPendingOperations(commitFn)` — mueve pending → persisted y dispara la suscripción Zustand
- `hydratePersistedOperations(ops)` — carga operaciones restauradas desde IndexedDB
- `clearPersistedOperations()` — limpia solo `persistedOperations` (NO limpia pending)
- `resetStore()` — limpia TODO el estado: pending + persisted + meta. **Usar en flujos de descarte** para garantizar atomicidad.

## Nota sobre el descarte

Siempre usar `resetStore()` en lugar de `clearPersistedOperations()` al descartar cambios. La razón: `clearPersistedOperations()` deja `pendingOperations` intactas. El hook `useAutoCommit` llama `commitPendingOperations()` en su cleanup de unmount — si hay pendientes sin limpiar, pueden re-escribirse a IndexedDB después del descarte.
