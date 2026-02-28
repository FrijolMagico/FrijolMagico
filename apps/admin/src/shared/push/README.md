# Push System

Persistence pipeline to send accumulated operations from the Journal (IndexedDB) to the server using Server Actions.

## Purpose

Orchestrate the sync flow ensuring operations are validated, resolved, and processed correctly before clearing local storage.

## 4-Phase Pipeline

1.  **Read**: Retrieves pending operations from the `PushSource` (e.g., `journalPushSource`).
2.  **Validate & Resolve**: Verifies integrity and sorts them (DELETE → RESTORE → UPDATE → CREATE) via `operation-resolver.ts`. Performs **no-op cancellation** (silent cleanup if operations cancel each other out).
3.  **Execute**: Runs the Server Action processing changes on the server and performs immediate invalidation with `updateTag` ("read-your-own-writes").
4.  **Clear**: After confirmed success, clears the processed entries in IndexedDB.

## Key Files

- `use-push.ts`: Primary hook orchestrating the entire pipeline.
- `operation-resolver.ts`: Logic for conflict validation, sorting, and edge cases (DELETE-on-tempId, CREATE+DELETE, UPDATE+DELETE).
- `id-mapper.ts`: Utility for mapping temporary client IDs to permanent server IDs.
- `error-handler.ts`: Standardized error processing for the push pipeline.

## Implementation Details

The pipeline is source-agnostic, working with any `PushSource` implementation. It handles the transition from local-first state to server persistence, maintaining UI consistency by retaining projections until the server confirms the update.

### Resolver Edge Cases

- **DELETE on tempId**: Silently discarded (entity never persisted).
- **CREATE + DELETE same tempId**: Total cancellation, both discarded.
- **UPDATE + DELETE same real entity**: DELETE wins, UPDATEs discarded.
- **Duplicate DELETEs**: Deduplicated to a single operation.
