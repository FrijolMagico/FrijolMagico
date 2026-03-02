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
import { useDirtySync } from '@/shared/hooks/use-dirty-sync'
import { useSectionDirtyStore } from '@/shared/lib/section-dirty-store'
import { ENTITIES } from '@/shared/lib/database-entities'

describe('useDirtySync', () => {
  beforeEach(() => {
    useSectionDirtyStore.setState({ dirtyMap: {} })
  })

  function createStores() {
    const projectionStore = create<any>((set) => ({
      byId: {},
      _setById: (byId: any) => set({ byId })
    }))

    const operationStore = create<any>((set) => ({
      operations: [],
      lastCommitAt: null,
      cleanup: () => set({ operations: null, lastCommitAt: Date.now() }),
      _setOps: (ops: any[] | null) => set({ operations: ops })
    }))

    return { projectionStore, operationStore }
  }

  it('updates global dirty state when projection has changes', () => {
    const { projectionStore, operationStore } = createStores()

    useDirtySync(projectionStore, operationStore, ENTITIES.ARTISTA)

    // Initial state
    expect(
      useSectionDirtyStore.getState().dirtyMap[ENTITIES.ARTISTA]
    ).toBeUndefined()

    // Simulate projection update with a new entity
    projectionStore.getState()._setById({
      '1': {
        id: '1',
        __meta: { isNew: true, isUpdated: false, isDeleted: false }
      }
    })

    // Should be marked dirty
    expect(useSectionDirtyStore.getState().dirtyMap[ENTITIES.ARTISTA]).toBe(
      true
    )

    // Simulate projection reconciling (net-zero)
    projectionStore.getState()._setById({
      '1': {
        id: '1',
        __meta: { isNew: false, isUpdated: false, isDeleted: false }
      }
    })

    // Should be marked clean
    expect(useSectionDirtyStore.getState().dirtyMap[ENTITIES.ARTISTA]).toBe(
      false
    )
  })

  it('forces dirty=false immediately on operationStore.cleanup()', () => {
    const { projectionStore, operationStore } = createStores()

    useDirtySync(projectionStore, operationStore, ENTITIES.ARTISTA)

    // 1. Make projection dirty
    projectionStore.getState()._setById({
      '1': {
        id: '1',
        __meta: { isNew: true, isUpdated: false, isDeleted: false }
      }
    })
    expect(useSectionDirtyStore.getState().dirtyMap[ENTITIES.ARTISTA]).toBe(
      true
    )

    // 2. Simulate cleanup()
    operationStore.getState().cleanup()

    // 3. The dirty state should immediately clear
    expect(useSectionDirtyStore.getState().dirtyMap[ENTITIES.ARTISTA]).toBe(
      false
    )
  })
})
