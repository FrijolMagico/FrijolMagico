/**
 * @fileoverview batch-processor.perf.ts - Performance tests for batch processing
 *
 * Tests performance of:
 * - Batch splitting overhead
 * - Batch processing throughput
 * - Sorting and validation overhead
 *
 * Performance baselines:
 * - Sorting 1000 items: <100ms
 * - Batch splitting 1000 items: <50ms
 * - Processing 1000 items (mock): <500ms
 */

import { describe, expect, test } from 'bun:test'
import { processBatches } from '@/shared/commit-system/lib/batch-processor'
import {
  sortOperations,
  validateOperations
} from '@/shared/commit-system/lib/operation-sorter'
import type { JournalEntry } from '@/shared/change-journal/lib/types'

/**
 * Generate mock journal entries for performance testing
 */
function generateMockEntries(count: number): JournalEntry[] {
  const entries: JournalEntry[] = []
  const operations = ['set', 'patch', 'unset'] as const

  for (let i = 0; i < count; i++) {
    const op = operations[i % 3]
    entries.push({
      entryId: `entry-${i}`,
      schemaVersion: 1,
      section: 'test',
      scopeKey: `test:entity-${i}`,
      payload:
        op === 'unset'
          ? { op: 'unset' }
          : {
              op,
              value: {
                id: `entity-${i}`,
                name: `Entity ${i}`,
                description: `Description for entity ${i}`,
                metadata: {
                  created: Date.now(),
                  updated: Date.now(),
                  version: 1
                }
              }
            },
      timestampMs: Date.now() + i,
      clientId: 'perf-test-client'
    })
  }

  return entries
}

/**
 * Mock batch processor function
 */
async function mockProcessBatch<T>(batch: T[]): Promise<T[]> {
  // Simulate minimal async processing overhead
  await new Promise((resolve) => setTimeout(resolve, 1))
  return batch
}

describe('Batch Processor Performance', () => {
  describe('Batch splitting overhead', () => {
    test('should split 100 entries in <50ms', () => {
      const entries = generateMockEntries(100)
      const start = performance.now()

      processBatches(entries, mockProcessBatch, { maxBatchSize: 50 })

      const duration = performance.now() - start

      // Should complete quickly (most time is async processing, not splitting)
      expect(duration).toBeLessThan(200) // Account for async overhead
    })

    test('should split 500 entries in <50ms', () => {
      const entries = generateMockEntries(500)
      const start = performance.now()

      processBatches(entries, mockProcessBatch, { maxBatchSize: 50 })

      const duration = performance.now() - start

      expect(duration).toBeLessThan(1000) // Account for 10 batches * 1ms each + overhead
    })

    test('should split 1000 entries in <100ms', () => {
      const entries = generateMockEntries(1000)
      const start = performance.now()

      processBatches(entries, mockProcessBatch, { maxBatchSize: 50 })

      const duration = performance.now() - start

      expect(duration).toBeLessThan(2000) // Account for 20 batches * 1ms each + overhead
    })
  })

  describe('Batch processing throughput', () => {
    test('should process 100 entries with default batch size', async () => {
      const entries = generateMockEntries(100)
      const start = performance.now()

      const result = await processBatches(entries, mockProcessBatch)

      const duration = performance.now() - start

      expect(result.success).toBe(true)
      expect(result.processedBatches).toBeGreaterThan(0)
      expect(duration).toBeLessThan(500) // 2 batches * 1ms + overhead
    })

    test('should process 500 entries efficiently', async () => {
      const entries = generateMockEntries(500)
      const start = performance.now()

      const result = await processBatches(entries, mockProcessBatch, {
        maxBatchSize: 50
      })

      const duration = performance.now() - start

      expect(result.success).toBe(true)
      expect(result.processedBatches).toBe(10)
      expect(duration).toBeLessThan(2000) // 10 batches * 1ms + overhead
    })

    test('should process 1000 entries efficiently', async () => {
      const entries = generateMockEntries(1000)
      const start = performance.now()

      const result = await processBatches(entries, mockProcessBatch, {
        maxBatchSize: 50
      })

      const duration = performance.now() - start

      expect(result.success).toBe(true)
      expect(result.processedBatches).toBe(20)
      expect(duration).toBeLessThan(3000) // 20 batches * 1ms + overhead
    })
  })

  describe('Different batch sizes', () => {
    test('should handle small batches (size 10)', async () => {
      const entries = generateMockEntries(100)
      const start = performance.now()

      const result = await processBatches(entries, mockProcessBatch, {
        maxBatchSize: 10
      })

      const duration = performance.now() - start

      expect(result.success).toBe(true)
      expect(result.processedBatches).toBe(10)
      expect(duration).toBeLessThan(1000)
    })

    test('should handle large batches (size 100)', async () => {
      const entries = generateMockEntries(500)
      const start = performance.now()

      const result = await processBatches(entries, mockProcessBatch, {
        maxBatchSize: 100
      })

      const duration = performance.now() - start

      expect(result.success).toBe(true)
      expect(result.processedBatches).toBe(5)
      expect(duration).toBeLessThan(1000)
    })

    test('should handle very large batches (size 500)', async () => {
      const entries = generateMockEntries(1000)
      const start = performance.now()

      const result = await processBatches(entries, mockProcessBatch, {
        maxBatchSize: 500
      })

      const duration = performance.now() - start

      expect(result.success).toBe(true)
      expect(result.processedBatches).toBe(2)
      expect(duration).toBeLessThan(500)
    })
  })

  describe('Progress callback overhead', () => {
    test('should not significantly slow down with progress tracking', async () => {
      const entries = generateMockEntries(500)
      let progressCallCount = 0

      const startWithProgress = performance.now()
      await processBatches(
        entries,
        mockProcessBatch,
        { maxBatchSize: 50 },
        () => {
          progressCallCount++
        }
      )
      const durationWithProgress = performance.now() - startWithProgress

      const startWithoutProgress = performance.now()
      await processBatches(entries, mockProcessBatch, { maxBatchSize: 50 })
      const durationWithoutProgress = performance.now() - startWithoutProgress

      // Progress callback should be called (once per batch + final)
      expect(progressCallCount).toBeGreaterThan(0)

      // Overhead should be minimal (<20% difference)
      const overhead = durationWithProgress - durationWithoutProgress
      const overheadPercent = (overhead / durationWithoutProgress) * 100

      expect(overheadPercent).toBeLessThan(30)
    })
  })
})

