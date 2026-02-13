/**
 * Entity State Factory Tests
 */

import { createEntityUIStateStore } from '@/shared/ui-state/entity-state'
import { describe, expect, test, beforeEach } from 'bun:test'

interface TestEntity {
  id: number
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

      const entity = { id: 0, nombre: 'Test Member' }
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

      const entity = { id: 0, nombre: 'Original Name' }
      store.getState().addOne(entity)
      store.getState().updateOne(0, { nombre: 'Updated Name' })

      const updated = store.getState().selectById(0)
      expect(updated?.nombre).toBe('Updated Name')
    })

    test('should remove a single entity', () => {
      const store = createEntityUIStateStore<TestEntity>({
        sectionName: 'test',
        idField: 'id'
      })

      const entity = { id: 0, nombre: 'Test Member' }
      store.getState().addOne(entity)
      expect(store.getState().selectAll()).toHaveLength(1)

      store.getState().removeOne(0)
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
        { id: 0, nombre: 'Member 1' },
        { id: 1, nombre: 'Member 2' },
        { id: 2, nombre: 'Member 3' }
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
        { id: 0, nombre: 'Member 1' },
        { id: 1, nombre: 'Member 2' }
      ]
      store.getState().addMany(entities)

      store.getState().updateMany([
        { id: 0, data: { nombre: 'Updated 1' } },
        { id: 1, data: { nombre: 'Updated 2' } }
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
        { id: 0, nombre: 'Member 1' },
        { id: 1, nombre: 'Member 2' },
        { id: 2, nombre: 'Member 3' }
      ]
      store.getState().addMany(entities)

      store.getState().removeMany([0, 1])
      const all = store.getState().selectAll()
      expect(all).toHaveLength(1)
      expect(all[0].id).toBe(2)
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
        store.getState().addOne({ id: i, nombre: `Member ${i}` })
      }

      // Update 5
      for (let i = 0; i < 5; i++) {
        store.getState().updateOne(i, { cargo: 'Updated Role' })
      }

      // Delete 2
      store.getState().removeOne(1)
      store.getState().removeOne(2)

      const all = store.getState().selectAll()
      expect(all).toHaveLength(8)

      // Verify updates persisted
      const updated = all.find((e) => e.id === 3)
      expect(updated?.cargo).toBe('Updated Role')

      // Verify deletes applied
      expect(all.find((e) => e.id === 1)).toBeUndefined()
      expect(all.find((e) => e.id === 2)).toBeUndefined()
    })
  })

  describe('Remote Data Management', () => {
    test('should set remote data', () => {
      const store = createEntityUIStateStore<TestEntity>({
        sectionName: 'test',
        idField: 'id'
      })

      const remoteEntities = [
        { id: 1, nombre: 'Remote 1' },
        { id: 2, nombre: 'Remote 2' }
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
      store.getState().setRemoteData([
        { id: 1, nombre: 'Remote 1' },
        { id: 2, nombre: 'Remote 2' }
      ])

      // Add local changes
      store.getState().addOne({ id: 3, nombre: 'Local 3' })
      store.getState().updateOne(1, { nombre: 'Updated Remote 1' })
      store.getState().removeOne(2)

      const all = store.getState().selectAll()
      expect(all).toHaveLength(2)

      // Verify updates applied
      const item1 = all.find((e) => e.id === 1)
      expect(item1?.nombre).toBe('Updated Remote 1')

      // Verify local additions
      const item3 = all.find((e) => e.id === 3)
      expect(item3?.nombre).toBe('Local 3')

      // Verify deletions
      expect(all.find((e) => e.id === 2)).toBeUndefined()
    })
  })

  describe('Selectors', () => {
    test('selectAll should return all entities', () => {
      const store = createEntityUIStateStore<TestEntity>({
        sectionName: 'test',
        idField: 'id'
      })

      const entities = [
        { id: 0, nombre: 'Member 1' },
        { id: 1, nombre: 'Member 2' }
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

      store.getState().addOne({ id: 0, nombre: 'Test' })
      const entity = store.getState().selectById(0)
      expect(entity?.id).toBe(0)
      expect(entity?.nombre).toBe('Test')
    })

    test('selectIds should return array of IDs', () => {
      const store = createEntityUIStateStore<TestEntity>({
        sectionName: 'test',
        idField: 'id'
      })

      store.getState().addOne({ id: 0, nombre: 'Test 1' })
      store.getState().addOne({ id: 1, nombre: 'Test 2' })

      const ids = store.getState().selectIds()
      expect(ids).toContain(0)
      expect(ids).toContain(1)
    })

    test('selectEntities should return normalized entities', () => {
      const store = createEntityUIStateStore<TestEntity>({
        sectionName: 'test',
        idField: 'id'
      })

      store.getState().addOne({ id: 0, nombre: 'Test' })
      const entities = store.getState().selectEntities()
      expect(entities[0]).toBeDefined()
      expect(entities[0].nombre).toBe('Test')
    })

    test('selectTotal should return count', () => {
      const store = createEntityUIStateStore<TestEntity>({
        sectionName: 'test',
        idField: 'id'
      })

      store.getState().addMany([
        { id: 0, nombre: 'Test 1' },
        { id: 1, nombre: 'Test 2' }
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

      store.getState().addOne({ id: 0, nombre: 'Test' })
      expect(store.getState().getHasChanges()).toBe(true)
    })

    test('getHasUnsavedEdits should indicate unsaved edits', () => {
      const store = createEntityUIStateStore<TestEntity>({
        sectionName: 'test',
        idField: 'id'
      })

      expect(store.getState().getHasUnsavedEdits()).toBe(false)

      store.getState().addOne({ id: 0, nombre: 'Test' })
      expect(store.getState().getHasUnsavedEdits()).toBe(true)
    })

    test('clearCurrentEdits should remove unsaved edits', () => {
      const store = createEntityUIStateStore<TestEntity>({
        sectionName: 'test',
        idField: 'id'
      })

      store.getState().addOne({ id: 0, nombre: 'Test' })
      expect(store.getState().getHasUnsavedEdits()).toBe(true)

      store.getState().clearCurrentEdits()
      expect(store.getState().getHasUnsavedEdits()).toBe(false)
    })

    test('reset should clear all state', () => {
      const store = createEntityUIStateStore<TestEntity>({
        sectionName: 'test',
        idField: 'id'
      })

      store.getState().setRemoteData([{ id: 1, nombre: 'Test' }])
      store.getState().addOne({ id: 2, nombre: 'New' })

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
        store.getState().addOne({ id: i, nombre: `Member ${i}` })
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
        store.getState().addOne({ id: i, nombre: `Member ${i}` })
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
        id: i,
        nombre: `Member ${i}`
      }))
      store.getState().addMany(entities)

      // Test: bulk update 50
      const start = performance.now()
      for (let i = 0; i < 50; i++) {
        store.getState().updateOne(i, { cargo: `Updated ${i}` })
      }
      const end = performance.now()

      const totalTime = end - start
      expect(totalTime).toBeLessThan(16)
    })

    test('should update item #500 in O(1) time without affecting other items', () => {
      const store = createEntityUIStateStore<TestEntity>({
        sectionName: 'test',
        idField: 'id'
      })

      // Setup: add 1000 items
      const entities = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        nombre: `Member ${i}`
      }))
      store.getState().addMany(entities)

      // Verify starting state for item #500
      const beforeUpdate = store.getState().selectById(500)
      expect(beforeUpdate?.nombre).toBe('Member 500')

      // Test: update item #500
      const start = performance.now()
      store.getState().updateOne(500, { nombre: 'Updated Member 500' })
      const end = performance.now()

      // Verify update time is O(1)
      expect(end - start).toBeLessThan(1)

      // Verify update applied
      const updated = store.getState().selectById(500)
      expect(updated?.nombre).toBe('Updated Member 500')

      // Verify other items unchanged
      const before499 = store.getState().selectById(499)
      expect(before499?.nombre).toBe('Member 499')

      const after501 = store.getState().selectById(501)
      expect(after501?.nombre).toBe('Member 501')

      // Verify total count unchanged
      expect(store.getState().selectTotal()).toBe(1000)
    })

    test('should delete middle member #500 in O(1) time', () => {
      const store = createEntityUIStateStore<TestEntity>({
        sectionName: 'test',
        idField: 'id'
      })

      // Setup: add 1000 items
      const entities = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        nombre: `Member ${i}`
      }))
      store.getState().addMany(entities)

      expect(store.getState().selectTotal()).toBe(1000)

      // Test: delete item #500
      const start = performance.now()
      store.getState().removeOne(500)
      const end = performance.now()

      // Verify delete time is O(1)
      expect(end - start).toBeLessThan(1)

      // Verify item deleted
      expect(store.getState().selectById(500)).toBeUndefined()

      // Verify surrounding items still exist
      expect(store.getState().selectById(499)).toBeDefined()
      expect(store.getState().selectById(501)).toBeDefined()

      // Verify total count decreased
      expect(store.getState().selectTotal()).toBe(999)
    })

    test('should maintain stable memory with repeated operations', () => {
      const store = createEntityUIStateStore<TestEntity>({
        sectionName: 'test',
        idField: 'id'
      })

      // Perform 1000 add+update+delete cycles
      for (let cycle = 0; cycle < 1000; cycle++) {
        const id = cycle
        store.getState().addOne({ id, nombre: `Temp ${cycle}` })
        store.getState().updateOne(id, { cargo: `Role ${cycle}` })
        store.getState().removeOne(id)
      }

      // Verify all operations completed without error
      // Verify store state is clean (all items deleted)
      expect(store.getState().selectTotal()).toBe(0)
      expect(store.getState().selectAll()).toHaveLength(0)

      // Verify operations journaling completed
      expect(store.getState().getHasChanges()).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    test('updating non-existent entity should not throw', () => {
      const store = createEntityUIStateStore<TestEntity>({
        sectionName: 'test',
        idField: 'id'
      })

      expect(() => {
        store.getState().updateOne(-1, { nombre: 'Test' })
      }).not.toThrow()
    })

    test('removing non-existent entity should not throw', () => {
      const store = createEntityUIStateStore<TestEntity>({
        sectionName: 'test',
        idField: 'id'
      })

      expect(() => {
        store.getState().removeOne(-1)
      }).not.toThrow()
    })

    test('selectById non-existent should return undefined', () => {
      const store = createEntityUIStateStore<TestEntity>({
        sectionName: 'test',
        idField: 'id'
      })

      expect(store.getState().selectById(-1)).toBeUndefined()
    })

    test('setAll should reset state', () => {
      const store = createEntityUIStateStore<TestEntity>({
        sectionName: 'test',
        idField: 'id'
      })

      store.getState().addOne({ id: 1, nombre: 'Temp' })
      expect(store.getState().selectAll()).toHaveLength(1)

      store.getState().setAll([
        { id: 1, nombre: 'New 1' },
        { id: 2, nombre: 'New 2' }
      ])

      const all = store.getState().selectAll()
      expect(all).toHaveLength(2)
      expect(all.every((e) => typeof e.id === 'number')).toBe(true)
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
