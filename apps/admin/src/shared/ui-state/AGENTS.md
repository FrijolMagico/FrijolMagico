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

## Zustand v5 & useShallow

**CRITICAL WARNING**: Zustand v5 changed the `useShallow` API. The old v4 syntax is deprecated and triggers infinite loops/warnings in strict mode.

- **Deprecated (v4)**: `useStore(selector, useShallow)`
- **Correct (v5)**: `useStore(useShallow(selector))`

### Infinite Render Loop Prevention

**NEVER** use `useShallow` with selectors that create new object/array references on every call (e.g., `.map()`, `.filter()`, `.sort()`, `Object.values()`).

React's `useSyncExternalStore` (used by Zustand v5) requires stable snapshots. If your selector returns a new reference every time, `useShallow` compares it, sees it's "shallow equal", but React sees a new reference and re-renders, causing an infinite loop.

```typescript
// ❌ WRONG: Creates new array reference every render -> Infinite Loop
const activeItems = useStore(
  useShallow(
    (state) => state.items.filter((i) => i.active) // New array reference every time!
  )
)

// ✅ CORRECT: Select stable state, compute in component
const items = useStore(useShallow((state) => state.items)) // Stable if items hasn't changed
const activeItems = useMemo(() => items.filter((i) => i.active), [items])
```
