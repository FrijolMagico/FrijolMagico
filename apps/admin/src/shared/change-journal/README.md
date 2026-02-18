# Change Journal Module

The **Change Journal** is Layer 2 of the UI State Architecture — the bridge between user edits (Layer 3: Current Edits) and server persistence. It maintains a persistent, ordered log of all user-initiated changes before they're synced to the server.

## Purpose

The Change Journal solves the offline-first problem: What happens when a user makes changes but the network is down, or the sync fails? Without a journal, changes would be lost. The journal ensures:

- **Durability**: Changes persisted to IndexedDB survive browser restarts
- **Ordering**: Changes applied in consistent order across clients
- **Idempotency**: Same scopeKey can be updated; latest state wins
- **Auditability**: Complete history of who changed what and when

## Architecture

```
┌─────────────────────────────────────────────────────┐
│ Layer 3: Current Edits (UI State Store)             │
│ - useMyEntityUIStore hooks                          │
│ - In-memory form state, real-time validation        │
└──────────────────┬──────────────────────────────────┘
                   │ User commits changes
                   ▼
┌─────────────────────────────────────────────────────┐
│ Layer 2: Applied Changes (Change Journal)           │
│ - writeEntry() → IndexedDB persistence              │
│ - getLatestEntries() → read without clearing        │
│ - clearSection() → manual cleanup after sync        │
│ - Ordered by timestamp DESC (newest first)          │
└──────────────────┬──────────────────────────────────┘
                   │ Sync process
                   ▼
┌─────────────────────────────────────────────────────┐
│ Layer 1: Remote Data (Server/Database)              │
│ - Authoritative source of truth                     │
│ - API endpoints handle persistence                  │
└─────────────────────────────────────────────────────┘
```

## Data Model

### JournalEntry

A single immutable record of one user change:

```typescript
interface JournalEntry {
  entryId: string // UUID for this entry (primary key)
  schemaVersion: number // Current: 1
  section: string // Feature name: 'organizacion', 'equipo', 'catalogo'
  scopeKey: string // Dedup key: "section:entityId:field"
  payload: JournalPayload // { op: 'set'|'unset'|'patch', value? }
  timestampMs: number // Date.now() when written
  clientId: string // UUID of the client (offline sync)
  sessionId?: string // Optional session grouping
}
```

### JournalPayload

Discriminated union representing the operation:

```typescript
type JournalPayload =
  | { op: 'set'; value: unknown } // Complete replacement
  | { op: 'unset' } // Delete/clear value
  | { op: 'patch'; value: unknown } // Partial merge
```

## scopeKey Format

The `scopeKey` is the deduplication mechanism. The journal keeps only one entry per scopeKey at sync time, with latest-write-wins semantics.

**Examples:**

| Scenario                    | scopeKey Format                        | Reason                 |
| --------------------------- | -------------------------------------- | ---------------------- |
| Create/update entire entity | `organizacion:org-123`                 | Entity-level scope     |
| Update single field         | `organizacion:org-123:nombre`          | Field-level precision  |
| Array index                 | `equipo:org-123:miembros:0`            | Specific item in array |
| Nested field                | `organizacion:org-123:config:horarios` | Deep path              |

**Guidelines:**

- Use colons (`:`) as delimiters
- Include section name as prefix
- Include entity ID to scope to specific record
- Include field path for field-level changes
- Use array indices for specific items

## API Reference

### writeEntry()

Write a change to the journal. Called every time the user modifies something and commits the change.

**Signature:**

```typescript
export async function writeEntry(
  section: string,
  scopeKey: string,
  payload: JournalPayload,
  meta?: { sessionId?: string }
): Promise<void>
```

**Parameters:**

- `section` — Feature name (e.g., 'organizacion')
- `scopeKey` — Deduplication key
- `payload` — The operation (set/unset/patch)
- `meta.sessionId` — Optional session identifier

**Behavior:**

- Auto-generates `entryId` and `clientId` UUIDs
- Records current timestamp
- Persists to IndexedDB
- Does NOT modify UI state

**Example: Set entire entity**

```typescript
await writeEntry('organizacion', 'organizacion:org-123', {
  op: 'set',
  value: { id: 'org-123', nombre: 'Nueva Org' }
})
```

**Example: Update single field**

