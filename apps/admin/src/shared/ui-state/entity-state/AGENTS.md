# AGENTS.md - UI State (Entity State Factory)

Admin panel state management using Entity State Pattern.

**Generated**: 2026-02-11

## Overview

3-layer architecture for editing server data locally before persisting:

- **L1 (Remote Data)**: Immutable server data
- **L2 (Applied Changes)**: Confirmed changes (post-journal)
- **L3 (Current Edits)**: In-memory drafts (pre-commit)

Effective Data = L3 > L2 > L1 (priority merge)

## Factory Selection

| Use Case                 | Factory                    | Reason                   |
| ------------------------ | -------------------------- | ------------------------ |
| Flat objects             | `createUIStateStore`       | Simple, no normalization |
| Small collections (<50)  | `createUIStateStore`       | Sufficient overhead      |
| Large collections (200+) | `createEntityUIStateStore` | **Required**: O(1)       |
| Singleton                | `createEntityUIStateStore` | Use `isSingleton: true`  |

## Usage

### Collection Mode (e.g., Equipo)

```typescript
export const useEquipoUIStore = createEntityUIStateStore<TeamMember>({
  sectionName: 'equipo',
  idField: 'id'
})

// Component
const equipo = useEquipoUIStore((s) => s.selectAll())
const { updateOne } = useEquipoUIStore()

updateOne(id, { isDeleted: true }) // Soft delete
```

### Singleton Mode (e.g., Organización)

```typescript
export const useOrganizationUIStore = createEntityUIStateStore<Organizacion>({
  sectionName: 'organizacion',
  idField: 'id',
  isSingleton: true // Enables set() and update() without ID
})

// Component
const org = useOrganizationUIStore((s) => s.selectOne())
const { update } = useOrganizationUIStore()

update({ nombre: 'New Name' }) // No ID needed
```

## Performance

O(1) for all operations regardless of collection size:

| Operation | Target | 1000 items |
| --------- | ------ | ---------- |
| Lookup    | < 1ms  | ~0.1ms     |
| Update    | < 1ms  | ~0.2ms     |
| Delete    | < 1ms  | ~0.1ms     |
| Bulk (50) | < 16ms | ~4ms       |

## Best Practices

- **Flat interfaces only** - Merge is shallow, avoid nested objects
- **ID types** - Use `number | string` for temp IDs (`temp-123...`)
- **Specific selectors** - Use `selectById(id)` not `selectAll()` to minimize re-renders
- **Soft delete** - Use `updateOne(id, { isDeleted: true })` not `removeOne(id)`
- **Commit** - Call `commitCurrentEdits()` to persist L3 → L2 + journal

## Anti-Patterns

- ❌ Index-based updates: `equipo[index].deleted = true`
- ✅ ID-based updates: `updateOne(id, { isDeleted: true })`

- ❌ Nested entities in state
- ✅ Flat structures with relations

## ⚠️ CRITICAL: Zustand v5 & Infinite Loops

Zustand v5 uses React's `useSyncExternalStore`, which requires **stable selector references**.

### The Problem

When a selector returns a new reference (like `selectAll()` which creates a new array on every call), `useShallow` will:

1. Compare the new array with the old one (shallow equal).
2. If they are equal, it returns the _old_ reference to React.
3. **HOWEVER**, if the selector is called again and returns a _new_ reference, and React's `useSyncExternalStore` detects this inconsistency or if the logic inside the selector is complex, it can trigger infinite re-renders in Strict Mode.

### ❌ NEVER DO THIS

```typescript
// Creates new array reference every render -> Infinite Loop risk
const artists = useStore(useShallow((s) => s.selectAll()))
```

### ✅ CORRECT: Normalized State Subscription

Always subscribe to the underlying normalized entities and IDs, then compute the array with `useMemo`.

```typescript
// 1. Subscribe to stable normalized data
const { entities, ids } = useStore(useShallow((s) => s.getEffectiveData()))

// 2. Compute the array only when entities or ids change
const artists = useMemo(
  () => ids.map((id) => entities[id]).filter(Boolean),
  [entities, ids]
)
```

> **Note**: While the latest factory version includes internal memoization for `selectAll()`, the **Normalized State Subscription** pattern is still recommended for maximum stability and to avoid any edge cases with React's concurrent rendering.

## Hook Facade Pattern

**MANDATORY**: Always implement a "Hook Facade" layer between the store and components.

### Implementation Guide

1. **Create Store** (`_store/feature-store.ts`):

   ```typescript
   export const useFeatureStore = createEntityUIStateStore<T>({...})
   ```

2. **Create Facade** (`_hooks/use-feature-ui.ts`):

   ```typescript
   import { useMemo } from 'react'
   import { useShallow } from 'zustand/react/shallow'
   import { useFeatureStore } from '../_store/feature-store'

   export function useFeatureData() {
     const { entities, ids } = useFeatureStore(
       useShallow((s) => s.getEffectiveData())
     )
     return useMemo(
       () => ids.map((id) => entities[id]).filter(Boolean),
       [entities, ids]
     )
   }

   export function useFeatureActions() {
     return useFeatureStore(
       useShallow((state) => ({
         add: state.addOne,
         update: state.updateOne
       }))
     )
   }
   ```

3. **Use in Components**:
   ```typescript
   // ✅ Clean, safe, implementation-agnostic
   const data = useFeatureData()
   ```

**Rule**: Never export the raw store hook to components if possible. Force usage through the Facade.

## API

### Selectors

- `selectAll()` - Array of all entities
- `selectById(id)` - Single entity by ID
- `selectOne()` - First item (singletons)
- `getHasChanges()` - L2 or L3 has changes

### Actions

- `addOne(entity, id?)` - Add with optional temp ID
- `updateOne(id, changes)` - Update fields
- `removeOne(id)` - Hard delete (avoid for persisted)
- `commitCurrentEdits()` - L3 → L2 + journal