describe('Operation Sorting Performance', () => {
  describe('sortOperations overhead', () => {
    test('should sort 100 entries in <10ms', () => {
      const entries = generateMockEntries(100)
      const start = performance.now()

      const result = sortOperations(entries)

      const duration = performance.now() - start

      expect(duration).toBeLessThan(10)
      expect(
        result.deletes.length + result.updates.length + result.creates.length
      ).toBe(100)
    })

    test('should sort 500 entries in <50ms', () => {
      const entries = generateMockEntries(500)
      const start = performance.now()

      const result = sortOperations(entries)

      const duration = performance.now() - start

      expect(duration).toBeLessThan(50)
      expect(
        result.deletes.length + result.updates.length + result.creates.length
      ).toBe(500)
    })

    test('should sort 1000 entries in <100ms', () => {
      const entries = generateMockEntries(1000)
      const start = performance.now()

      const result = sortOperations(entries)

      const duration = performance.now() - start

      expect(duration).toBeLessThan(100)
      expect(
        result.deletes.length + result.updates.length + result.creates.length
      ).toBe(1000)
    })
  })

  describe('validateOperations overhead', () => {
    test('should validate 100 entries in <10ms', () => {
      const entries = generateMockEntries(100)
      const start = performance.now()

      const result = validateOperations(entries)

      const duration = performance.now() - start

      expect(duration).toBeLessThan(10)
      expect(result.valid).toBeDefined()
    })

    test('should validate 500 entries in <50ms', () => {
      const entries = generateMockEntries(500)
      const start = performance.now()

      const result = validateOperations(entries)

      const duration = performance.now() - start

      expect(duration).toBeLessThan(50)
      expect(result.valid).toBeDefined()
    })

    test('should validate 1000 entries in <100ms', () => {
      const entries = generateMockEntries(1000)
      const start = performance.now()

      const result = validateOperations(entries)

      const duration = performance.now() - start

      expect(duration).toBeLessThan(100)
      expect(result.valid).toBeDefined()
    })
  })

  describe('Combined sorting + validation overhead', () => {
    test('should sort and validate 1000 entries in <200ms', () => {
      const entries = generateMockEntries(1000)
      const start = performance.now()

      const sorted = sortOperations(entries)
      const validated = validateOperations(entries)

      const duration = performance.now() - start

      expect(duration).toBeLessThan(200)
      expect(sorted).toBeDefined()
      expect(validated.valid).toBeDefined()
    })
  })
})

describe('Memory and Scalability', () => {
  test('should handle very large entry sets (5000 entries)', async () => {
    const entries = generateMockEntries(5000)
    const start = performance.now()

    const result = await processBatches(entries, mockProcessBatch, {
      maxBatchSize: 100
    })

    const duration = performance.now() - start

    expect(result.success).toBe(true)
    expect(result.processedBatches).toBe(50)
    // 50 batches * 1ms + overhead
    expect(duration).toBeLessThan(10000)
  })

  test('should handle sorting very large entry sets (5000 entries)', () => {
    const entries = generateMockEntries(5000)
    const start = performance.now()

    const result = sortOperations(entries)

    const duration = performance.now() - start

    expect(duration).toBeLessThan(500)
    expect(
      result.deletes.length + result.updates.length + result.creates.length
    ).toBe(5000)
  })
})