```typescript
await writeEntry('organizacion', 'organizacion:org-123:nombre', {
  op: 'set',
  value: 'Nombre Actualizado'
})
```

**Example: Patch (merge) operation**

```typescript
await writeEntry('organizacion', 'organizacion:org-123', {
  op: 'patch',
  value: { nombre: 'Nuevo Nombre' }
})
```

**Example: Delete/unset**

```typescript
await writeEntry('organizacion', 'organizacion:org-123', { op: 'unset' })
```

### getLatestEntries()

Read all pending changes for a section without clearing them.

**Signature:**

```typescript
export async function getLatestEntries(section: string): Promise<JournalEntry[]>
```

**Parameters:**

- `section` — Feature name to query

**Returns:**

- Array of JournalEntry items sorted newest-to-oldest (DESC by timestamp)

**Behavior:**

- Non-destructive read
- Useful for preview/inspection
- Does NOT clear the journal

**Example: Preview changes before sync**

```typescript
const entries = await getLatestEntries('organizacion')
console.log(`Found ${entries.length} pending changes`)
entries.forEach((entry) => {
  console.log(`${entry.scopeKey}: ${entry.payload.op}`)
})
```

### ⚠️ Why No consumeLatestEntries?

**consumeLatestEntries was removed** because it combines "read" and "clear" atomically, creating a dangerous pattern:

```typescript
// ❌ DANGER - consumeLatestEntries doesn't exist (removed)
const entries = await consumeLatestEntries('organizacion')
// If sync fails AFTER this, entries are permanently lost!
```

The journal cannot guarantee atomicity at the _network_ level. If sync fails after entries are cleared, they're unrecoverable. Instead, use manual control:

```typescript
// ✅ CORRECT - Manual control with recovery
const entries = await getLatestEntries('organizacion')

try {
  await syncToServer(entries)
  // Only clear AFTER successful sync
  await clearSection('organizacion')
  console.log(`✓ Synced ${entries.length} changes`)
} catch (error) {
  // Entries still in journal - will retry next time
  console.error('Sync failed, entries kept for retry:', error)
}
```

This pattern ensures **zero data loss**: entries stay in the journal until the server confirms persistence.

## Persistence Flow Pattern

The recommended pattern for safely persisting changes:

```typescript
// 1. Get all pending entries (non-destructive)
const entries = await getLatestEntries('organizacion')

if (entries.length === 0) {
  console.log('No pending changes')
  return
}

console.log(`Found ${entries.length} pending changes, syncing...`)

// 2. Attempt to persist to server
try {
  const response = await fetch('/api/organizacion/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ entries })
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  console.log('✓ Server confirmed persistence')

  // 3. ONLY clear journal after server succeeds
  await clearSection('organizacion')
  console.log('✓ Journal cleared after successful sync')
} catch (error) {
  // Journal entries remain untouched - safe for retry
  console.error('✗ Sync failed, entries retained:', error)

  // Optional: Implement exponential backoff and retry logic
  scheduleRetry('organizacion')
}
```

**Why this is safe:**

- Entries remain in journal until server confirms success
- Network failures don't cause data loss
- Client can retry indefinitely
- Journal is the source of truth until cleared

**Key difference from consumeLatestEntries:**

- consumeLatestEntries: clears IMMEDIATELY (dangerous)
- Manual pattern: clears ONLY after server success (safe)

### hasEntries()

Check if a section has any pending changes.

**Signature:**

```typescript
export async function hasEntries(section: string): Promise<boolean>
```

**Parameters:**

- `section` — Feature name to check

**Returns:**

- `true` if section has entries, `false` otherwise

**Behavior:**

