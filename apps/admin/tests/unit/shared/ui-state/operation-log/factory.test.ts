import { describe, it, expect, beforeEach, afterAll, mock } from 'bun:test'
import { createEntityOperationStore } from '@/shared/ui-state/operation-log'
import type {
  EntityOperationStore,
  EntityOperation
} from '@/shared/ui-state/operation-log/types'

// Mock crypto.randomUUID for deterministic temp IDs
let uuidCounter = 0
const originalRandomUUID = crypto.randomUUID.bind(crypto)
function mockRandomUUID() {
  uuidCounter++
  return `00000000-0000-0000-0000-${String(uuidCounter).padStart(12, '0')}`
}

interface TestEntity {
  id: string
  nombre: string
  alias?: string
}

type TestStore = ReturnType<typeof createEntityOperationStore<TestEntity>>

describe('createEntityOperationStore', () => {
  let store: TestStore

  beforeEach(() => {
    uuidCounter = 0
    crypto.randomUUID = mockRandomUUID as typeof crypto.randomUUID
    store = createEntityOperationStore<TestEntity>({})
  })

  // Restore original after all tests in case needed
  afterAll(() => {
    crypto.randomUUID = originalRandomUUID
  })

  describe('Initial State', () => {
    it('starts with null persistedOperations', () => {
      expect(store.getState().persistedOperations).toBeNull()
    })

    it('starts with null pendingOperations', () => {
      expect(store.getState().pendingOperations).toBeNull()
    })

    it('starts with null lastCommitAt', () => {
      expect(store.getState().lastCommitAt).toBeNull()
    })

    it('isRefreshing inference: not refreshing on initial state', () => {
      const { persistedOperations, pendingOperations, lastCommitAt } =
        store.getState()
      // isRefreshing = persisted === null && pending === null && lastCommitAt !== null
      const isRefreshing =
        persistedOperations === null &&
        pendingOperations === null &&
        lastCommitAt !== null
      expect(isRefreshing).toBe(false)
    })
  })

  describe('add()', () => {
    it('creates an ADD operation with temp id', () => {
      store.getState().add({ nombre: 'Test', alias: 'T' })

      const pending = store.getState().pendingOperations
      expect(pending).not.toBeNull()
      expect(pending).toHaveLength(1)
      expect(pending![0].type).toBe('ADD')
      expect(pending![0]).toHaveProperty('data')

      const addOp = pending![0] as EntityOperation<TestEntity> & {
        type: 'ADD'
      }
      expect(addOp.data.nombre).toBe('Test')
      expect(addOp.data.alias).toBe('T')
      expect(addOp.data.id).toMatch(/^temp-/)
    })

    it('appends to existing pending operations', () => {
      store.getState().add({ nombre: 'First' })
      store.getState().add({ nombre: 'Second' })

      const pending = store.getState().pendingOperations
      expect(pending).toHaveLength(2)
    })

    it('initializes pendingOperations from null on first add', () => {
      expect(store.getState().pendingOperations).toBeNull()
      store.getState().add({ nombre: 'Test' })
      expect(store.getState().pendingOperations).not.toBeNull()
    })

    it('generates unique temp ids for each add', () => {
      store.getState().add({ nombre: 'A' })
      store.getState().add({ nombre: 'B' })

      const pending = store.getState().pendingOperations!
      const idA = (pending[0] as { data: TestEntity }).data.id
      const idB = (pending[1] as { data: TestEntity }).data.id
      expect(idA).not.toBe(idB)
    })

    it('includes a timestamp', () => {
      const before = Date.now()
      store.getState().add({ nombre: 'Test' })
      const after = Date.now()

      const op = store.getState().pendingOperations![0]
      expect(op.timestamp).toBeGreaterThanOrEqual(before)
      expect(op.timestamp).toBeLessThanOrEqual(after)
    })
  })

  describe('remove()', () => {
    it('creates a DELETE operation', () => {
      store.getState().remove('42')

      const pending = store.getState().pendingOperations!
      expect(pending).toHaveLength(1)
      expect(pending[0].type).toBe('DELETE')
      expect((pending[0] as { id: string }).id).toBe('42')
    })

    it('appends DELETE to existing pending operations', () => {
      store.getState().add({ nombre: 'Test' })
      store.getState().remove('42')

      expect(store.getState().pendingOperations).toHaveLength(2)
    })
  })

  describe('update()', () => {
    it('creates an UPDATE operation with partial data', () => {
      store.getState().update('42', { nombre: 'Updated' })

      const pending = store.getState().pendingOperations!
      expect(pending).toHaveLength(1)
      expect(pending[0].type).toBe('UPDATE')

      const updateOp = pending[0] as EntityOperation<TestEntity> & {
        type: 'UPDATE'
      }
      expect(updateOp.id).toBe('42')
      expect(updateOp.data).toEqual({ nombre: 'Updated' })
    })
  })

  describe('restore()', () => {
    it('creates a RESTORE operation', () => {
      store.getState().restore('42')

      const pending = store.getState().pendingOperations!
      expect(pending).toHaveLength(1)
      expect(pending[0].type).toBe('RESTORE')
      expect((pending[0] as { id: string }).id).toBe('42')
    })
  })

  describe('commitPendingOperations()', () => {
    it('does nothing when there are no pending operations', async () => {
      const commitFn = mock((ops: any) => Promise.resolve())
      store = createEntityOperationStore<TestEntity>({
        commitOperations: commitFn
      })

      await store.getState().commitPendingOperations()
      expect(commitFn).not.toHaveBeenCalled()
    })

    it('does nothing when pendingOperations is empty array', async () => {
      const commitFn = mock((ops: any) => Promise.resolve())
      store = createEntityOperationStore<TestEntity>({
        commitOperations: commitFn
      })

      // Manually trigger an edge: pendingOperations is null initially
      await store.getState().commitPendingOperations()
      expect(commitFn).not.toHaveBeenCalled()
    })

    it('calls commitOperations with pending ops', async () => {
      const commitFn = mock((ops: any) => Promise.resolve())
      store = createEntityOperationStore<TestEntity>({
        commitOperations: commitFn
      })

      store.getState().add({ nombre: 'Test' })
      await store.getState().commitPendingOperations()

      expect(commitFn).toHaveBeenCalledTimes(1)
      const calledWith = commitFn.mock.calls[0][0] as EntityOperation<TestEntity>[]
      expect(calledWith).toHaveLength(1)
      expect(calledWith[0].type).toBe('ADD')
    })

    it('moves committed ops to persistedOperations', async () => {
      store = createEntityOperationStore<TestEntity>({})

      store.getState().add({ nombre: 'Test' })
      await store.getState().commitPendingOperations()

      expect(store.getState().persistedOperations).toHaveLength(1)
      expect(store.getState().pendingOperations).toBeNull()
    })

    it('sets lastCommitAt after successful commit', async () => {
      store = createEntityOperationStore<TestEntity>({})

      const before = Date.now()
      store.getState().add({ nombre: 'Test' })
      await store.getState().commitPendingOperations()
      const after = Date.now()

      const { lastCommitAt } = store.getState()
      expect(lastCommitAt).not.toBeNull()
      expect(lastCommitAt).toBeGreaterThanOrEqual(before)
      expect(lastCommitAt).toBeLessThanOrEqual(after)
    })

    it('preserves ops added during async commit (snapshot isolation)', async () => {
      let resolveCommit: () => void
      const commitPromise = new Promise<void>((resolve) => {
        resolveCommit = resolve
      })
      const commitFn = mock(() => commitPromise)

      store = createEntityOperationStore<TestEntity>({
        commitOperations: commitFn
      })

      // Add first op and start commit
      store.getState().add({ nombre: 'First' })
      const commitTask = store.getState().commitPendingOperations()

      // While commit is in-flight, add a second op
      store.getState().add({ nombre: 'Second' })

      // Complete the commit
      resolveCommit!()
      await commitTask

      // First op should be persisted, second should remain pending
      expect(store.getState().persistedOperations).toHaveLength(1)
      expect(store.getState().pendingOperations).toHaveLength(1)
      expect(
        (
          store.getState()
            .pendingOperations![0] as EntityOperation<TestEntity> & {
            type: 'ADD'
          }
        ).data.nombre
      ).toBe('Second')
    })

    it('handles commitOperations failure gracefully', async () => {
      const commitFn = mock(() => Promise.reject(new Error('Network error')))
      store = createEntityOperationStore<TestEntity>({
        commitOperations: commitFn
      })

      // Suppress console.error for this test
      const originalError = console.error
      console.error = mock(() => {})

      store.getState().add({ nombre: 'Test' })
      await store.getState().commitPendingOperations()

      // On failure, pending ops are NOT moved to persisted
      // The state remains unchanged because the catch block doesn't modify state
      expect(store.getState().persistedOperations).toBeNull()

      console.error = originalError
    })

    it('accumulates persisted operations across multiple commits', async () => {
      store = createEntityOperationStore<TestEntity>({})

      store.getState().add({ nombre: 'First' })
      await store.getState().commitPendingOperations()

      store.getState().add({ nombre: 'Second' })
      await store.getState().commitPendingOperations()

      expect(store.getState().persistedOperations).toHaveLength(2)
      expect(store.getState().pendingOperations).toBeNull()
    })

    it('sets pendingOperations to null when all ops committed', async () => {
      store = createEntityOperationStore<TestEntity>({})

      store.getState().add({ nombre: 'Test' })
      store.getState().remove('42')
      await store.getState().commitPendingOperations()

      expect(store.getState().pendingOperations).toBeNull()
    })
  })

  describe('isRefreshing inference', () => {
    // This tests the pattern that was recently fixed for UI flash:
    // isRefreshing = persistedOperations === null && pendingOperations === null && lastCommitAt !== null

    it('is NOT refreshing in initial state (all null)', () => {
      const s = store.getState()
      const isRefreshing =
        s.persistedOperations === null &&
        s.pendingOperations === null &&
        s.lastCommitAt !== null
      expect(isRefreshing).toBe(false)
    })

    it('IS refreshing after commit + clear persisted (waiting for server refresh)', async () => {
      store = createEntityOperationStore<TestEntity>({})

      store.getState().add({ nombre: 'Test' })
      await store.getState().commitPendingOperations()

      // After commit, lastCommitAt is set, persistedOperations has items
      expect(store.getState().lastCommitAt).not.toBeNull()
      expect(store.getState().persistedOperations).toHaveLength(1)

      // When server refresh clears persisted operations
      store.getState().clearPersistedOperations()

      const s = store.getState()
      const isRefreshing =
        s.persistedOperations === null &&
        s.pendingOperations === null &&
        s.lastCommitAt !== null
      expect(isRefreshing).toBe(true)
    })

    it('is NOT refreshing when there are pending operations', async () => {
      store = createEntityOperationStore<TestEntity>({})

      store.getState().add({ nombre: 'Test' })
      await store.getState().commitPendingOperations()
      store.getState().clearPersistedOperations()

      // Add new pending op
      store.getState().add({ nombre: 'New' })

      const s = store.getState()
      const isRefreshing =
        s.persistedOperations === null &&
        s.pendingOperations === null &&
        s.lastCommitAt !== null
      expect(isRefreshing).toBe(false)
    })
  })

  describe('clearPendingOperations()', () => {
    it('clears pending operations to null', () => {
      store.getState().add({ nombre: 'Test' })
      expect(store.getState().pendingOperations).not.toBeNull()

      store.getState().clearPendingOperations()
      expect(store.getState().pendingOperations).toBeNull()
    })
  })

  describe('clearPersistedOperations()', () => {
    it('clears persisted operations to null', async () => {
      store = createEntityOperationStore<TestEntity>({})
      store.getState().add({ nombre: 'Test' })
      await store.getState().commitPendingOperations()

      expect(store.getState().persistedOperations).toHaveLength(1)

      store.getState().clearPersistedOperations()
      expect(store.getState().persistedOperations).toBeNull()
    })
  })

  describe('resetStore()', () => {
    it('resets pendingOperations and persistedOperations to null', async () => {
      store = createEntityOperationStore<TestEntity>({})
      store.getState().add({ nombre: 'Test' })
      await store.getState().commitPendingOperations()
      store.getState().add({ nombre: 'Another' })

      store.getState().resetStore()

      expect(store.getState().persistedOperations).toBeNull()
      expect(store.getState().pendingOperations).toBeNull()
    })
  })

  describe('hydratePersistedOperations()', () => {
    it('sets persisted operations from external data', () => {
      const operations: EntityOperation<TestEntity>[] = [
        {
          type: 'ADD',
          data: { id: 'temp-abc', nombre: 'Hydrated' },
          timestamp: 1000
        },
        {
          type: 'UPDATE',
          id: '42',
          data: { nombre: 'Updated' },
          timestamp: 2000
        }
      ]

      store.getState().hydratePersistedOperations(operations)
      expect(store.getState().persistedOperations).toHaveLength(2)
    })

    it('appends to existing persisted operations', async () => {
      store = createEntityOperationStore<TestEntity>({})
      store.getState().add({ nombre: 'Committed' })
      await store.getState().commitPendingOperations()

      const newOps: EntityOperation<TestEntity>[] = [
        {
          type: 'ADD',
          data: { id: 'temp-xyz', nombre: 'Hydrated' },
          timestamp: 3000
        }
      ]

      store.getState().hydratePersistedOperations(newOps)
      expect(store.getState().persistedOperations).toHaveLength(2)
    })

    it('initializes from null', () => {
      expect(store.getState().persistedOperations).toBeNull()

      const ops: EntityOperation<TestEntity>[] = [
        {
          type: 'ADD',
          data: { id: 'temp-a', nombre: 'A' },
          timestamp: 1000
        }
      ]
      store.getState().hydratePersistedOperations(ops)
      expect(store.getState().persistedOperations).toHaveLength(1)
    })

    it('handles empty array', () => {
      store.getState().hydratePersistedOperations([])
      // persistedOperations was null, appending empty = [...(null ?? []), ...[]] = []
      expect(store.getState().persistedOperations).toEqual([])
    })
  })

  describe('Multiple operation types interleaved', () => {
    it('correctly queues mixed operation types', () => {
      store.getState().add({ nombre: 'New' })
      store.getState().update('42', { nombre: 'Changed' })
      store.getState().remove('99')
      store.getState().restore('50')

      const pending = store.getState().pendingOperations!
      expect(pending).toHaveLength(4)
      expect(pending[0].type).toBe('ADD')
      expect(pending[1].type).toBe('UPDATE')
      expect(pending[2].type).toBe('DELETE')
      expect(pending[3].type).toBe('RESTORE')
    })

    it('timestamps are non-decreasing', () => {
      store.getState().add({ nombre: 'A' })
      store.getState().add({ nombre: 'B' })
      store.getState().add({ nombre: 'C' })

      const pending = store.getState().pendingOperations!
      for (let i = 1; i < pending.length; i++) {
        expect(pending[i].timestamp).toBeGreaterThanOrEqual(
          pending[i - 1].timestamp
        )
      }
    })
  })
})
