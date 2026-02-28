import { describe, test, expect } from 'bun:test'
import { createEntityOperationStore } from './factory'

describe('createEntityOperationStore', () => {
  const mockCommit = async () => ({ success: true })

  test('debe inicializar el store correctamente', () => {
    const useStore = createEntityOperationStore({
      commitOperations: mockCommit
    })
    const state = useStore.getState()

    expect(state.pendingOperations).toBeNull()
    expect(state.persistedOperations).toBeNull()
    expect(state.lastCommitAt).toBeNull()
  })

  test('debe mantener pending y persisted separados', () => {
    const useStore = createEntityOperationStore({
      commitOperations: mockCommit
    })

    useStore.getState().add({ type: 'UPDATE', payload: { id: 1 } })

    const state = useStore.getState()
    expect(state.pendingOperations).toHaveLength(1)
    expect(state.persistedOperations).toBeNull()
  })

  test('commitSuccessCleanup despues de un commit debe disparar el isPostCommitReset derived state', () => {
    // Esto prueba la lógica del fix de la Task 5 (UI flash)
    const useStore = createEntityOperationStore({
      commitOperations: mockCommit
    })

    // Simular trabajo
    useStore.getState().add({ type: 'UPDATE', payload: { id: 1 } })
    useStore
      .getState()
      .hydratePersistedOperations([
        { type: 'CREATE', payload: { id: 2 }, id: 'uuid' }
      ])

    // Al guardar exitosamente, llamamos a commitSuccessCleanup
    useStore.getState().commitSuccessCleanup()

    const state = useStore.getState()

    // El state DEBE cumplir isPostCommitReset (para el UI flash fix)
    const isPostCommitReset =
      state.persistedOperations === null &&
      state.pendingOperations === null &&
      state.lastCommitAt !== null

    expect(isPostCommitReset).toBe(true)
  })

  test('un clear simple no debe ser considerado post-commit reset', () => {
    const useStore = createEntityOperationStore({
      commitOperations: mockCommit
    })

    useStore.getState().add({ type: 'UPDATE', payload: { id: 1 } })
    useStore.getState().clearPendingOperations()

    const state = useStore.getState()

    const isPostCommitReset =
      state.persistedOperations === null &&
      state.pendingOperations === null &&
      state.lastCommitAt !== null

    // Porque lastCommitAt es null cuando se usa resetStore (discard), no commitSuccessCleanup
    expect(isPostCommitReset).toBe(false)
  })

  test('resetStore (discard) no debe ser considerado post-commit reset', () => {
    const useStore = createEntityOperationStore({
      commitOperations: mockCommit
    })

    useStore.getState().add({ type: 'UPDATE', payload: { id: 1 } })
    useStore.getState().resetStore()

    const state = useStore.getState()

    const isPostCommitReset =
      state.persistedOperations === null &&
      state.pendingOperations === null &&
      state.lastCommitAt !== null

    // resetStore limpia lastCommitAt a null, asi que isPostCommitReset es false
    expect(isPostCommitReset).toBe(false)
    expect(state.lastCommitAt).toBeNull()
  })
})
