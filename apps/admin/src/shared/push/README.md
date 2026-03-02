# Push System

Persistence pipeline to send accumulated operations from the Journal (IndexedDB) to the server using Server Actions.

## Overview

The push system orchestrates the synchronization flow between local-first state and remote persistence. It acts as a bridge between the **Journal** (where user changes are queued) and **Server Actions** (where they are executed).

The process follows a strictly defined 4-phase pipeline:
1.  **Read**: Retrieves pending operations from the `PushSource`.
2.  **Validate & Resolve**: Verifies data integrity and sorts operations (DELETE → RESTORE → UPDATE → CREATE). It also performs **no-op cancellation** (e.g., if a CREATE is followed by a DELETE, both are discarded).
3.  **Execute**: Calls the Server Action with the processed operations.
4.  **Clear**: Cleans up the IndexedDB entries after confirmed server success.

## Double Validation Architecture

This system implements a double-layered validation pattern to ensure both fast user feedback and backend security.

### 1. Client-side Validation (`usePush`)
Performed before the network request. It uses the `validatePushOperations` utility to check all pending changes against their respective Zod schemas. This prevents invalid data from even leaving the client, saving bandwidth and providing immediate UI feedback.

### 2. Server-side Validation (`validateOperationData`)
Server Actions must re-validate incoming data using the shared `validateOperationData` helper. This is the source of truth and protects against malicious or corrupted requests.

**ID Handling Rules:**
- `validateOperationData` automatically strips the `id` field from the `data` object.
- For **CREATE**, the ID is server-assigned.
- For **UPDATE**, the entity ID is handled by the `entityId` property of the operation, not inside the `data` payload.

## Component Reference

### `usePush`
The primary React hook that orchestrates the entire pipeline. It handles state (pending, success, error) and progress reporting.

```typescript
const { push, isPending, progress } = usePush({
  source: journalPushSource,
  executor: saveArtistaAction,
  section: 'artista',
  validators: {
    artista: artistaSchema,
    artistaImagen: artistaImagenSchema
  }
})
```

### `validateOperationData`
A generic validator located in `@/shared/push/lib/validators`. It bridges Zod schemas with the `PushOperation` structure.

```typescript
// Used inside Server Actions
const validation = validateOperationData(
  operation.data,
  artistaSchema,
  operation.type === 'UPDATE'
)
```

### `PushOperation`
The core type signature for all persistence changes:
- `CREATE`: New entity with temporary client-side ID.
- `UPDATE`: Partial or full changes to an existing entity.
- `DELETE`: Removal of an entity.
- `RESTORE`: Reversal of a deletion.

## How to Implement a New Section

Follow these steps to add push support to a new feature:

### Step 1: Define Zod Schemas
Create your validation schemas in the feature's `_lib/schema.ts` file.

### Step 2: Create the Push Hook
In your UI component or feature hook, initialize `usePush` with the correct validators and Server Action.

### Step 3: Implement the Server Action
Your action should iterate through operations and use `validateOperationData` for each one before performing database mutations.

## Migration Guide

The previous pattern using `toJournalEntry` and manual mappers is **deprecated**.

### Before (Deprecated)
```typescript
// Old manual mapping logic inside hooks or components
const entry = toJournalEntry(data, 'artista')
// ... manual push logic
```

### After (New Standard)
1.  **Replace** manual logic with the `usePush` hook.
2.  **Use** `validateOperationData` in your Server Actions instead of manual Zod parsing.
3.  **Update** your action signature to accept `PushOperation[]` instead of a single entity.
