/**
 * Operation Sorter Tests
 */

import { describe, expect, test } from 'bun:test'
import {
  sortOperations,
  validateOperations
} from '@/shared/commit-system/lib/operation-sorter'
import type { JournalEntry } from '@/shared/change-journal/lib/types'

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
    })

    test('should handle empty entries', () => {
      const result = sortOperations([])

      expect(result.deletes).toHaveLength(0)
      expect(result.updates).toHaveLength(0)
      expect(result.creates).toHaveLength(0)
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
    })
  })

  describe('validateOperations', () => {
    test('should detect contradictory operations', () => {
      const entries: JournalEntry[] = [
        {
          entryId: '1',
          schemaVersion: 1,
          section: 'test',
          scopeKey: 'test:1:field',
          payload: { op: 'unset' },
          timestampMs: 100,
          clientId: 'client-1'
        },
        {
          entryId: '2',
          schemaVersion: 1,
          section: 'test',
          scopeKey: 'test:1:otherfield',
          payload: { op: 'patch', value: { field: 'updated' } },
          timestampMs: 200,
          clientId: 'client-1'
        }
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
        {
          entryId: '1',
          schemaVersion: 1,
          section: 'test',
          scopeKey: 'test:1',
          payload: { op: 'unset' },
          timestampMs: 100,
          clientId: 'client-1'
        },
        {
          entryId: '2',
          schemaVersion: 1,
          section: 'test',
          scopeKey: 'test:2',
          payload: { op: 'patch', value: { name: 'updated' } },
          timestampMs: 200,
          clientId: 'client-1'
        }
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
        // Entity 1 contradiction
        {
          entryId: '1',
          schemaVersion: 1,
          section: 'test',
          scopeKey: 'test:1',
          payload: { op: 'unset' },
          timestampMs: 100,
          clientId: 'client-1'
        },
        {
          entryId: '2',
          schemaVersion: 1,
          section: 'test',
          scopeKey: 'test:1:field',
          payload: { op: 'patch', value: { field: 'updated' } },
          timestampMs: 200,
          clientId: 'client-1'
        },
        // Entity 2 contradiction
        {
          entryId: '3',
          schemaVersion: 1,
          section: 'test',
          scopeKey: 'test:2',
          payload: { op: 'unset' },
          timestampMs: 300,
          clientId: 'client-1'
        },
        {
          entryId: '4',
          schemaVersion: 1,
          section: 'test',
          scopeKey: 'test:2:field1',
          payload: { op: 'set', value: { field1: 'new' } },
          timestampMs: 400,
          clientId: 'client-1'
        }
      ]

      const result = validateOperations(entries)

      expect(result.valid).toBe(false)
      expect(result.errors).toHaveLength(2)
      expect(result.errors[0]).toContain('entity "1"')
      expect(result.errors[1]).toContain('entity "2"')
    })

    test('should handle multiple updates to same entity', () => {
      const entries: JournalEntry[] = [
        {
          entryId: '1',
          schemaVersion: 1,
          section: 'test',
          scopeKey: 'test:1:field1',
          payload: { op: 'patch', value: { field1: 'value1' } },
          timestampMs: 100,
          clientId: 'client-1'
        },
        {
          entryId: '2',
          schemaVersion: 1,
          section: 'test',
          scopeKey: 'test:1:field2',
          payload: { op: 'patch', value: { field2: 'value2' } },
          timestampMs: 200,
          clientId: 'client-1'
        }
      ]

      const result = validateOperations(entries)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })
  })
})
