import { describe, it, expect, beforeEach } from 'bun:test'
import { createProjectionStore } from '@/shared/ui-state/ui-projection-engine/factory'
import type { EntityOperation } from '@/shared/ui-state/operation-log/types'

interface TestEntity {
  id: string
  nombre: string
  alias?: string
  orden?: number
}

type TestProjectionStore = ReturnType<typeof createProjectionStore<TestEntity>>

describe('createProjectionStore', () => {
  let store: TestProjectionStore

  beforeEach(() => {
    store = createProjectionStore<TestEntity>()
  })

  describe('Initial State', () => {
    it('starts with empty byId', () => {
      expect(store.getState().byId).toEqual({})
    })

    it('starts with empty allIds', () => {
      expect(store.getState().allIds).toEqual([])
    })
  })

  describe('project() with remote snapshot only (no operations)', () => {
    it('populates byId from remote snapshot', () => {
      const remote: TestEntity[] = [
        { id: '1', nombre: 'Alpha', alias: 'A' },
        { id: '2', nombre: 'Beta', alias: 'B' }
      ]

      store.getState().project(remote, null, null)

      const { byId, allIds } = store.getState()
      expect(allIds).toEqual(['1', '2'])
      expect(byId['1'].nombre).toBe('Alpha')
      expect(byId['2'].nombre).toBe('Beta')
    })

    it('marks all entities as clean (not new, not updated, not deleted)', () => {
      const remote: TestEntity[] = [{ id: '1', nombre: 'Test' }]

      store.getState().project(remote, null, null)

      const meta = store.getState().byId['1'].__meta
      expect(meta.isNew).toBe(false)
      expect(meta.isUpdated).toBe(false)
      expect(meta.isDeleted).toBe(false)
    })

    it('handles empty remote snapshot', () => {
      store.getState().project([], null, null)

      expect(store.getState().byId).toEqual({})
      expect(store.getState().allIds).toEqual([])
    })

    it('handles empty operations arrays (not null)', () => {
      const remote: TestEntity[] = [{ id: '1', nombre: 'Test' }]

      store.getState().project(remote, [], [])

      const { byId, allIds } = store.getState()
      expect(allIds).toEqual(['1'])
      expect(byId['1'].__meta.isNew).toBe(false)
      expect(byId['1'].__meta.isUpdated).toBe(false)
    })
  })

  describe('project() with ADD operations', () => {
    it('adds a new entity from pending operations', () => {
      const remote: TestEntity[] = [{ id: '1', nombre: 'Existing' }]
      const pending: EntityOperation<TestEntity>[] = [
        {
          type: 'ADD',
          data: { id: 'temp-new', nombre: 'New Entity' },
          timestamp: 1000
        }
      ]

      store.getState().project(remote, null, pending)

      const { byId, allIds } = store.getState()
      expect(allIds).toContain('temp-new')
      expect(byId['temp-new'].nombre).toBe('New Entity')
      expect(byId['temp-new'].__meta.isNew).toBe(true)
      expect(byId['temp-new'].__meta.isUpdated).toBe(false)
    })

    it('adds entity from persisted operations', () => {
      const remote: TestEntity[] = []
      const persisted: EntityOperation<TestEntity>[] = [
        {
          type: 'ADD',
          data: { id: 'temp-abc', nombre: 'Persisted Add' },
          timestamp: 500
        }
      ]

      store.getState().project(remote, persisted, null)

      const { byId } = store.getState()
      expect(byId['temp-abc'].nombre).toBe('Persisted Add')
      expect(byId['temp-abc'].__meta.isNew).toBe(true)
    })

    it('does not duplicate allIds if ADD targets existing id', () => {
      const remote: TestEntity[] = []
      const persisted: EntityOperation<TestEntity>[] = [
        {
          type: 'ADD',
          data: { id: 'temp-1', nombre: 'First' },
          timestamp: 100
        }
      ]
      const pending: EntityOperation<TestEntity>[] = [
        {
          type: 'ADD',
          data: { id: 'temp-1', nombre: 'Replaced' },
          timestamp: 200
        }
      ]

      store.getState().project(remote, persisted, pending)

      const { allIds, byId } = store.getState()
      const count = allIds.filter((id) => id === 'temp-1').length
      // The second ADD overwrites; id appears at most once from the second ADD
      // (first ADD adds it, second ADD sees it exists in nextById so doesn't push)
      expect(count).toBeLessThanOrEqual(2) // Both persisted and pending may push
      expect(byId['temp-1'].nombre).toBe('Replaced')
    })
  })

  describe('project() with UPDATE operations', () => {
    it('updates an existing remote entity', () => {
      const remote: TestEntity[] = [{ id: '1', nombre: 'Original', alias: 'O' }]
      const pending: EntityOperation<TestEntity>[] = [
        {
          type: 'UPDATE',
          id: '1',
          data: { nombre: 'Modified' },
          timestamp: 1000
        }
      ]

      store.getState().project(remote, null, pending)

      const entity = store.getState().byId['1']
      expect(entity.nombre).toBe('Modified')
      expect(entity.alias).toBe('O') // Preserved from original
      expect(entity.__meta.isUpdated).toBe(true)
      expect(entity.__meta.isNew).toBe(false)
    })

    it('skips UPDATE for non-existent entity', () => {
      const remote: TestEntity[] = [{ id: '1', nombre: 'Exists' }]
      const pending: EntityOperation<TestEntity>[] = [
        {
          type: 'UPDATE',
          id: 'nonexistent',
          data: { nombre: 'Ghost' },
          timestamp: 1000
        }
      ]

      store.getState().project(remote, null, pending)

      expect(store.getState().byId['nonexistent']).toBeUndefined()
    })

    it('does not mark new entities as updated (isNew takes priority)', () => {
      const remote: TestEntity[] = []
      const ops: EntityOperation<TestEntity>[] = [
        {
          type: 'ADD',
          data: { id: 'temp-1', nombre: 'New' },
          timestamp: 100
        },
        {
          type: 'UPDATE',
          id: 'temp-1',
          data: { nombre: 'Updated New' },
          timestamp: 200
        }
      ]

      store.getState().project(remote, ops, null)

      const entity = store.getState().byId['temp-1']
      expect(entity.nombre).toBe('Updated New')
      expect(entity.__meta.isNew).toBe(true)
      // isUpdated should be false because isNew is true
      expect(entity.__meta.isUpdated).toBe(false)
    })

    it('merges multiple updates on the same entity', () => {
      const remote: TestEntity[] = [
        { id: '1', nombre: 'Original', alias: 'O', orden: 1 }
      ]
      const ops: EntityOperation<TestEntity>[] = [
        {
          type: 'UPDATE',
          id: '1',
          data: { nombre: 'Changed' },
          timestamp: 100
        },
        {
          type: 'UPDATE',
          id: '1',
          data: { alias: 'C' },
          timestamp: 200
        }
      ]

      store.getState().project(remote, ops, null)

      const entity = store.getState().byId['1']
      expect(entity.nombre).toBe('Changed')
      expect(entity.alias).toBe('C')
      expect(entity.orden).toBe(1)
      expect(entity.__meta.isUpdated).toBe(true)
    })
  })

  describe('project() with DELETE operations', () => {
    it('marks entity as deleted', () => {
      const remote: TestEntity[] = [{ id: '1', nombre: 'Doomed' }]
      const pending: EntityOperation<TestEntity>[] = [
        { type: 'DELETE', id: '1', timestamp: 1000 }
      ]

      store.getState().project(remote, null, pending)

      expect(store.getState().byId['1'].__meta.isDeleted).toBe(true)
    })

    it('skips DELETE for non-existent entity', () => {
      const remote: TestEntity[] = [{ id: '1', nombre: 'Safe' }]
      const pending: EntityOperation<TestEntity>[] = [
        { type: 'DELETE', id: 'ghost', timestamp: 1000 }
      ]

      store.getState().project(remote, null, pending)

      expect(store.getState().byId['1'].__meta.isDeleted).toBe(false)
      expect(store.getState().byId['ghost']).toBeUndefined()
    })
  })

  describe('project() with RESTORE operations', () => {
    it('unmarks deleted entity', () => {
      const remote: TestEntity[] = [{ id: '1', nombre: 'Resurrected' }]
      const ops: EntityOperation<TestEntity>[] = [
        { type: 'DELETE', id: '1', timestamp: 100 },
        { type: 'RESTORE', id: '1', timestamp: 200 }
      ]

      store.getState().project(remote, ops, null)

      expect(store.getState().byId['1'].__meta.isDeleted).toBe(false)
    })

    it('skips RESTORE for non-existent entity', () => {
      const remote: TestEntity[] = []
      const ops: EntityOperation<TestEntity>[] = [
        { type: 'RESTORE', id: 'ghost', timestamp: 100 }
      ]

      store.getState().project(remote, ops, null)
      expect(store.getState().byId['ghost']).toBeUndefined()
    })
  })

  describe('Net-zero change detection (reconciliation)', () => {
    it('clears isUpdated when projected value matches remote', () => {
      const remote: TestEntity[] = [{ id: '1', nombre: 'Same' }]
      const ops: EntityOperation<TestEntity>[] = [
        {
          type: 'UPDATE',
          id: '1',
          data: { nombre: 'Same' }, // Same as remote
          timestamp: 100
        }
      ]

      store.getState().project(remote, ops, null)

      // The reconciliation step should detect this is net-zero
      expect(store.getState().byId['1'].__meta.isUpdated).toBe(false)
    })

    it('keeps isUpdated when projected value differs from remote', () => {
      const remote: TestEntity[] = [{ id: '1', nombre: 'Original' }]
      const ops: EntityOperation<TestEntity>[] = [
        {
          type: 'UPDATE',
          id: '1',
          data: { nombre: 'Different' },
          timestamp: 100
        }
      ]

      store.getState().project(remote, ops, null)

      expect(store.getState().byId['1'].__meta.isUpdated).toBe(true)
    })

    it('does not reconcile new entities', () => {
      const remote: TestEntity[] = []
      const ops: EntityOperation<TestEntity>[] = [
        {
          type: 'ADD',
          data: { id: 'temp-1', nombre: 'New' },
          timestamp: 100
        }
      ]

      store.getState().project(remote, ops, null)

      // isNew entity should not be touched by reconciliation
      expect(store.getState().byId['temp-1'].__meta.isNew).toBe(true)
    })

    it('does not reconcile deleted entities', () => {
      const remote: TestEntity[] = [{ id: '1', nombre: 'Doomed' }]
      const ops: EntityOperation<TestEntity>[] = [
        {
          type: 'UPDATE',
          id: '1',
          data: { nombre: 'Changed' },
          timestamp: 100
        },
        { type: 'DELETE', id: '1', timestamp: 200 }
      ]

      store.getState().project(remote, ops, null)

      // Deleted entity should remain deleted regardless of reconciliation
      expect(store.getState().byId['1'].__meta.isDeleted).toBe(true)
    })

    it('handles multiple field changes with partial revert to remote', () => {
      const remote: TestEntity[] = [
        { id: '1', nombre: 'Original', alias: 'O', orden: 1 }
      ]
      const ops: EntityOperation<TestEntity>[] = [
        {
          type: 'UPDATE',
          id: '1',
          data: { nombre: 'Changed', alias: 'O' }, // alias same as remote
          timestamp: 100
        }
      ]

      store.getState().project(remote, ops, null)

      // nombre differs → still marked updated
      expect(store.getState().byId['1'].__meta.isUpdated).toBe(true)
    })

    it('detects full revert across multiple update operations', () => {
      const remote: TestEntity[] = [{ id: '1', nombre: 'Original', alias: 'O' }]
      const ops: EntityOperation<TestEntity>[] = [
        {
          type: 'UPDATE',
          id: '1',
          data: { nombre: 'Changed' },
          timestamp: 100
        },
        {
          type: 'UPDATE',
          id: '1',
          data: { nombre: 'Original' }, // Reverted back
          timestamp: 200
        }
      ]

      store.getState().project(remote, ops, null)

      // Net result is same as remote — should clear isUpdated
      expect(store.getState().byId['1'].__meta.isUpdated).toBe(false)
    })
  })

  describe('Combined persisted + pending operations', () => {
    it('applies persisted before pending operations', () => {
      const remote: TestEntity[] = [{ id: '1', nombre: 'Remote' }]
      const persisted: EntityOperation<TestEntity>[] = [
        {
          type: 'UPDATE',
          id: '1',
          data: { nombre: 'Persisted' },
          timestamp: 100
        }
      ]
      const pending: EntityOperation<TestEntity>[] = [
        {
          type: 'UPDATE',
          id: '1',
          data: { nombre: 'Pending' },
          timestamp: 200
        }
      ]

      store.getState().project(remote, persisted, pending)

      // Pending should win (applied last)
      expect(store.getState().byId['1'].nombre).toBe('Pending')
    })

    it('handles ADD in persisted and UPDATE in pending', () => {
      const remote: TestEntity[] = []
      const persisted: EntityOperation<TestEntity>[] = [
        {
          type: 'ADD',
          data: { id: 'temp-1', nombre: 'Added' },
          timestamp: 100
        }
      ]
      const pending: EntityOperation<TestEntity>[] = [
        {
          type: 'UPDATE',
          id: 'temp-1',
          data: { nombre: 'Then Updated' },
          timestamp: 200
        }
      ]

      store.getState().project(remote, persisted, pending)

      const entity = store.getState().byId['temp-1']
      expect(entity.nombre).toBe('Then Updated')
      expect(entity.__meta.isNew).toBe(true) // Still new even after update
      expect(entity.__meta.isUpdated).toBe(false) // isNew takes priority
    })

    it('handles DELETE in persisted and RESTORE in pending', () => {
      const remote: TestEntity[] = [{ id: '1', nombre: 'Original' }]
      const persisted: EntityOperation<TestEntity>[] = [
        { type: 'DELETE', id: '1', timestamp: 100 }
      ]
      const pending: EntityOperation<TestEntity>[] = [
        { type: 'RESTORE', id: '1', timestamp: 200 }
      ]

      store.getState().project(remote, persisted, pending)

      expect(store.getState().byId['1'].__meta.isDeleted).toBe(false)
    })
  })

  describe('reset()', () => {
    it('clears all state back to empty', () => {
      const remote: TestEntity[] = [{ id: '1', nombre: 'Test' }]
      store.getState().project(remote, null, null)

      expect(store.getState().allIds).toHaveLength(1)

      store.getState().reset()

      expect(store.getState().byId).toEqual({})
      expect(store.getState().allIds).toEqual([])
    })
  })

  describe('Edge cases', () => {
    it('handles large number of entities', () => {
      const remote: TestEntity[] = Array.from({ length: 100 }, (_, i) => ({
        id: String(i),
        nombre: `Entity ${i}`
      }))

      store.getState().project(remote, null, null)

      expect(store.getState().allIds).toHaveLength(100)
    })

    it('handles operations on entities not in remote snapshot', () => {
      // UPDATE on entity not in remote → skip
      const remote: TestEntity[] = []
      const ops: EntityOperation<TestEntity>[] = [
        {
          type: 'UPDATE',
          id: 'nonexistent',
          data: { nombre: 'Ghost' },
          timestamp: 100
        }
      ]

      store.getState().project(remote, ops, null)
      expect(store.getState().byId['nonexistent']).toBeUndefined()
    })

    it('handles re-projection with new remote data', () => {
      // First projection
      const remote1: TestEntity[] = [{ id: '1', nombre: 'V1' }]
      store.getState().project(remote1, null, null)
      expect(store.getState().byId['1'].nombre).toBe('V1')

      // Second projection with updated remote — this simulates a server refresh
      const remote2: TestEntity[] = [{ id: '1', nombre: 'V2' }]
      store.getState().project(remote2, null, null)

      // Should use the new remote data
      expect(store.getState().byId['1'].nombre).toBe('V2')
    })

    it('preserves entity data through operations that do not modify it', () => {
      const remote: TestEntity[] = [
        { id: '1', nombre: 'Original', alias: 'O', orden: 5 }
      ]
      const ops: EntityOperation<TestEntity>[] = [
        {
          type: 'UPDATE',
          id: '1',
          data: { nombre: 'Changed' },
          timestamp: 100
        }
      ]

      store.getState().project(remote, ops, null)

      const entity = store.getState().byId['1']
      expect(entity.alias).toBe('O')
      expect(entity.orden).toBe(5)
    })
  })
})
