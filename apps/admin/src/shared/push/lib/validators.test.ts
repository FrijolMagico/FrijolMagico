import { test, expect } from 'bun:test'
import { z } from 'zod'
import {
  validateOperationData,
  shouldSkipValidation,
} from './validators'
import type { PushOperation } from './types'

// Test schema: simple object with required name and optional age
const testSchema = z.object({
  name: z.string({ error: 'Name is required' }),
  age: z.number({ error: 'Age must be a number' }).optional()
})

// ============================================================================
// validateOperationData Tests
// ============================================================================

test('Test 1: Valid CREATE data returns { valid: true, data: validatedData }', () => {
  const data = {
    name: 'John Doe',
    age: 30
  }

  const result = validateOperationData(data, testSchema, false)

  expect(result.valid).toBe(true)
  expect(result.data).toEqual({
    name: 'John Doe',
    age: 30
  })
  expect(result.errors).toBeUndefined()
})

test('Test 2: Invalid data (missing required field) returns { valid: false, errors: [{field, message}] }', () => {
  const data = {
    age: 30
    // name is missing (required field)
  }

  const result = validateOperationData(data, testSchema, false)

  expect(result.valid).toBe(false)
  expect(result.errors).toBeDefined()
  expect(result.errors).toHaveLength(1)
  expect(result.errors?.[0].field).toBe('name')
  expect(result.errors?.[0].message).toContain('required')
  expect(result.data).toBeUndefined()
})

test('Test 3: Null values are converted to undefined before validation', () => {
  const data = {
    name: 'Jane Doe',
    age: null as unknown as number // null should be converted to undefined
  }

  const result = validateOperationData(data, testSchema, false)

  expect(result.valid).toBe(true)
  expect(result.data).toEqual({
    name: 'Jane Doe'
    // age should not be present since it was null (converted to undefined)
  })
  expect(result.errors).toBeUndefined()
})

test('Test 4: id field in data is stripped before validation', () => {
  const data = {
    id: 'some-temp-id',
    name: 'Bob Smith',
    age: 25
  }

  const result = validateOperationData(data, testSchema, false)

  expect(result.valid).toBe(true)
  expect(result.data).toEqual({
    name: 'Bob Smith',
    age: 25
  })
  // Verify id was not included in validated data
  expect('id' in (result.data || {})).toBe(false)
  expect(result.errors).toBeUndefined()
})

test('Test 5: isPartial=true allows missing required fields', () => {
  const data = {
    age: 35
    // name is missing but isPartial=true should allow it
  }

  const result = validateOperationData(data, testSchema, true)

  expect(result.valid).toBe(true)
  expect(result.data).toEqual(expect.objectContaining({
    age: 35
  }))
  expect(result.errors).toBeUndefined()
})

// ============================================================================
// shouldSkipValidation Tests
// ============================================================================

test('Test 6: DELETE operation returns shouldSkipValidation as true', () => {
  const operation: PushOperation = {
    type: 'DELETE',
    entityType: 'article',
    entityId: '123'
  }

  const result = shouldSkipValidation(operation)

  expect(result).toBe(true)
})

test('Test 7: RESTORE operation returns shouldSkipValidation as true', () => {
  const operation: PushOperation = {
    type: 'RESTORE',
    entityType: 'article',
    entityId: '456'
  }

  const result = shouldSkipValidation(operation)

  expect(result).toBe(true)
})

test('Test 8: CREATE operation returns shouldSkipValidation as false', () => {
  const operation: PushOperation = {
    type: 'CREATE',
    entityType: 'article',
    entityId: 'temp-1',
    data: { name: 'New Article' }
  }

  const result = shouldSkipValidation(operation)

  expect(result).toBe(false)
})
