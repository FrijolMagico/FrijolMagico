import { describe, it, expect } from 'bun:test'
import { journalEntriesToOperations } from '@/shared/lib/journal-entries-to-operations'
import type { JournalEntry } from '@/shared/change-journal/lib/types'

interface TestEntity {
  id: string
  nombre: string
  alias?: string
}

// Helper to create a JournalEntry with minimal boilerplate
function entry(
  scopeKey: string,
  payload: JournalEntry['payload'],
  timestampMs = 1000
): JournalEntry {
  return {
    entryId: crypto.randomUUID(),
    schemaVersion: 1,
    section: 'test',
    scopeKey,
    payload,
    timestampMs,
    clientId: crypto.randomUUID()
  }
}

describe('journalEntriesToOperations', () => {
  describe('Empty input', () => {
    it('returns empty array for empty entries', () => {
      const result = journalEntriesToOperations<TestEntity>([])
      expect(result).toEqual([])
    })
  })

  describe('ADD operations (op=set, no field, wrapped data)', () => {
    it('converts full entity set to ADD operation', () => {
      const wrappedOp = {
        type: 'ADD',
        data: { id: 'temp-abc', nombre: 'Test', alias: 'T' },
        timestamp: 1000
      }
      const entries = [
        entry('artista:temp-abc', { op: 'set', value: wrappedOp }, 1000)
      ]

      const ops = journalEntriesToOperations<TestEntity>(entries)

      expect(ops).toHaveLength(1)
      expect(ops[0].type).toBe('ADD')
      const addOp = ops[0] as { type: 'ADD'; data: TestEntity }
      expect(addOp.data.id).toBe('temp-abc')
      expect(addOp.data.nombre).toBe('Test')
    })

    it('unwraps the EntityOperation wrapper correctly', () => {
      const wrappedOp = {
        type: 'ADD',
        data: { id: 'temp-1', nombre: 'Unwrapped' },
        timestamp: 500
      }
      const entries = [
        entry('artista:temp-1', { op: 'set', value: wrappedOp }, 500)
      ]

      const ops = journalEntriesToOperations<TestEntity>(entries)
      const addOp = ops[0] as { type: 'ADD'; data: TestEntity }
      expect(addOp.data).toEqual({ id: 'temp-1', nombre: 'Unwrapped' })
    })
  })

  describe('DELETE operations (op=unset)', () => {
    it('converts unset to DELETE operation', () => {
      const entries = [entry('artista:42', { op: 'unset' }, 1000)]

      const ops = journalEntriesToOperations<TestEntity>(entries)

      expect(ops).toHaveLength(1)
      expect(ops[0].type).toBe('DELETE')
      expect((ops[0] as { id: string }).id).toBe('42')
    })

    it('preserves timestamp', () => {
      const entries = [entry('artista:99', { op: 'unset' }, 5555)]

      const ops = journalEntriesToOperations<TestEntity>(entries)
      expect(ops[0].timestamp).toBe(5555)
    })
  })

  describe('RESTORE operations (op=restore)', () => {
    it('converts restore to RESTORE operation', () => {
      const entries = [entry('artista:42', { op: 'restore' }, 2000)]

      const ops = journalEntriesToOperations<TestEntity>(entries)

      expect(ops).toHaveLength(1)
      expect(ops[0].type).toBe('RESTORE')
      expect((ops[0] as { id: string }).id).toBe('42')
    })
  })

  describe('UPDATE per-field operations (op=set with field)', () => {
    it('groups field-level entries into single UPDATE', () => {
      const entries = [
        entry('artista:42:nombre', { op: 'set', value: 'New Name' }, 1000),
        entry('artista:42:alias', { op: 'set', value: 'New Alias' }, 1100)
      ]

      const ops = journalEntriesToOperations<TestEntity>(entries)

      expect(ops).toHaveLength(1)
      expect(ops[0].type).toBe('UPDATE')
      const updateOp = ops[0] as {
        id: string
        data: Record<string, unknown>
      }
      expect(updateOp.id).toBe('42')
      expect(updateOp.data).toEqual({
        nombre: 'New Name',
        alias: 'New Alias'
      })
    })

    it('newest field value wins (entries are newest-first)', () => {
      const entries = [
        entry('artista:42:nombre', { op: 'set', value: 'Newer' }, 2000),
        entry('artista:42:nombre', { op: 'set', value: 'Older' }, 1000)
      ]

      const ops = journalEntriesToOperations<TestEntity>(entries)

      expect(ops).toHaveLength(1)
      const updateOp = ops[0] as {
        data: Record<string, unknown>
      }
      expect(updateOp.data.nombre).toBe('Newer')
    })

    it('uses max timestamp across grouped entries', () => {
      const entries = [
        entry('artista:42:nombre', { op: 'set', value: 'A' }, 2000),
        entry('artista:42:alias', { op: 'set', value: 'B' }, 3000)
      ]

      const ops = journalEntriesToOperations<TestEntity>(entries)
      expect(ops[0].timestamp).toBe(3000)
    })
  })

  describe('PATCH operations (op=patch)', () => {
    it('converts patch to UPDATE operation', () => {
      const entries = [
        entry(
          'artista:42',
          { op: 'patch', value: { nombre: 'Patched', alias: 'P' } },
          1000
        )
      ]

      const ops = journalEntriesToOperations<TestEntity>(entries)

      expect(ops).toHaveLength(1)
      expect(ops[0].type).toBe('UPDATE')
      const updateOp = ops[0] as {
        id: string
        data: Record<string, unknown>
      }
      expect(updateOp.id).toBe('42')
      expect(updateOp.data).toEqual({ nombre: 'Patched', alias: 'P' })
    })
  })

  describe('Mixed operations', () => {
    it('processes all operation types together', () => {
      const addWrapper = {
        type: 'ADD',
        data: { id: 'temp-1', nombre: 'New' },
        timestamp: 500
      }
      const entries = [
        entry('artista:temp-1', { op: 'set', value: addWrapper }, 500),
        entry('artista:42:nombre', { op: 'set', value: 'Updated' }, 1000),
        entry('artista:99', { op: 'unset' }, 1500),
        entry('artista:50', { op: 'restore' }, 2000)
      ]

      const ops = journalEntriesToOperations<TestEntity>(entries)

      expect(ops).toHaveLength(4)
      const types = ops.map((op) => op.type)
      expect(types).toContain('ADD')
      expect(types).toContain('UPDATE')
      expect(types).toContain('DELETE')
      expect(types).toContain('RESTORE')
    })

    it('sorts output by timestamp ascending', () => {
      const addWrapper = {
        type: 'ADD',
        data: { id: 'temp-1', nombre: 'New' },
        timestamp: 3000
      }
      const entries = [
        entry('artista:temp-1', { op: 'set', value: addWrapper }, 3000),
        entry('artista:99', { op: 'unset' }, 1000),
        entry('artista:50', { op: 'restore' }, 2000)
      ]

      const ops = journalEntriesToOperations<TestEntity>(entries)

      for (let i = 1; i < ops.length; i++) {
        expect(ops[i].timestamp).toBeGreaterThanOrEqual(ops[i - 1].timestamp)
      }
    })
  })

  describe('Edge cases', () => {
    it('skips entries without entityId', () => {
      const entries = [
        entry('artista', { op: 'unset' }, 1000) // No entityId (only 1 part)
      ]

      const ops = journalEntriesToOperations<TestEntity>(entries)
      expect(ops).toEqual([])
    })

    it('handles multiple entities independently', () => {
      const entries = [
        entry('artista:1:nombre', { op: 'set', value: 'Entity1' }, 1000),
        entry('artista:2:nombre', { op: 'set', value: 'Entity2' }, 1100)
      ]

      const ops = journalEntriesToOperations<TestEntity>(entries)

      expect(ops).toHaveLength(2)
      const ids = ops.map((op) => (op as { id: string }).id)
      expect(ids).toContain('1')
      expect(ids).toContain('2')
    })

    it('handles duplicate DELETE entries for same entity', () => {
      const entries = [
        entry('artista:42', { op: 'unset' }, 1000),
        entry('artista:42', { op: 'unset' }, 900)
      ]

      const ops = journalEntriesToOperations<TestEntity>(entries)

      const deleteOps = ops.filter((op) => op.type === 'DELETE')
      expect(deleteOps).toHaveLength(2) // Both are emitted (no dedup at this layer)
    })

    it('single field entry produces UPDATE', () => {
      const entries = [
        entry('artista:42:nombre', { op: 'set', value: 'Solo' }, 1000)
      ]

      const ops = journalEntriesToOperations<TestEntity>(entries)

      expect(ops).toHaveLength(1)
      expect(ops[0].type).toBe('UPDATE')
    })
  })
})
