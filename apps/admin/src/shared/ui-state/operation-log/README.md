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
- `resetStore()` — limpia TODO el estado: pending + persisted + meta. **Usar en flujos de descarte** para garantizar atomicidad y prevenir que `useAutoCommit` re-escriba operaciones pendientes al desmontar.

## Uso típico

```typescript
const store = createEntityOperationStore<T>({
  commitOperations: async (ops) => await writeToIndexedDB(ops)
})
```

## Nota sobre el descarte

Durante el descarte de cambios, siempre usar `resetStore()` en lugar de `clearPersistedOperations()`. La razón: `clearPersistedOperations()` solo limpia las operaciones ya persistidas en IndexedDB, pero deja `pendingOperations` intactas. El hook `useAutoCommit` llama `commitPendingOperations()` en su cleanup de unmount — si hay pendientes sin limpiar, pueden re-escribirse a IndexedDB después del descarte.
