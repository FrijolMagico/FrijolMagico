import { describe, expect, it, mock, beforeEach } from 'bun:test'

// Mock react BEFORE importing the hook
mock.module('react', () => {
  return {
    useEffect: (fn: () => (() => void) | void) => {
      fn()
    },
    useRef: (init: any) => ({ current: init }),
    useCallback: (fn: any) => fn
  }
})

import { create } from 'zustand'
import { useJournalFlushRegistry } from '@/shared/lib/journal-flush-registry'
import { useJournalSync } from '@/shared/hooks/use-journal-sync'
import { ENTITIES } from '@/shared/lib/database-entities'

const MOCK_OP_1 = {
  type: 'ADD',
  id: '1',
  timestamp: 100,
  data: { id: '1', name: 'Test' }
}

const MOCK_OP_2 = {
  type: 'UPDATE',
  id: '1',
  timestamp: 200,
  data: { name: 'Updated' }
}

describe('useJournalSync edge cases', () => {
  let writeMock: ReturnType<typeof mock>

  beforeEach(() => {
    writeMock = mock(() => Promise.resolve())
    mock.module('@/shared/lib/write-operation-into-journal', () => ({
      writeOperationIntoJournal: writeMock
    }))

    useJournalFlushRegistry.setState({ callbacks: new Map() })
  })

  function createMockStore() {
    return create<any>((set) => ({
      operations: null,
      lastCommitAt: null,
      cleanup: () => set({ operations: null, lastCommitAt: Date.now() }),
      _setOps: (ops: any[]) => set({ operations: ops })
    }))
  }

  it('writes to journal via imperative flush', async () => {
    const store = createMockStore()

    useJournalSync({
      entity: ENTITIES.ARTISTA,
      operationStore: store,
      debounceMs: 500
    })
    ;(store.getState() as any)._setOps([MOCK_OP_1, MOCK_OP_2])

    const flushCb = useJournalFlushRegistry
      .getState()
      .callbacks.get(ENTITIES.ARTISTA)
    expect(flushCb).toBeDefined()

    await flushCb!()

    expect(writeMock).toHaveBeenCalledTimes(1)
    expect(writeMock.mock.calls[0][0]).toEqual([MOCK_OP_1, MOCK_OP_2])
  })

  it('deduplicates operations via cursor', async () => {
    const store = createMockStore()

    useJournalSync({
      entity: ENTITIES.ARTISTA,
      operationStore: store,
      debounceMs: 500
    })

    const flushCb = useJournalFlushRegistry
      .getState()
      .callbacks.get(ENTITIES.ARTISTA)!

    // First write
    ;(store.getState() as any)._setOps([MOCK_OP_1])
    await flushCb()

    expect(writeMock).toHaveBeenCalledTimes(1)
    writeMock.mockClear()

    // Second write with both ops
    ;(store.getState() as any)._setOps([MOCK_OP_1, MOCK_OP_2])
    await flushCb()

    // Should only write the NEW operation
    expect(writeMock).toHaveBeenCalledTimes(1)
    expect(writeMock.mock.calls[0][0]).toEqual([MOCK_OP_2])
  })

  it('guards against post-commit resets', async () => {
    const store = createMockStore()

    useJournalSync({
      entity: ENTITIES.ARTISTA,
      operationStore: store,
      debounceMs: 500
    })

    const flushCb = useJournalFlushRegistry
      .getState()
      .callbacks.get(ENTITIES.ARTISTA)!

    ;(store.getState() as any)._setOps([MOCK_OP_1])
    await flushCb()
    writeMock.mockClear()

    // Simulate cleanup
    store.getState().cleanup()

    // Try to flush again
    await flushCb()

    // Should NOT write
    expect(writeMock).toHaveBeenCalledTimes(0)
  })
})
