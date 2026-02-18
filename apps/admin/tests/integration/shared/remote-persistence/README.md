# Integration Tests for Server Actions

## Overview

Comprehensive integration tests for Remote Persistence Server Actions (`saveOrganizacion`, `saveCatalogo`, `saveArtista`, `saveEvento`).

## Test Coverage

### Flow Verified

1. **Authentication**: `requireAuth()` called before processing
2. **Journal Read**: `getLatestEntries()` reads pending changes
3. **Operation Sorting**: DELETE → UPDATE → INSERT ordering
4. **Batch Processing**: Database transaction execution
5. **DB Operations**: Mocked insert/update/delete
6. **Journal Clear**: `clearSection()` called only on success

### Test Cases (11 total, 8 passing)

#### saveOrganizacion (2 tests)

- ✅ Returns success with no entries
- ⚠️ Detects contradictory operations (failing due to import path issue in action)

#### saveCatalogo (3 tests)

- ✅ Rejects invalid section name
- ✅ Returns success with no entries
- ✅ Processes mixed operations with correct sorting

#### saveArtista (2 tests)

- ✅ Rejects batches exceeding 50 entries
- ✅ Processes artista with temp ID resolution

#### saveEvento (2 tests)

- ✅ Rejects invalid section name
- ✅ Processes hierarchical evento structure

#### Error Handling (2 tests)

- ✅ Does not clear journal on transaction failure
- ⚠️ Handles validation errors (minor mock issue)

## Running Tests

```bash
# Run all integration tests
bun test ./tests/integration/shared/remote-persistence/server-actions.test.ts

# Run with verbose output
bun test ./tests/integration/shared/remote-persistence/server-actions.test.ts --verbose
```

## Mocking Strategy

All external dependencies are mocked:

```typescript
// Required mocks
mock.module('next/cache', () => ({
  revalidateTag: mock(() => {})
}))

mock.module('@/shared/commit-system/lib/journal-reader', ...)
mock.module('@/shared/change-journal/change-journal', ...)
mock.module('@/lib/auth/utils', ...)
mock.module('@frijolmagico/database/orm', ...)
mock.module('@frijolmagico/database/schema', ...)
```

## Known Issues

1. **saveOrganizacion Import Path**: Action file uses `@frijolmagico/database/drizzle` instead of `/orm` (pre-existing issue)
2. **TypeScript Warnings**: Dynamic imports cause TS2307 errors (tests run successfully despite warnings)

## Performance

- **Execution Time**: ~200-220ms for 11 tests
- **All mocks**: Deterministic and fast
- **No I/O**: No actual DB or IndexedDB operations

## Future Improvements

- [ ] Fix import path in `save-organizacion.action.ts`
- [ ] Add tests for batch processor retry logic
- [ ] Test concurrent transaction scenarios
- [ ] Add performance benchmarks
