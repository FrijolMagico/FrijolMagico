/**
 * Operation Sorter Tests
 */

import { describe, expect, test } from 'bun:test'
import {
  sortOperations,
  validateOperations
} from '@/shared/commit-system/lib/operation-sorter'
import type { JournalEntry } from '@/shared/change-journal/lib/types'

function makeEntry(
  overrides: Partial<JournalEntry> &
    Pick<JournalEntry, 'scopeKey' | 'payload' | 'timestampMs'>
): JournalEntry {
  return {
    entryId: crypto.randomUUID(),
    schemaVersion: 1,
    section: 'test',
    clientId: 'client-1',
    ...overrides
  }
}

describe('Operation Sorter', () => {
  describe('sortOperations', () => {
    test('should separate operations by type', () => {
      const entries: JournalEntry[] = [
        {
          entryId: '1',
          schemaVersion: 1,
          section: 'test',
          scopeKey: 'test:1',
          payload: { op: 'set', value: { id: 1, name: 'Create' } },
          timestampMs: 100,
          clientId: 'client-1'
        },
        {
          entryId: '2',
          schemaVersion: 1,
          section: 'test',
          scopeKey: 'test:2',
          payload: { op: 'patch', value: { name: 'Updated' } },
          timestampMs: 200,
          clientId: 'client-1'
        },
        {
          entryId: '3',
          schemaVersion: 1,
          section: 'test',
          scopeKey: 'test:3',
          payload: { op: 'unset' },
          timestampMs: 300,
          clientId: 'client-1'
        }
      ]

      const result = sortOperations(entries)

      expect(result.deletes).toHaveLength(1)
      expect(result.deletes[0].scopeKey).toBe('test:3')

      expect(result.updates).toHaveLength(2)
      expect(result.updates[0].scopeKey).toBe('test:1')
      expect(result.updates[1].scopeKey).toBe('test:2')

      expect(result.creates).toHaveLength(0)
      expect(result.restores).toHaveLength(0)
    })

    test('should handle empty entries', () => {
      const result = sortOperations([])

      expect(result.deletes).toHaveLength(0)
      expect(result.updates).toHaveLength(0)
      expect(result.creates).toHaveLength(0)
      expect(result.restores).toHaveLength(0)
    })

    test('should handle only deletes', () => {
      const entries: JournalEntry[] = [
        {
          entryId: '1',
          schemaVersion: 1,
          section: 'test',
          scopeKey: 'test:1',
          payload: { op: 'unset' },
          timestampMs: 100,
          clientId: 'client-1'
        }
      ]

      const result = sortOperations(entries)

      expect(result.deletes).toHaveLength(1)
      expect(result.updates).toHaveLength(0)
      expect(result.creates).toHaveLength(0)
      expect(result.restores).toHaveLength(0)
    })

    test('should bucket restore operations into restores', () => {
      const entries: JournalEntry[] = [
        makeEntry({
          scopeKey: 'test:1',
          payload: { op: 'unset' },
          timestampMs: 100
        }),
        makeEntry({
          scopeKey: 'test:1',
          payload: { op: 'restore' },
          timestampMs: 200
        })
      ]

      const result = sortOperations(entries)

      expect(result.deletes).toHaveLength(1)
      expect(result.restores).toHaveLength(1)
      expect(result.restores[0].payload.op).toBe('restore')
      expect(result.updates).toHaveLength(0)
      expect(result.creates).toHaveLength(0)
    })
  })

  describe('validateOperations', () => {
    test('should detect contradictory operations (DELETE + UPDATE without RESTORE)', () => {
      const entries: JournalEntry[] = [
        makeEntry({
          scopeKey: 'test:1:field',
          payload: { op: 'unset' },
          timestampMs: 100
        }),
        makeEntry({
          scopeKey: 'test:1:otherfield',
          payload: { op: 'patch', value: { field: 'updated' } },
          timestampMs: 200
        })
      ]

      const result = validateOperations(entries)

      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toContain('entity "1"')
      expect(result.errors[0]).toContain('deleted')
      expect(result.errors[0]).toContain('modified')
    })

    test('should allow separate entity operations', () => {
      const entries: JournalEntry[] = [
        makeEntry({
          scopeKey: 'test:1',
          payload: { op: 'unset' },
          timestampMs: 100
        }),
        makeEntry({
          scopeKey: 'test:2',
          payload: { op: 'patch', value: { name: 'updated' } },
          timestampMs: 200
        })
      ]

      const result = validateOperations(entries)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('should validate empty entries', () => {
      const result = validateOperations([])

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('should detect multiple contradictions', () => {
      const entries: JournalEntry[] = [
        makeEntry({
          scopeKey: 'test:1',
          payload: { op: 'unset' },
          timestampMs: 100
        }),
        makeEntry({
          scopeKey: 'test:1:field',
          payload: { op: 'patch', value: { field: 'updated' } },
          timestampMs: 200
        }),
        makeEntry({
          scopeKey: 'test:2',
          payload: { op: 'unset' },
          timestampMs: 300
        }),
        makeEntry({
          scopeKey: 'test:2:field1',
          payload: { op: 'set', value: { field1: 'new' } },
          timestampMs: 400
        })
      ]

      const result = validateOperations(entries)

      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(2)
      expect(result.errors[0]).toContain('entity "1"')
      expect(result.errors[1]).toContain('entity "2"')
    })

    test('should handle multiple updates to same entity', () => {
      const entries: JournalEntry[] = [
        makeEntry({
          scopeKey: 'test:1:field1',
          payload: { op: 'patch', value: { field1: 'value1' } },
          timestampMs: 100
        }),
        makeEntry({
          scopeKey: 'test:1:field2',
          payload: { op: 'patch', value: { field2: 'value2' } },
          timestampMs: 200
        })
      ]

      const result = validateOperations(entries)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('DELETE + RESTORE → valid (restore compensates delete)', () => {
      const entries: JournalEntry[] = [
        makeEntry({
          scopeKey: 'test:entity-a',
          payload: { op: 'unset' },
          timestampMs: 100
        }),
        makeEntry({
          scopeKey: 'test:entity-a',
          payload: { op: 'restore' },
          timestampMs: 200
        })
      ]

      const result = validateOperations(entries)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('DELETE + RESTORE + UPDATE → valid (restore re-activates before update)', () => {
      const entries: JournalEntry[] = [
        makeEntry({
          scopeKey: 'test:entity-b',
          payload: { op: 'unset' },
          timestampMs: 100
        }),
        makeEntry({
          scopeKey: 'test:entity-b',
          payload: { op: 'restore' },
          timestampMs: 200
        }),
        makeEntry({
          scopeKey: 'test:entity-b:name',
          payload: { op: 'patch', value: { name: 'Updated' } },
          timestampMs: 300
        })
      ]

      const result = validateOperations(entries)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('DELETE + RESTORE + DELETE → valid (final state: deleted, no modification while deleted)', () => {
      const entries: JournalEntry[] = [
        makeEntry({
          scopeKey: 'test:entity-c',
          payload: { op: 'unset' },
          timestampMs: 100
        }),
        makeEntry({
          scopeKey: 'test:entity-c',
          payload: { op: 'restore' },
          timestampMs: 200
        }),
        makeEntry({
          scopeKey: 'test:entity-c',
          payload: { op: 'unset' },
          timestampMs: 300
        })
      ]

      const result = validateOperations(entries)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('ADD + DELETE for temp ID → valid (temporal reduction)', () => {
      const entries: JournalEntry[] = [
        makeEntry({
          scopeKey: 'test:temp-123',
          payload: { op: 'set', value: { id: 'temp-123', name: 'New Entity' } },
          timestampMs: 100
        }),
        makeEntry({
          scopeKey: 'test:temp-123:name',
          payload: { op: 'patch', value: { name: 'Renamed' } },
          timestampMs: 150
        }),
        makeEntry({
          scopeKey: 'test:temp-123',
          payload: { op: 'unset' },
          timestampMs: 200
        })
      ]

      const result = validateOperations(entries)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('DELETE + UPDATE without RESTORE → still invalid', () => {
      const entries: JournalEntry[] = [
        makeEntry({
          scopeKey: 'test:entity-d',
          payload: { op: 'unset' },
          timestampMs: 100
        }),
        makeEntry({
          scopeKey: 'test:entity-d:field',
          payload: { op: 'set', value: { field: 'value' } },
          timestampMs: 200
        })
      ]

      const result = validateOperations(entries)

      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toContain('entity "entity-d"')
    })

    test('entries processed in timestamp order regardless of array position', () => {
      const entries: JournalEntry[] = [
        makeEntry({
          scopeKey: 'test:entity-e',
          payload: { op: 'restore' },
          timestampMs: 300
        }),
        makeEntry({
          scopeKey: 'test:entity-e',
          payload: { op: 'unset' },
          timestampMs: 100
        }),
        makeEntry({
          scopeKey: 'test:entity-e:name',
          payload: { op: 'patch', value: { name: 'Updated' } },
          timestampMs: 400
        })
      ]

      const result = validateOperations(entries)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('DELETE + RESTORE + DELETE + UPDATE → invalid (update after final delete)', () => {
      const entries: JournalEntry[] = [
        makeEntry({
          scopeKey: 'test:entity-f',
          payload: { op: 'unset' },
          timestampMs: 100
        }),
        makeEntry({
          scopeKey: 'test:entity-f',
          payload: { op: 'restore' },
          timestampMs: 200
        }),
        makeEntry({
          scopeKey: 'test:entity-f',
          payload: { op: 'unset' },
          timestampMs: 300
        }),
        makeEntry({
          scopeKey: 'test:entity-f:name',
          payload: { op: 'patch', value: { name: 'Bad Update' } },
          timestampMs: 400
        })
      ]

      const result = validateOperations(entries)

      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0]).toContain('entity "entity-f"')
    })
  })
})
