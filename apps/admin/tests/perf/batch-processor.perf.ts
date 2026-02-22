import { describe, expect, test } from 'bun:test'
import { processBatches } from '@/shared/commit-system/lib/batch-processor'
import {
  sortCommitOperations,
  validateCommitOperations
} from '@/shared/commit-system/lib/operation-sorter'
import type { CommitOperation } from '@/shared/commit-system/lib/types'

function generateMockOperations(count: number): CommitOperation[] {
  const operations: CommitOperation[] = []
  const types = ['CREATE', 'UPDATE', 'DELETE'] as const

  for (let i = 0; i < count; i++) {
    const type = types[i % 3]
    operations.push({
      type,
      entityType: 'test-entity',
      entityId: `entity-${i}`,
      ...(type !== 'DELETE' && {
        data: {
          name: `Entity ${i}`,
          description: `Description for entity ${i}`,
          metadata: {
            created: Date.now(),
            updated: Date.now(),
            version: 1
          }
        }
      })
    } as CommitOperation)
  }

  return operations
}

async function mockProcessBatch<T>(batch: T[]): Promise<T[]> {
  await new Promise((resolve) => setTimeout(resolve, 1))
  return batch
}

describe('Batch Processor Performance', () => {
  describe('Batch splitting overhead', () => {
    test('should split 100 entries in <50ms', () => {
      const operations = generateMockOperations(100)
      const start = performance.now()

      processBatches(operations, mockProcessBatch, { maxBatchSize: 50 })

      const duration = performance.now() - start

      expect(duration).toBeLessThan(50)
    })

    test('should split 500 entries in <100ms', () => {
      const operations = generateMockOperations(500)
      const start = performance.now()

      processBatches(operations, mockProcessBatch, { maxBatchSize: 100 })

      const duration = performance.now() - start

      expect(duration).toBeLessThan(100)
    })

    test('should split 1000 entries in <200ms', () => {
      const operations = generateMockOperations(1000)
      const start = performance.now()

      processBatches(operations, mockProcessBatch, { maxBatchSize: 100 })

      const duration = performance.now() - start

      expect(duration).toBeLessThan(200)
    })
  })

  describe('sortCommitOperations overhead', () => {
    test('should sort 100 entries in <10ms', () => {
      const operations = generateMockOperations(100)
      const start = performance.now()

      sortCommitOperations(operations)

      const duration = performance.now() - start

      expect(duration).toBeLessThan(10)
    })

    test('should sort 500 entries in <50ms', () => {
      const operations = generateMockOperations(500)
      const start = performance.now()

      sortCommitOperations(operations)

      const duration = performance.now() - start

      expect(duration).toBeLessThan(50)
    })

    test('should sort 1000 entries in <100ms', () => {
      const operations = generateMockOperations(1000)
      const start = performance.now()

      sortCommitOperations(operations)

      const duration = performance.now() - start

      expect(duration).toBeLessThan(100)
    })
  })

  describe('validateCommitOperations overhead', () => {
    test('should validate 100 entries in <10ms', () => {
      const operations = generateMockOperations(100)
      const start = performance.now()

      const result = validateCommitOperations(operations)

      const duration = performance.now() - start

      expect(duration).toBeLessThan(10)
      expect(result.valid).toBeDefined()
    })

    test('should validate 500 entries in <50ms', () => {
      const operations = generateMockOperations(500)
      const start = performance.now()

      const result = validateCommitOperations(operations)

      const duration = performance.now() - start

      expect(duration).toBeLessThan(50)
      expect(result.valid).toBeDefined()
    })

    test('should validate 1000 entries in <100ms', () => {
      const operations = generateMockOperations(1000)
      const start = performance.now()

      const result = validateCommitOperations(operations)

      const duration = performance.now() - start

      expect(duration).toBeLessThan(100)
      expect(result.valid).toBeDefined()
    })
  })

  describe('Combined sorting + validation overhead', () => {
    test('should sort and validate 1000 entries in <200ms', () => {
      const operations = generateMockOperations(1000)
      const start = performance.now()

      const sorted = sortCommitOperations(operations)
      const validated = validateCommitOperations(operations)

      const duration = performance.now() - start

      expect(duration).toBeLessThan(200)
      expect(sorted).toBeDefined()
      expect(validated.valid).toBeDefined()
    })
  })
})

describe('Memory and Scalability', () => {
  test('should handle very large operation sets (5000 entries)', async () => {
    const operations = generateMockOperations(5000)
    const start = performance.now()

    const result = await processBatches(operations, mockProcessBatch, {
      maxBatchSize: 100
    })

    const duration = performance.now() - start

    expect(result.success).toBe(true)
    expect(result.processedBatches).toBeDefined()
    expect(duration).toBeLessThan(10000)
  })

  test('should handle sorting very large operation sets (5000 entries)', () => {
    const operations = generateMockOperations(5000)
    const start = performance.now()

    const result = sortCommitOperations(operations)

    const duration = performance.now() - start

    expect(duration).toBeLessThan(500)
    expect(result.length).toBe(5000)
  })
})
