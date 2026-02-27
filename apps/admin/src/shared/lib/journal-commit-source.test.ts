import { describe, expect, it, mock, beforeEach } from 'bun:test'
import type { JournalEntry } from '@/shared/change-journal/lib/types'
import { COMMIT_OPERATION_TYPE as OP } from '@/shared/commit-system/lib/types'

const mockGet = mock(() => Promise.resolve([] as JournalEntry[]))
mock.module('@/shared/change-journal/change-journal', () => ({
  getLatestEntries: mockGet,
  hasEntries: mock(() => Promise.resolve(false)),
  clearSection: mock(() => Promise.resolve())
}))
const { journalCommitSource } =
await import('@/shared/lib/journal-commit-source')

const e = (
  scopeKey: string,
  payload: JournalEntry['payload']
): JournalEntry => ({
  entryId: 'e1',
  schemaVersion: 1,
  section: 'test',
  scopeKey,
  payload,
  timestampMs: 1,
  clientId: 'c1'
})

describe('journalCommitSource.read', () => {
  beforeEach(() => mockGet.mockReset())

  it('ADD temp id → CREATE with unwrapped data', async () => {
    const wrapper = { type: 'ADD', data: { nombre: 'Test', alias: 'T' }, ts: 1 }
    mockGet.mockResolvedValueOnce([
      e('artista:temp-uuid', { op: 'set', value: wrapper })
    ])
    const ops = await journalCommitSource.read('artista')
    expect(ops).toEqual([{
      type: OP.CREATE, entityType: 'artista',
      entityId: 'temp-uuid', data: { nombre: 'Test', alias: 'T' },
    }])
  })

  it('UPDATE per-field → single merged UPDATE', async () => {
    mockGet.mockResolvedValueOnce([
      e('organizacion:42:nombre', { op: 'set', value: 'New Name' }),
      e('organizacion:42:descripcion', { op: 'set', value: 'New Desc' })
    ])
    const ops = await journalCommitSource.read('organizacion')
    expect(ops).toEqual([
      {
        type: OP.UPDATE,
        entityType: 'organizacion',
        entityId: '42',
        data: { nombre: 'New Name', descripcion: 'New Desc' }
      }
    ])
  })

  it('DELETE → DELETE without data', async () => {
    mockGet.mockResolvedValueOnce([e('artista:99', { op: 'unset' })])
    const ops = await journalCommitSource.read('artista')
    expect(ops).toEqual([
      { type: OP.DELETE, entityType: 'artista', entityId: '99' }
    ])
  })

  it('newest field value wins on dedup', async () => {
    mockGet.mockResolvedValueOnce([
      e('org:1:nombre', { op: 'set', value: 'Newer' }),
      e('org:1:nombre', { op: 'set', value: 'Older' })
    ])
    const ops = await journalCommitSource.read('org')
    expect(ops[0].type).toBe(OP.UPDATE)
    expect((ops[0] as { data: Record<string, unknown> }).data.nombre).toBe(
      'Newer'
    )
  })

  it('RESTORE → RESTORE operation', async () => {
    mockGet.mockResolvedValueOnce([e('artista:42', { op: 'restore' })])
    const ops = await journalCommitSource.read('artista')
    expect(ops).toEqual([
      { type: OP.RESTORE, entityType: 'artista', entityId: '42' }
    ])
  })

  it('DELETE after UPDATE → only DELETE for that entity', async () => {
    // Two entries: first a field update, then a delete for the same entity
    mockGet.mockResolvedValueOnce([
      e('artista:99:nombre', { op: 'set', value: 'name' }),
      e('artista:99', { op: 'unset' })
    ])
    // The journal should output a DELETE (unset wins)
    const ops = await journalCommitSource.read('artista')
    const deleteOps = ops.filter((op) => op.type === OP.DELETE)
    expect(deleteOps).toHaveLength(1)
    expect(deleteOps[0]).toMatchObject({
      type: OP.DELETE,
      entityType: 'artista',
      entityId: '99'
    })
  })

  it('multiple entities → separate ops per entity', async () => {
    mockGet.mockResolvedValueOnce([
      e('artista:1:nombre', { op: 'set', value: 'Artista 1' }),
      e('artista:2:nombre', { op: 'set', value: 'Artista 2' })
    ])
    const ops = await journalCommitSource.read('artista')
    expect(ops).toHaveLength(2)
    expect(ops.every((op) => op.type === OP.UPDATE)).toBe(true)
  })
})