- Fast check (doesn't retrieve all entries)
- Does NOT modify state

**Example: Show dirty indicator**

```typescript
const isDirty = await hasEntries('organizacion')
if (isDirty) {
  showSaveButton()
}
```

**Example: Warn before navigation**

```typescript
const handleNavigation = async () => {
  if (await hasEntries('organizacion')) {
    const confirmLeave = confirm('You have unsaved changes. Leave anyway?')
    if (!confirmLeave) return
  }

  // Safe to navigate
  router.push('/other-page')
}
```

### clearSection()

Clear all entries for a section without returning them.

**Signature:**

```typescript
export async function clearSection(section: string): Promise<void>
```

**Parameters:**

- `section` — Feature name to clear

**Behavior:**

- Removes all entries for the section from IndexedDB
- Does NOT return entries (use getLatestEntries if you need to inspect them)

**Use Cases:**

- After successful sync (use manual clearSection after getLatestEntries + sync succeeds)
- Discard all pending changes (with confirmation)

**Example: Clear after successful sync**

```typescript
// Only use this if you already have the entries
const entries = await getLatestEntries('organizacion')
await syncToServer(entries)
await clearSection('organizacion')
```

**Example: Discard changes**

```typescript
const confirmDiscard = confirm('Discard all unsaved changes?')
if (confirmDiscard) {
  await clearSection('organizacion')
}
```

## UI State Integration

### useChangeJournalUIStore()

Zustand hook for tracking which sections have been applied to the UI state.

**Signature:**

```typescript
export const useChangeJournalUIStore: () => {
  // State
  appliedSections: Set<string>

  // Actions
  markSectionApplied: (section: string) => void
  markSectionUnapplied: (section: string) => void
  reset: () => void
  getAppliedSections: () => string[]

  // Queries
  hasUnsavedChanges: (section: string) => Promise<boolean>
}
```

**Purpose:**

- Track which sections have been synced to the UI layer
- Determine if there are unsaved changes

**Usage:**

```typescript
'use client'

import { useChangeJournalUIStore } from '@/shared/change-journal/store/use-journal-ui-store'

export function MyComponent() {
  const {
    hasUnsavedChanges,
    markSectionApplied,
    markSectionUnapplied
  } = useChangeJournalUIStore()

  // Show dirty indicator
  const [isDirty, setIsDirty] = React.useState(false)

  React.useEffect(() => {
    hasUnsavedChanges('organizacion').then(setIsDirty)
  }, [])

  // Mark applied after loading from server
  const handleLoadComplete = () => {
    markSectionApplied('organizacion')
  }

  // Check before leaving
  const handleDiscard = async () => {
    const hasChanges = await hasUnsavedChanges('organizacion')
    if (hasChanges) {
      const confirm = window.confirm('Discard changes?')
      if (!confirm) return
    }
    markSectionUnapplied('organizacion')
  }

  return (
    <div>
      {isDirty && <span className="text-red-500">●</span>}
      <button onClick={handleLoadComplete}>Load</button>
      <button onClick={handleDiscard}>Discard</button>
    </div>
  )
}
```

## Integration with Factories

The Change Journal is the **Layer 2** component that sits between UI state factories and server sync.

### Flow with createEntityUIStateStore

```typescript
// 1. User edits in UI (Layer 3)
useMyEntityUIStore.setState({ entities: { ...updates } })

// 2. User saves - write to journal (Layer 2)
await writeEntry(
  'organizacion',
  'organizacion:org-123:nombre',
  { op: 'set', value: newName }
)

// 3. Sync process - get entries from journal
const entries = await getLatestEntries('organizacion')

// 4. Send to server (Layer 1)
try {
  await POST /api/organizacion/sync { entries }

  // 5. Server confirms - clear journal
  await clearSection('organizacion')

  // 6. Reload from remote
  const remoteData = await GET /api/organizacion
  useMyEntityUIStore.setState({ entities: remoteData })
} catch (error) {
  // Journal entries remain - safe for retry
  console.error('Sync failed, will retry:', error)
}
```

## Storage Details

### IndexedDB Schema (v1)

- **Database:** `change-journal`
- **Object Store:** `entries`
- **Index:** `section` (for fast filtering by section)
- **Primary Key:** `entryId` (UUID)

### Persistence

- All operations are persisted to IndexedDB immediately
- Survives browser restarts, page reloads, offline periods
- Single `JournalStorage` singleton per app lifecycle
- Dexie.js as the IndexedDB wrapper (handles versioning)

## Limitations

1. **Browser Storage Only**: Journal data lives in IndexedDB. It's cleared if user clears browser data.
2. **No Deduplication Within Section**: All entries are kept per section. Sync process must handle deduplication via scopeKey.
3. **Client ID Only**: No server-assigned IDs. Client IDs are UUIDs generated locally; server must validate.
4. **No Compression**: Entries stored as-is, no delta compression. Large payloads increase storage.
5. **Single Schema Version**: v1 only. Schema changes require migration strategy.
6. **No Conflict Resolution**: Latest-write-wins. No 3-way merge or operational transformation.
7. **No Encryption**: Stored in plain IndexedDB. Use HTTPS for sensitive data in transit.

## Best Practices

### 1. Keep scopeKeys Consistent

Use the same scopeKey format across your codebase:

```typescript
// ✅ Consistent
const scopeKey = `organizacion:${orgId}:nombre`
await writeEntry('organizacion', scopeKey, payload)

// ❌ Inconsistent (avoid)
const scopeKey = `${orgId}_nombre`
```

### 2. Always Use getLatestEntries + Manual clearSection for Sync

```typescript
// ✅ Correct - Safe with recovery
const entries = await getLatestEntries('organizacion')

try {
  await syncToServer(entries)
  // Only clear after successful sync
  await clearSection('organizacion')
} catch (err) {
  // Entries remain in journal, can retry
  console.error('Sync failed, will retry:', err)
}

// ❌ Wrong - removed, combined read+clear is dangerous
// const entries = await consumeLatestEntries('organizacion')
```

### 3. Check hasEntries Before Sync

```typescript
// ✅ Efficient
const isDirty = await hasEntries('organizacion')
if (isDirty) {
  const entries = await consumeLatestEntries('organizacion')
  await syncToServer(entries)
}
```

### 4. Organize Sections by Feature

Use section names that match your app features:

- `organizacion` — Org-level data
- `equipo` — Team/member data
- `catalogo` — Product/item data
- `settings` — Configuration

This makes it easy to sync whole features atomically.

### 5. Document scopeKey Formats

In your feature modules, document the scopeKey format:

```typescript
/**
 * scopeKey format: "organizacion:orgId:field"
 *
 * Examples:
 *   "organizacion:org-123" — entire org
 *   "organizacion:org-123:nombre" — name field
 *   "organizacion:org-123:config:horarios" — nested field
 */
```

## Error Handling

### Write Failures

```typescript
try {
  await writeEntry('organizacion', scopeKey, payload)
} catch (error) {
  console.error('Failed to write journal entry:', error)
  // Don't apply to UI state - let user retry
  showErrorMessage('Could not save changes')
}
```

### Sync Failures

```typescript
const entries = await consumeLatestEntries('organizacion')
try {
  await syncToServer(entries)
} catch (error) {
  console.error('Sync failed:', error)

  // Re-write entries to journal
  for (const entry of entries) {
    await writeEntry(entry.section, entry.scopeKey, entry.payload)
  }

  showErrorMessage('Sync failed, will retry')
}
```

## Examples

### Example: Form Save Handler

```typescript
'use client'

import { writeEntry } from '@/shared/change-journal/change-journal'

export function OrganizacionForm({ orgId, onSync }: Props) {
  const [nombre, setNombre] = React.useState('')
  const [isSaving, setIsSaving] = React.useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // 1. Write to journal (Layer 2)
      await writeEntry(
        'organizacion',
        `organizacion:${orgId}:nombre`,
        { op: 'set', value: nombre }
      )

      // 2. Could trigger sync here
      onSync?.()

      setIsSaving(false)
    } catch (error) {
      console.error('Save error:', error)
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSave() }}>
      <input
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />
      <button disabled={isSaving}>
        {isSaving ? 'Saving...' : 'Save'}
      </button>
    </form>
  )
}
```

### Example: Sync Service

```typescript
import {
  getLatestEntries,
  clearSection,
  hasEntries
} from '@/shared/change-journal/change-journal'

export async function syncOrganizacionChanges() {
  const hasPending = await hasEntries('organizacion')

  if (!hasPending) {
    console.log('No pending changes')
    return
  }

  const entries = await getLatestEntries('organizacion')
  console.log(`Syncing ${entries.length} entries...`)

  try {
    const response = await fetch('/api/organizacion/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entries })
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    // Only clear after successful server response
    await clearSection('organizacion')
    console.log('✓ Sync successful, journal cleared')
  } catch (error) {
    console.error('✗ Sync failed:', error)
    // Entries remain in journal - will retry next time
    // Do NOT re-write entries - they're already there
  }
}
```

## See Also

- [ui-state/README.md](../ui-state/README.md) — Layer 3: Current Edits
- [AGENTS.md](../../AGENTS.md) — Admin app conventions
