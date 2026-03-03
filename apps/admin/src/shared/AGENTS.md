# Shared Modules — Knowledge Base

Local-first state management system. Operations are logged → journaled to IndexedDB → pushed to server via Server Actions. Projection engine derives UI state with change tracking.

## Structure

```
shared/
├── components/          # UI primitives + custom components
│   ├── ui/              # Shadcn/ui (27 components, Base UI primitives)
│   ├── sidebar/         # Panel sidebar (menu + user info)
│   ├── entity-form-dialog/  # Generic entity form wrapper
│   ├── rrss-manager/    # Social media links editor
│   └── *.tsx            # route-save-toolbar, rich-textarea, etc.
├── hooks/               # Synchronization hooks (all 'use client')
├── lib/                 # Glue code: registries, entity config, adapters
├── operations/          # Core: event-sourcing primitives
│   ├── journal/         # IndexedDB persistence (Dexie)
│   ├── log/             # Operation log store factory
│   └── projection/      # Projection engine factory
├── push/                # Server persistence pipeline (see push/README.md)
│   ├── hooks/           # usePush orchestrator
│   └── lib/             # validators, id-mapper, error-handler, types
└── ui-state/            # UI state factories
    ├── pagination/      # Pagination store + URL sync
    └── filters/         # Filter store factory
```

## Data Flow

```
User Action
    ↓
OperationLog (Zustand)          ← createEntityOperationStore<T>()
    ↓                               Operations: ADD | UPDATE | DELETE | RESTORE
    ├→ useJournalSync           ← Debounced write to IndexedDB (1s default)
    │       ↓                      Cursor-based dedup (lastFlushedTimestamp)
    │   Journal (IndexedDB)        Mutex prevents concurrent flush
    │
    └→ useProjectionSync        ← Subscribes to OperationLog changes
            ↓                      Replays operations on remote snapshot
        ProjectionStore         ← createProjectionStore<T>()
            ↓                      Entities get __meta: { isNew, isUpdated, isDeleted }
            ├→ useDirtySync     ← Two channels: projection (net-zero) + operation (cleanup)
            │       ↓
            │   SectionDirtyStore  → Amber dot in sidebar, save bar visibility
            │
            └→ UI Components    ← Read projected entities with __meta flags
```

### Save (Push) Flow

```
User clicks "Guardar"
    ↓
usePush.push()                  ← React transition wrapper
    ↓
1. source.read(section)         ← JournalPushSource reads IndexedDB → PushOperation[]
2. validatePushOperations()     ← Zod validation (client-side, first pass)
3. sortPushOperations()         ← DELETE → RESTORE → UPDATE → CREATE order
   └→ No-op cancellation       ← CREATE+DELETE on same entity = skip both
4. executor(sortedOps)          ← Server Action (second Zod validation server-side)
5. source.clear(section)        ← Clear IndexedDB BEFORE store cleanup
6. config.onSuccess()           ← store.cleanup() → operations=null, lastCommitAt=now
    ↓
useDirtySync fires setDirty(false) synchronously in transition
    → Save bar hides without flash
```

### Restore Flow (Page Reload)

```
useJournalRestore (on mount)
    ↓
1. Read IndexedDB entries for entity
2. Convert JournalEntry[] → EntityOperation<T>[]
3. operationStore.hydrate(operations)
    ↓
useProjectionSync picks up hydrated ops → re-projects UI
```

## Store Factories

| Factory                           | Location                 | Creates       | Purpose                                                                       |
| --------------------------------- | ------------------------ | ------------- | ----------------------------------------------------------------------------- |
| `createEntityOperationStore<T>()` | `operations/log/`        | Zustand store | Append-only operation log (add/update/remove/restore/cleanup/hydrate)         |
| `createProjectionStore<T>()`      | `operations/projection/` | Zustand store | Derived state from remote + operations. Incremental updates via hash + cursor |
| `createPaginationStore()`         | `ui-state/pagination/`   | Zustand store | Page state with boundary handling + URL sync                                  |
| `createFilterStore<T>()`          | `ui-state/filters/`      | Zustand store | Generic filter state with reset + onChange callback                           |

## Hooks Reference

| Hook                | Purpose                             | Key Detail                                                          |
| ------------------- | ----------------------------------- | ------------------------------------------------------------------- |
| `useJournalSync`    | OperationLog → IndexedDB            | Debounced (1s). Cursor dedup. Mutex. Skips post-commit reset        |
| `useProjectionSync` | OperationLog → ProjectionStore      | Re-projects on op changes + initialData changes                     |
| `useDirtySync`      | ProjectionStore → SectionDirtyStore | Two channels: projection (net-zero) + operation (immediate cleanup) |
| `useJournalRestore` | IndexedDB → OperationLog            | Mount-only. Registers discard callback                              |
| `useRouteChanges`   | Dirty tracking per route            | Orchestrates discard on navigation                                  |
| `useFractionalDnd`  | Drag-and-drop reordering            | Uses fractional-indexing for position values                        |
| `usePush`           | Push pipeline orchestrator          | 4-phase: read → validate → execute → clear                          |

## Global Registries (Zustand stores in `lib/`)

| Store                     | Purpose                                                       |
| ------------------------- | ------------------------------------------------------------- |
| `useSectionDirtyStore`    | Track which sections have unsaved changes (drives amber dots) |
| `useDiscardRegistry`      | Register entity-specific discard callbacks                    |
| `useJournalFlushRegistry` | Register entity-specific flush callbacks for pre-push         |

## Conventions

- **No barrel files** for simple re-exports. Index files only in: operations/journal, operations/log, operations/projection, ui-state/pagination, components/sidebar
- **`'use client'`** on all hooks and interactive components
- **Factory pattern** for stores — never create stores inline
- **`generateTempId()`** from `lib/utils.ts` for client-side entity IDs (prefix: `temp_`)
- **`__meta` flags** on projected entities indicate change state (isNew/isUpdated/isDeleted)
- **Post-commit reset** pattern: `operations=null` + `lastCommitAt=now` signals cleanup across all hooks

## Anti-Patterns

- **NEVER** read journal directly in components — use hooks
- **NEVER** create Zustand stores without factories for operations/projection
- **NEVER** skip `validateOperationData()` in Server Actions (double validation is mandatory)
- **NEVER** clear journal before executor confirms success
- **NEVER** call `store.cleanup()` before `source.clear()` — order matters for cursor consistency
