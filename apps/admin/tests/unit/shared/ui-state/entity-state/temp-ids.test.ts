/**
 * Temporary ID Regression Tests
 * Tests for correct handling of temporary IDs (-1, -2, -3, etc.)
 * when adding, updating, and removing entities
 */

import { createEntityUIStateStore } from '@/shared/ui-state/entity-state'
import { describe, expect, test, beforeEach } from 'bun:test'

interface TestEntity {
  id: number
  nombre: string
  cargo?: string
}

describe('Temporary ID Management', () => {
  let store: ReturnType<typeof createEntityUIStateStore<TestEntity>>

  beforeEach(() => {
    store = createEntityUIStateStore<TestEntity>({
      sectionName: 'test',
      idField: 'id'
    })
  })

  describe('addOne with Temporary IDs', () => {
    test('should assign -1 as first temporary ID when no ID provided', () => {
      const entity = { nombre: 'Member 1' }
      store.getState().addOne(entity as TestEntity)

      const all = store.getState().selectAll()
      expect(all).toHaveLength(1)
      expect(all[0].id).toBe(-1)
    })

    test('should assign -2 as second temporary ID', () => {
      store.getState().addOne({ nombre: 'Member 1' } as TestEntity)
      store.getState().addOne({ nombre: 'Member 2' } as TestEntity)

      const all = store.getState().selectAll()
      expect(all).toHaveLength(2)
      const ids = all.map((e) => e.id)
      expect(ids).toContain(-1)
      expect(ids).toContain(-2)
    })

    test('should assign sequential negative IDs', () => {
      const count = 5
      for (let i = 0; i < count; i++) {
        store.getState().addOne({ nombre: `Member ${i}` } as TestEntity)
      }

      const ids = store
        .getState()
        .selectIds()
        .sort((a, b) => a - b)
      expect(ids).toEqual([-5, -4, -3, -2, -1])
    })

    test('nextTempId should decrement after each addition', () => {
      const stateBefore = store.getState().nextTempId
      expect(stateBefore).toBe(-1)

      store.getState().addOne({ nombre: 'Member 1' } as TestEntity)
      expect(store.getState().nextTempId).toBe(-2)

      store.getState().addOne({ nombre: 'Member 2' } as TestEntity)
      expect(store.getState().nextTempId).toBe(-3)
    })

    test('should handle explicit ID override of temporary ID', () => {
      const entity = { nombre: 'Member 1' }
      store.getState().addOne(entity as TestEntity, 999)

      const all = store.getState().selectAll()
      expect(all).toHaveLength(1)
      expect(all[0].id).toBe(999)

      expect(store.getState().nextTempId).toBe(-1)
    })
  })

  describe('addMany with Temporary IDs', () => {
    test('should assign sequential temporary IDs for entities without ID', () => {
      const entities = [
        { nombre: 'Member 1' },
        { nombre: 'Member 2' },
        { nombre: 'Member 3' }
      ] as TestEntity[]

      store.getState().addMany(entities)

      const all = store.getState().selectAll()
      expect(all).toHaveLength(3)
      const ids = all.map((e) => e.id)
      expect(ids).toContain(-1)
      expect(ids).toContain(-2)
      expect(ids).toContain(-3)
    })

    test('should handle mix of entities with and without IDs', () => {
      const entities = [
        { id: 100, nombre: 'Member 1' },
        { nombre: 'Member 2' },
        { id: 200, nombre: 'Member 3' },
        { nombre: 'Member 4' }
      ] as TestEntity[]

      store.getState().addMany(entities)

      const ids = store.getState().selectIds()
      expect(ids).toContain(100)
      expect(ids).toContain(200)
      expect(ids).toContain(-1)
      expect(ids).toContain(-2)
      expect(ids).toHaveLength(4)
    })

    test('should update nextTempId correctly after addMany with mixed IDs', () => {
      const entities = [
        { id: 100, nombre: 'Member 1' },
        { nombre: 'Member 2' },
        { nombre: 'Member 3' }
      ] as TestEntity[]

      store.getState().addMany(entities)

      expect(store.getState().nextTempId).toBe(-3)
    })

    test('should preserve temporary IDs in operation order', () => {
      const entities = [
        { nombre: 'A' },
        { nombre: 'B' },
        { nombre: 'C' }
      ] as TestEntity[]

      store.getState().addMany(entities)

      const all = store.getState().selectAll()
      expect(all[0].nombre).toBe('A')
      expect(all[1].nombre).toBe('B')
      expect(all[2].nombre).toBe('C')
    })
  })

  describe('updateOne with Temporary IDs', () => {
    test('should update entity with temporary ID', () => {
      store.getState().addOne({ nombre: 'Member 1' } as TestEntity)

      const tempId = store.getState().selectAll()[0].id
      expect(tempId).toBeLessThan(0)

      store.getState().updateOne(tempId, { cargo: 'Manager' })

      const updated = store.getState().selectById(tempId)
      expect(updated?.cargo).toBe('Manager')
      expect(updated?.nombre).toBe('Member 1')
    })

    test('should handle multiple updates on temporary ID', () => {
      store.getState().addOne({ nombre: 'Member 1' } as TestEntity)
      const tempId = store.getState().selectAll()[0].id

      store.getState().updateOne(tempId, { cargo: 'Manager' })
      store.getState().updateOne(tempId, { nombre: 'Updated Member' })

      const updated = store.getState().selectById(tempId)
      expect(updated?.nombre).toBe('Updated Member')
      expect(updated?.cargo).toBe('Manager')
    })
  })

  describe('removeOne with Temporary IDs', () => {
    test('should remove entity with temporary ID', () => {
      store.getState().addOne({ nombre: 'Member 1' } as TestEntity)
      const tempId = store.getState().selectAll()[0].id

      expect(store.getState().selectTotal()).toBe(1)

      store.getState().removeOne(tempId)

      expect(store.getState().selectTotal()).toBe(0)
      expect(store.getState().selectById(tempId)).toBeUndefined()
    })

    test('should handle removal of mixed real and temporary IDs', () => {
      store.getState().setRemoteData([
        { id: 1, nombre: 'Remote 1' },
        { id: 2, nombre: 'Remote 2' }
      ])

      store.getState().addOne({ nombre: 'Temp 1' } as TestEntity)
      store.getState().addOne({ nombre: 'Temp 2' } as TestEntity)

      expect(store.getState().selectTotal()).toBe(4)

      store.getState().removeOne(-1)
      store.getState().removeOne(-2)

      expect(store.getState().selectTotal()).toBe(2)
      expect(store.getState().selectIds()).toEqual([1, 2])
    })
  })

  describe('Complex Scenarios with Mixed IDs', () => {
    test('should maintain consistency with mixed real and temporary IDs', () => {
      store.getState().setRemoteData([
        { id: 100, nombre: 'Real 1' },
        { id: 101, nombre: 'Real 2' }
      ])

      store.getState().addOne({ nombre: 'Temp 1' } as TestEntity)
      store.getState().addOne({ nombre: 'Temp 2' } as TestEntity)

      store.getState().updateOne(100, { cargo: 'Updated' })
      const tempIds = store
        .getState()
        .selectIds()
        .filter((id) => id < 0)
      const tempId = tempIds[0]
      store.getState().updateOne(tempId, { cargo: 'Temp Updated' })

      store.getState().removeOne(101)
      store.getState().removeOne(tempIds[1])

      const all = store.getState().selectAll()
      expect(all).toHaveLength(2)

      const real100 = all.find((e) => e.id === 100)
      expect(real100?.cargo).toBe('Updated')

      const tempItem = all.find((e) => e.id === tempId)
      expect(tempItem?.cargo).toBe('Temp Updated')
    })

    test('should allow adding after mixed operations', () => {
      store.getState().addOne({ nombre: 'First' } as TestEntity)
      store.getState().addOne({ nombre: 'Second' } as TestEntity)
      store.getState().removeOne(-1)

      expect(store.getState().nextTempId).toBe(-3)

      store.getState().addOne({ nombre: 'Third' } as TestEntity)
      const all = store.getState().selectAll()
      expect(all).toHaveLength(2)
      const ids = all.map((e) => e.id)
      expect(ids).toContain(-3)
      expect(ids).toContain(-2)
    })

    test('should handle addMany after temporary ID consumption', () => {
      for (let i = 0; i < 3; i++) {
        store.getState().addOne({ nombre: `Item ${i}` } as TestEntity)
      }

      expect(store.getState().nextTempId).toBe(-4)

      const entities = [
        { nombre: 'A' },
        { nombre: 'B' },
        { nombre: 'C' }
      ] as TestEntity[]

      store.getState().addMany(entities)

      const ids = store.getState().selectIds()
      expect(ids).toHaveLength(6)
      expect(ids).toContain(-1)
      expect(ids).toContain(-2)
      expect(ids).toContain(-3)
      expect(ids).toContain(-4)
      expect(ids).toContain(-5)
      expect(ids).toContain(-6)
      expect(store.getState().nextTempId).toBe(-7)
    })
  })

  describe('Temporary ID Properties', () => {
    test('temporary IDs should be negative integers', () => {
      const count = 10
      for (let i = 0; i < count; i++) {
        store.getState().addOne({ nombre: `Member ${i}` } as TestEntity)
      }

      const ids = store.getState().selectIds()
      ids.forEach((id) => {
        expect(id).toBeLessThan(0)
        expect(Number.isInteger(id)).toBe(true)
      })
    })

    test('isOptimistic flag should be set for temporary IDs', () => {
      const entity = { nombre: 'Test' }
      store.getState().addOne(entity as TestEntity)

      const state = store.getState()
      const operation = state.currentEdits?.operations[0]

      expect(operation?.type).toBe('ADD')
      expect(operation?.id).toBe(-1)
      expect(operation?.isOptimistic).toBe(true)
    })

    test('isOptimistic should be false for explicitly provided IDs', () => {
      const entity = { nombre: 'Test' }
      store.getState().addOne(entity as TestEntity, 999)

      const state = store.getState()
      const operation = state.currentEdits?.operations[0]

      expect(operation?.type).toBe('ADD')
      expect(operation?.id).toBe(999)
      expect(operation?.isOptimistic).toBe(false)
    })
  })

  describe('Entity Field Integrity', () => {
    test('should set idField correctly for temporary IDs', () => {
      const entity = { nombre: 'Test' }
      store.getState().addOne(entity as TestEntity)

      const added = store.getState().selectAll()[0]
      expect(added.id).toBe(-1)
      expect(added.nombre).toBe('Test')
    })

    test('should preserve all fields when adding with temporary ID', () => {
      const entity = { nombre: 'Full Test', cargo: 'Director' } as TestEntity
      store.getState().addOne(entity)

      const added = store.getState().selectById(-1)
      expect(added?.nombre).toBe('Full Test')
      expect(added?.cargo).toBe('Director')
      expect(added?.id).toBe(-1)
    })
  })
})
