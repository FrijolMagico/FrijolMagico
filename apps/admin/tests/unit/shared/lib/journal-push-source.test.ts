import { describe, expect, it, mock, beforeEach } from 'bun:test'
import type { JournalEntry } from '@/shared/operations/journal/lib/types'

const getLatestEntriesMock = mock((_section: string) =>
  Promise.resolve([] as JournalEntry[])
)
const hasEntriesMock = mock((_section: string) => Promise.resolve(false))
const clearSectionMock = mock((_section: string) => Promise.resolve())

mock.module('@/shared/operations/journal/', () => ({
  getLatestEntries: getLatestEntriesMock,
  hasEntries: hasEntriesMock,
  clearSection: clearSectionMock
}))

import { journalPushSource } from '@/shared/lib/journal-push-source'

const ENTRY_ID_1 = '00000000-0000-0000-0000-000000000001'
const ENTRY_ID_2 = '00000000-0000-0000-0000-000000000002'
const CLIENT_ID = '00000000-0000-0000-0000-000000000099'

function makeUpdateEntry(
  section: string,
  entityType: string,
  entityId: string,
  data: Record<string, unknown>,
  entryId = ENTRY_ID_1
): JournalEntry {
  return {
    entryId,
    schemaVersion: 1,
    section,
    scopeKey: `${entityType}:${entityId}`,
    payload: { op: 'set', value: { data } },
    timestampMs: 100,
    clientId: CLIENT_ID
  }
}

function makeCreateEntry(
  section: string,
  entityType: string,
  entityId: string,
  data: Record<string, unknown>,
  entryId = ENTRY_ID_2
): JournalEntry {
  return {
    entryId,
    schemaVersion: 1,
    section,
    scopeKey: `${entityType}:${entityId}`,
    payload: { op: 'set', value: { data } },
    timestampMs: 200,
    clientId: CLIENT_ID
  }
}

describe('journalPushSource.read', () => {
  beforeEach(() => {
    getLatestEntriesMock.mockImplementation((_section: string) =>
      Promise.resolve([] as JournalEntry[])
    )
    hasEntriesMock.mockImplementation((_section: string) =>
      Promise.resolve(false)
    )
    clearSectionMock.mockImplementation((_section: string) => Promise.resolve())
    getLatestEntriesMock.mockClear()
    hasEntriesMock.mockClear()
    clearSectionMock.mockClear()
  })

  it('reads from a single section (string)', async () => {
    const entry = makeUpdateEntry('evento_edicion', 'evento_edicion', '42', {
      nombre: 'Edicion 1'
    })
    getLatestEntriesMock.mockImplementation((_section: string) =>
      Promise.resolve([entry])
    )

    const ops = await journalPushSource.read('evento_edicion')

    expect(getLatestEntriesMock).toHaveBeenCalledTimes(1)
    expect(getLatestEntriesMock.mock.calls[0][0]).toBe('evento_edicion')
    expect(ops).toHaveLength(1)
    expect(ops[0].type).toBe('UPDATE')
    expect(ops[0].entityType).toBe('evento_edicion')
    expect(ops[0].entityId).toBe('42')
  })

  it('reads from multiple sections (array) and returns combined operations', async () => {
    const entryA = makeUpdateEntry(
      'evento_edicion',
      'evento_edicion',
      '10',
      { nombre: 'Edicion' },
      ENTRY_ID_1
    )
    const entryB = makeCreateEntry(
      'lugar',
      'lugar',
      'temp-lugar-1',
      { nombre: 'Teatro Municipal' },
      ENTRY_ID_2
    )

    getLatestEntriesMock.mockImplementation((section: string) => {
      if (section === 'evento_edicion') return Promise.resolve([entryA])
      if (section === 'lugar') return Promise.resolve([entryB])
      return Promise.resolve([])
    })

    const ops = await journalPushSource.read(['evento_edicion', 'lugar'])

    expect(getLatestEntriesMock).toHaveBeenCalledTimes(2)
    expect(ops).toHaveLength(2)

    const updateOp = ops.find((op) => op.entityType === 'evento_edicion')
    const createOp = ops.find((op) => op.entityType === 'lugar')

    expect(updateOp?.type).toBe('UPDATE')
    expect(createOp?.type).toBe('CREATE')
    expect(createOp?.entityId).toBe('temp-lugar-1')
  })

  it('returns empty array when all sections are empty', async () => {
    getLatestEntriesMock.mockImplementation((_section: string) =>
      Promise.resolve([])
    )

    const ops = await journalPushSource.read([
      'evento_edicion',
      'evento_edicion_dia',
      'lugar'
    ])

    expect(getLatestEntriesMock).toHaveBeenCalledTimes(3)
    expect(ops).toHaveLength(0)
  })

  it('processes entries from different sections independently without cross-section interference', async () => {
    const edicionEntry = makeCreateEntry(
      'evento_edicion',
      'evento_edicion',
      'temp-edicion-1',
      { eventoId: '5', numeroEdicion: 'I' },
      ENTRY_ID_1
    )
    const diaEntry = makeCreateEntry(
      'evento_edicion_dia',
      'evento_edicion_dia',
      'temp-dia-1',
      { eventoEdicionId: 'temp-edicion-1', fecha: '2026-04-01' },
      ENTRY_ID_2
    )

    getLatestEntriesMock.mockImplementation((section: string) => {
      if (section === 'evento_edicion') return Promise.resolve([edicionEntry])
      if (section === 'evento_edicion_dia') return Promise.resolve([diaEntry])
      return Promise.resolve([])
    })

    const ops = await journalPushSource.read([
      'evento_edicion',
      'evento_edicion_dia'
    ])

    expect(ops).toHaveLength(2)

    const edicionOp = ops.find((op) => op.entityType === 'evento_edicion')
    const diaOp = ops.find((op) => op.entityType === 'evento_edicion_dia')

    expect(edicionOp?.type).toBe('CREATE')
    expect(edicionOp?.entityId).toBe('temp-edicion-1')
    expect(diaOp?.type).toBe('CREATE')
    expect(diaOp?.entityId).toBe('temp-dia-1')
  })
})

