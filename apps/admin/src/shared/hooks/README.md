# Shared Hooks

Hooks de React compartidos entre módulos del panel de administración. Todos son hooks de efecto puro — no renderizan nada, solo sincronizan estado.

## Hooks

| Hook                | Propósito                                                                                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `useJournalRestore` | Hidrata el operation store desde IndexedDB al montar. Detecta entradas persistidas y carga las operaciones en memoria.                                       |
| `useDirtySync`      | **Productor del dirty read model.** Suscribe un projection store a `useSectionDirtyStore` — cuando `byId` tiene net changes, emite `setDirty(entity, true)`. |
| `useProjectionSync` | Suscribe el operation store al projection store — cuando `persistedOperations` o `pendingOperations` cambia, llama `project()`.                              |
| `useRouteChanges`   | Agrega dirty state de múltiples entidades a nivel de ruta. Lee `useSectionDirtyStore` y expone `isDirty`, `discardAll`.                                      |
| `useFractionalDnd`  | Utilitario para drag-and-drop con índices fraccionales.                                                                                                      |

## `useJournalRestore` — detalles

Usa **suscripción Zustand vanilla** sobre `persistedOperations` del `operationStore` para detectar cambios:

```typescript
operationStore.subscribe((state, prevState) => {
  if (state.persistedOperations !== prevState.persistedOperations) {
    checkAndHydrate()
  }
})
```

Reemplaza el patrón anterior de `window.addEventListener('journal-changed', ...)`.

**Guard `isDiscarding`**: previene que la suscripción llame `checkAndHydrate()` mientras `discardAll()` está activo — `clearPersistedOperations()` dispara la suscripción síncronamente, pero IndexedDB aún no está limpio en ese punto.

No usar en entidades de solo lectura (e.g. `ARTISTA_HISTORIAL`).
