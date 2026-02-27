import { describe, expect, it } from 'bun:test'
import {
  sortCommitOperations,
  validateCommitOperations
} from './operation-sorter'
import type { CommitOperation } from './types'

describe('sortCommitOperations', () => {
  it('discards DELETE on tempId (never persisted)', () => {
    const ops: CommitOperation[] = [
      { type: 'DELETE', entityType: 'artista', entityId: 'temp-abc' }
    ]
    expect(sortCommitOperations(ops)).toEqual([])
  })

  it('cancels CREATE + DELETE on same tempId (total cancellation)', () => {
    const ops: CommitOperation[] = [
      {
        type: 'CREATE',
        entityType: 'artista',
        entityId: 'temp-abc',
        data: { nombre: 'Test' }
      },
      { type: 'DELETE', entityType: 'artista', entityId: 'temp-abc' }
    ]
    expect(sortCommitOperations(ops)).toEqual([])
  })

  it('keeps only DELETE when UPDATE + DELETE on real entity', () => {
    const ops: CommitOperation[] = [
      {
        type: 'UPDATE',
        entityType: 'artista',
        entityId: '42',
        data: { nombre: 'x' }
      },
      { type: 'DELETE', entityType: 'artista', entityId: '42' }
    ]
    const result = sortCommitOperations(ops)
    expect(result).toEqual([
      { type: 'DELETE', entityType: 'artista', entityId: '42' }
    ])
  })

  it('deduplicates multiple DELETEs on same entity to one', () => {
    const ops: CommitOperation[] = [
      { type: 'DELETE', entityType: 'artista', entityId: '42' },
      { type: 'DELETE', entityType: 'artista', entityId: '42' }
    ]
    const result = sortCommitOperations(ops)
    expect(result).toHaveLength(1)
    expect(result[0].type).toBe('DELETE')
  })

  it('outputs in order: DELETE, RESTORE, UPDATE, CREATE', () => {
    const ops: CommitOperation[] = [
      {
        type: 'CREATE',
        entityType: 'artista',
        entityId: 'temp-new',
        data: { nombre: 'New' }
      },
      {
        type: 'UPDATE',
        entityType: 'cancion',
        entityId: '10',
        data: { titulo: 'x' }
      },
      { type: 'RESTORE', entityType: 'disco', entityId: '20' },
      { type: 'DELETE', entityType: 'genero', entityId: '30' }
    ]
    const result = sortCommitOperations(ops)
    expect(result.map((op) => op.type)).toEqual([
      'DELETE',
      'RESTORE',
      'UPDATE',
      'CREATE'
    ])
  })

  it('passes through a clean CREATE', () => {
    const ops: CommitOperation[] = [
      {
        type: 'CREATE',
        entityType: 'artista',
        entityId: 'temp-xyz',
        data: { nombre: 'x' }
      }
    ]
    const result = sortCommitOperations(ops)
    expect(result).toHaveLength(1)
    expect(result[0].type).toBe('CREATE')
    expect(result[0].entityId).toBe('temp-xyz')
  })

  it('passes through a RESTORE', () => {
    const ops: CommitOperation[] = [
      { type: 'RESTORE', entityType: 'artista', entityId: '42' }
    ]
    expect(sortCommitOperations(ops)).toEqual([
      { type: 'RESTORE', entityType: 'artista', entityId: '42' }
    ])
  })
})

describe('validateCommitOperations', () => {
  it('returns valid for any operations including UPDATE+DELETE', () => {
    const ops: CommitOperation[] = [
      {
        type: 'UPDATE',
        entityType: 'artista',
        entityId: '42',
        data: { nombre: 'x' }
      },
      { type: 'DELETE', entityType: 'artista', entityId: '42' }
    ]
    expect(validateCommitOperations(ops)).toEqual({ valid: true, errors: [] })
  })
})
