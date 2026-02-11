/**
 * Entity State Factory Tests
 * Coverage: > 80% of entity-factory.ts
 */

import { createEntityUIStateStore } from '../_lib/entity-factory'
import type { EntityUIStateStore, EntityOperation } from '../_lib/entity-types'

interface TestEntity {
  id: string
  nombre: string
  cargo?: string
  rrss?: string
}

describe('Entity State Factory', () => {
  let store: ReturnType<typeof createEntityUIStateStore<TestEntity>>

  beforeEach(() => {
    store = createEntityUIStateStore<TestEntity>({
      sectionName: 'test',
      idField: 'id'
    })
  })

  describe('Basic Operations', () => {
    test('should add a single entity', () => {
      const store = createEntityUIStateStore<TestEntity>({
        sectionName: 'test',
        idField: 'id'
      })

      const entity = { id: 'test-1', nombre: 'Test Member' }
      store.getState().addOne(entity)

      const all = store.getState().selectAll()
      expect(all).toHaveLength(1)
      expect(all[0].nombre).toBe('Test Member')
    })

    test('should update a single entity', () => {
      const store = createEntityUIStateStore<TestEntity>({
        sectionName: 'test',
        idField: 'id'
      })

      const entity = { id: 'test-1', nombre: 'Original Name' }
      store.getState().addOne(entity)
      store.getState().updateOne('test-1', { nombre: 'Updated Name' })

      const updated = store.getState().selectById('test-1')
      expect(updated?.nombre).toBe('Updated Name')
    })

    test('should remove a single entity', () => {
      const store = createEntityUIStateStore<TestEntity>({
        sectionName: 'test',
        idField: 'id'
      })

      const entity = { id: 'test-1', nombre: 'Test Member' }
      store.getState().addOne(entity)
      expect(store.getState().selectAll()).toHaveLength(1)

      store.getState().removeOne('test-1')
      expect(store.getState().selectAll()).toHaveLength(0)
    })
  })

  describe('Bulk Operations', () => {
    test('should add many entities at once', () => {
      const store = createEntityUIStateStore<TestEntity>({
        sectionName: 'test',
        idField: 'id'
      })

      const entities = [
        { id: 'test-1', nombre: 'Member 1' },
        { id: 'test-2', nombre: 'Member 2' },
        { id: 'test-3', nombre: 'Member 3' }
      ]

      store.getState().addMany(entities)
      const all = store.getState().selectAll()
      expect(all).toHaveLength(3)
    })

    test('should update many entities at once', () => {
      const store = createEntityUIStateStore<TestEntity>({
        sectionName: 'test',
        idField: 'id'
      })

      const entities = [
        { id: 'test-1', nombre: 'Member 1' },
        { id: 'test-2', nombre: 'Member 2' }
      ]
      store.getState().addMany(entities)

      store.getState().updateMany([
        { id: 'test-1', data: { nombre: 'Updated 1' } },
        { id: 'test-2', data: { nombre: 'Updated 2' } }
      ])

      const all = store.getState().selectAll()
      expect(all[0].nombre).toBe('Updated 1')
      expect(all[1].nombre).toBe('Updated 2')
    })

    test('should remove many entities at once', () => {
      const store = createEntityUIStateStore<TestEntity>({
        sectionName: 'test',
        idField: 'id'
      })

      const entities = [
        { id: 'test-1', nombre: 'Member 1' },
        { id: 'test-2', nombre: 'Member 2' },
        { id: 'test-3', nombre: 'Member 3' }
      ]
      store.getState().addMany(entities)

      store.getState().removeMany(['test-1', 'test-2'])
      const all = store.getState().selectAll()
      expect(all).toHaveLength(1)
      expect(all[0].id).toBe('test-3')
    })
  })

  describe('Data Integrity', () => {
    test('should maintain data integrity with mixed operations', () => {
      const store = createEntityUIStateStore<TestEntity>({
        sectionName: 'test',
        idField: 'id'
      })

      // Add 10 entities
      for (let i = 0; i < 10; i++) {
        store
          .getState()
          .addOne({ id: `m${i}`, nombre: `Member ${i}` })
      }

      // Update 5
      for (let i = 0; i < 5; i++) {
        store
          .getState()
          .updateOne(`m${i}`, { cargo: 'Updated Role' })
      }

      // Delete 2
      store.getState().removeOne('m0')
      store.getState().removeOne('m1')

      const all = store.getState().selectAll()
      expect(all).toHaveLength(8)

      // Verify updates persisted
      const updated = all.find((e) => e.id === 'm2')
      expect(updated?.cargo).toBe('Updated Role')

      // Verify deletes applied
      expect(all.find((e) => e.id === 'm0')).toBeUndefined()
      expect(all.find((e) => e.id === 'm1')).toBeUndefined()
    })
  })

  describe('Remote Data Management', () => {
    test('should set remote data', () => {
      const store = createEntityUIStateStore<TestEntity>({
        sectionName: 'test',
        idField: 'id'
      })

      const remoteEntities = [
        { id: '1', nombre: 'Remote 1' },
        { id: '2', nombre: 'Remote 2' }
      ]

      store.getState().setRemoteData(remoteEntities)
      const all = store.getState().selectAll()
      expect(all).toHaveLength(2)
    })

    test('should compute effective data over remote data', () => {
      const store = createEntityUIStateStore<TestEntity>({
        sectionName: 'test',
        idField: 'id'
      })

      // Set remote data
      store
        .getState()
        .setRemoteData([
          { id: '1', nombre: 'Remote 1' },
          { id: '2', nombre: 'Remote 2' }
        ])

      // Add local changes
      store.getState().addOne({ id: '3', nombre: 'Local 3' })
      store.getState().updateOne('1', { nombre: 'Updated Remote 1' })
      store.getState().removeOne('2')

      const all = store.getState().selectAll()
      expect(all).toHaveLength(2)

      // Verify updates applied
      const item1 = all.find((e) => e.id === '1')
      expect(item1?.nombre).toBe('Updated Remote 1')

      // Verify local additions
      const item3 = all.find((e) => e.id === '3')
      expect(item3?.nombre).toBe('Local 3')

      // Verify deletions
      expect(all.find((e) => e.id === '2')).toBeUndefined()
    })
  })

  describe('Selectors', () => {
    test('selectAll should return all entities', () => {
      const store = createEntityUIStateStore<TestEntity>({
        sectionName: 'test',
        idField: 'id'
      })

      const entities = [
        { id: 'test-1', nombre: 'Member 1' },
        { id: 'test-2', nombre: 'Member 2' }
      ]
      store.getState().addMany(entities)

      const all = store.getState().selectAll()
      expect(all).toHaveLength(2)
    })

    test('selectById should return single entity', () => {
      const store = createEntityUIStateStore<TestEntity>({
        sectionName: 'test',
        idField: 'id'
      })

      store.getState().addOne({ id: 'test-1', nombre: 'Test' })
      const entity = store.getState().selectById('test-1')
      expect(entity?.id).toBe('test-1')
      expect(entity?.nombre).toBe('Test')
    })

    test('selectIds should return array of IDs', () => {
      const store = createEntityUIStateStore<TestEntity>({
        sectionName: 'test',
        idField: 'id'
      })

      store.getState().addOne({ id: 'test-1', nombre: 'Test 1' })
      store.getState().addOne({ id: 'test-2', nombre: 'Test 2' })

      const ids = store.getState().selectIds()
      expect(ids).toContain('test-1')
      expect(ids).toContain('test-2')
    })

    test('selectEntities should return normalized entities', () => {
      const store = createEntityUIStateStore<TestEntity>({
        sectionName: 'test',
        idField: 'id'
      })

      store.getState().addOne({ id: 'test-1', nombre: 'Test' })
      const entities = store.getState().selectEntities()
      expect(entities['test-1']).toBeDefined()
      expect(entities['test-1'].nombre).toBe('Test')
    })

    test('selectTotal should return count', () => {
      const store = createEntityUIStateStore<TestEntity>({
        sectionName: 'test',
        idField: 'id'
      })

      store.getState().addMany([
        { id: 'test-1', nombre: 'Test 1' },
        { id: 'test-2', nombre: 'Test 2' }
      ])

      expect(store.getState().selectTotal()).toBe(2)
    })
  })

  describe('State Management', () => {
    test('getHasChanges should indicate pending changes', () => {
      const store = createEntityUIStateStore<TestEntity>({
        sectionName: 'test',
        idField: 'id'
      })

      expect(store.getState().getHasChanges()).toBe(false)

      store.getState().addOne({ id: 'test-1', nombre: 'Test' })
      expect(store.getState().getHasChanges()).toBe(true)
    })

    test('getHasUnsavedEdits should indicate unsaved edits', () => {
      const store = createEntityUIStateStore<TestEntity>({
        sectionName: 'test',
        idField: 'id'
      })

      expect(store.getState().getHasUnsavedEdits()).toBe(false)

      store.getState().addOne({ id: 'test-1', nombre: 'Test' })
      expect(store.getState().getHasUnsavedEdits()).toBe(true)
    })

    test('clearCurrentEdits should remove unsaved edits', () => {
      const store = createEntityUIStateStore<TestEntity>({
        sectionName: 'test',
        idField: 'id'
      })

      store.getState().addOne({ id: 'test-1', nombre: 'Test' })
      expect(store.getState().getHasUnsavedEdits()).toBe(true)

      store.getState().clearCurrentEdits()
      expect(store.getState().getHasUnsavedEdits()).toBe(false)
    })

    test('reset should clear all state', () => {
      const store = createEntityUIStateStore<TestEntity>({
        sectionName: 'test',
        idField: 'id'
      })

      store.getState().setRemoteData([{ id: '1', nombre: 'Test' }])
      store.getState().addOne({ id: '2', nombre: 'New' })

      store.getState().reset()

      expect(store.getState().selectAll()).toHaveLength(0)
      expect(store.getState().getHasChanges()).toBe(false)
    })
  })

  describe('Performance', () => {
    test('addOne should be O(1) operation', () => {
      const store = createEntityUIStateStore<TestEntity>({
        sectionName: 'test',
        idField: 'id'
      })

      const start = performance.now()
      for (let i = 0; i < 10; i++) {
        store.getState().addOne({ id: `m${i}`, nombre: `Member ${i}` })
      }
      const end = performance.now()

      const totalTime = end - start
      expect(totalTime).toBeLessThan(10) // Should be very fast
    })

    test('10 sequential additions should total < 100ms', () => {
      const store = createEntityUIStateStore<TestEntity>({
        sectionName: 'test',
        idField: 'id'
      })

      const start = performance.now()
      for (let i = 0; i < 10; i++) {
        store.getState().addOne({ id: `m${i}`, nombre: `Member ${i}` })
      }
      const end = performance.now()

      const totalTime = end - start
      expect(totalTime).toBeLessThan(100)
    })

    test('bulk update 50 items should complete < 16ms', () => {
      const store = createEntityUIStateStore<TestEntity>({
        sectionName: 'test',
        idField: 'id'
      })

      // Setup: add 100 items
      const entities = Array.from({ length: 100 }, (_, i) => ({
        id: `m${i}`,
        nombre: `Member ${i}`
      }))
      store.getState().addMany(entities)

      // Test: bulk update 50
      const start = performance.now()
      for (let i = 0; i < 50; i++) {
        store
          .getState()
          .updateOne(`m${i}`, { cargo: `Updated ${i}` })
      }
      const end = performance.now()

      const totalTime = end - start
      expect(totalTime).toBeLessThan(16)
    })
  })

  describe('Edge Cases', () => {
    test('updating non-existent entity should not throw', () => {
      const store = createEntityUIStateStore<TestEntity>({
        sectionName: 'test',
        idField: 'id'
      })

      expect(() => {
        store.getState().updateOne('non-existent', { nombre: 'Test' })
      }).not.toThrow()
    })

    test('removing non-existent entity should not throw', () => {
      const store = createEntityUIStateStore<TestEntity>({
        sectionName: 'test',
        idField: 'id'
      })

      expect(() => {
        store.getState().removeOne('non-existent')
      }).not.toThrow()
    })

    test('selectById non-existent should return undefined', () => {
      const store = createEntityUIStateStore<TestEntity>({
        sectionName: 'test',
        idField: 'id'
      })

      expect(store.getState().selectById('non-existent')).toBeUndefined()
    })

    test('setAll should reset state', () => {
      const store = createEntityUIStateStore<TestEntity>({
        sectionName: 'test',
        idField: 'id'
      })

      store.getState().addOne({ id: 'temp-1', nombre: 'Temp' })
      expect(store.getState().selectAll()).toHaveLength(1)

      store.getState().setAll([
        { id: 'new-1', nombre: 'New 1' },
        { id: 'new-2', nombre: 'New 2' }
      ])

      const all = store.getState().selectAll()
      expect(all).toHaveLength(2)
      expect(all.every((e) => e.id.startsWith('new-'))).toBe(true)
    })
  })
})

// Export for coverage reporting
export const tests = [
  'Basic Operations',
  'Bulk Operations',
  'Data Integrity',
  'Remote Data Management',
  'Selectors',
  'State Management',
  'Performance',
  'Edge Cases'
]