describe('journalPushSource.clear', () => {
  beforeEach(() => {
    clearSectionMock.mockClear()
    clearSectionMock.mockImplementation((_section: string) => Promise.resolve())
  })

  it('clears a single section (string)', async () => {
    await journalPushSource.clear('evento_edicion')

    expect(clearSectionMock).toHaveBeenCalledTimes(1)
    expect(clearSectionMock.mock.calls[0][0]).toBe('evento_edicion')
  })

  it('clears all sections when given an array', async () => {
    await journalPushSource.clear([
      'evento_edicion',
      'evento_edicion_dia',
      'lugar'
    ])

    expect(clearSectionMock).toHaveBeenCalledTimes(3)
    const clearedSections = clearSectionMock.mock.calls.map((c) => c[0])
    expect(clearedSections).toContain('evento_edicion')
    expect(clearedSections).toContain('evento_edicion_dia')
    expect(clearedSections).toContain('lugar')
  })
})

describe('journalPushSource.hasPending', () => {
  beforeEach(() => {
    hasEntriesMock.mockClear()
    hasEntriesMock.mockImplementation((_section: string) =>
      Promise.resolve(false)
    )
  })

  it('checks a single section (string)', async () => {
    hasEntriesMock.mockImplementation((_section: string) =>
      Promise.resolve(true)
    )

    const result = await journalPushSource.hasPending('evento_edicion')

    expect(hasEntriesMock).toHaveBeenCalledTimes(1)
    expect(hasEntriesMock.mock.calls[0][0]).toBe('evento_edicion')
    expect(result).toBe(true)
  })

  it('returns true if any section in the array has entries', async () => {
    hasEntriesMock.mockImplementation((section: string) => {
      return Promise.resolve(section === 'lugar')
    })

    const result = await journalPushSource.hasPending([
      'evento_edicion',
      'lugar'
    ])

    expect(hasEntriesMock).toHaveBeenCalledTimes(2)
    expect(result).toBe(true)
  })

  it('returns false when no section in the array has entries', async () => {
    hasEntriesMock.mockImplementation((_section: string) =>
      Promise.resolve(false)
    )

    const result = await journalPushSource.hasPending([
      'evento_edicion',
      'evento_edicion_dia',
      'lugar'
    ])

    expect(hasEntriesMock).toHaveBeenCalledTimes(3)
    expect(result).toBe(false)
  })
})
