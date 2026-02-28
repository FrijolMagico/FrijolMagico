import { describe, test, expect } from 'bun:test'
import { createEntityOperationStore } from './factory'

interface TestEntity {
  id: string
  nombre: string
}

describe('createEntityOperationStore', () => {
  const mockCommit = async () => {}

  test('should initialize store correctly', () => {
    const useStore = createEntityOperationStore<TestEntity>({
      commitOperations: mockCommit
    })
    const state = useStore.getState()

    expect(state.pendingOperations).toBeNull()
    expect(state.persistedOperations).toBeNull()
    expect(state.lastCommitAt).toBeNull()
  })

  test('should keep pending and persisted operations separate', () => {
    const useStore = createEntityOperationStore<TestEntity>({
      commitOperations: mockCommit
    })

    useStore.getState().add({ nombre: 'Test' })

    const state = useStore.getState()
    expect(state.pendingOperations).toHaveLength(1)
    expect(state.persistedOperations).toBeNull()
  })

  test('commitSuccessCleanup after a commit should trigger isPostCommitReset derived state', () => {
    // This tests the UI flash fix logic from Task 5 (UI flash)
    const useStore = createEntityOperationStore<TestEntity>({
      commitOperations: mockCommit
    })

    // Simulate work
    useStore.getState().add({ nombre: 'Test' })
    useStore
      .getState()
      .hydratePersistedOperations([
        {
          type: 'ADD',
          data: { nombre: 'Test', id: 'uuid' },
          timestamp: Date.now()
        }
      ])

    // Al guardar exitosamente, llamamos a commitSuccessCleanup
    // After successful save, call commitSuccessCleanup
    useStore.getState().commitSuccessCleanup()

    const state = useStore.getState()

    // State MUST satisfy isPostCommitReset (for UI flash fix)
    const isPostCommitReset =
      state.persistedOperations === null &&
      state.pendingOperations === null &&
      state.lastCommitAt !== null

    expect(isPostCommitReset).toBe(true)
  })

  test('simple clear should not be considered post-commit reset', () => {
    const useStore = createEntityOperationStore<TestEntity>({
      commitOperations: mockCommit
    })

    useStore.getState().add({ nombre: 'Test' })
    useStore.getState().clearPendingOperations()

    const state = useStore.getState()

    const isPostCommitReset =
      state.persistedOperations === null &&
      state.pendingOperations === null &&
      state.lastCommitAt !== null

    // because lastCommitAt is null when resetStore (discard) is used, not commitSuccessCleanup
    expect(isPostCommitReset).toBe(false)
  })

  test('resetStore (discard) should not be considered post-commit reset', () => {
    const useStore = createEntityOperationStore<TestEntity>({
      commitOperations: mockCommit
    })

    useStore.getState().add({ nombre: 'Test' })
    useStore.getState().resetStore()

    const state = useStore.getState()

    const isPostCommitReset =
      state.persistedOperations === null &&
      state.pendingOperations === null &&
      state.lastCommitAt !== null

    // resetStore clears lastCommitAt to null, so isPostCommitReset is false
    expect(isPostCommitReset).toBe(false)
    expect(state.lastCommitAt).toBeNull()
  })
})
