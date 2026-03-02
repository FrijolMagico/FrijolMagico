import { describe, expect, it, mock, beforeEach } from 'bun:test'
import { useJournalFlushRegistry } from '@/shared/lib/journal-flush-registry'
import { ENTITIES } from '@/shared/lib/database-entities'

describe('journal-flush-registry', () => {
  beforeEach(() => {
    useJournalFlushRegistry.setState({ callbacks: new Map() })
  })

  it('registers and unregisters callbacks', () => {
    const store = useJournalFlushRegistry.getState()
    const cb = mock(() => Promise.resolve())

    store.register(ENTITIES.ARTISTA, cb)
    expect(
      useJournalFlushRegistry.getState().callbacks.has(ENTITIES.ARTISTA)
    ).toBe(true)
    expect(
      useJournalFlushRegistry.getState().callbacks.get(ENTITIES.ARTISTA)
    ).toBe(cb)

    store.unregister(ENTITIES.ARTISTA)
    expect(
      useJournalFlushRegistry.getState().callbacks.has(ENTITIES.ARTISTA)
    ).toBe(false)
  })

  it('flushes a specific entity', async () => {
    const store = useJournalFlushRegistry.getState()
    const cb1 = mock(() => Promise.resolve())
    const cb2 = mock(() => Promise.resolve())

    store.register(ENTITIES.ARTISTA, cb1)
    store.register(ENTITIES.CATALOGO_ARTISTA, cb2)

    await store.flush(ENTITIES.ARTISTA)

    expect(cb1).toHaveBeenCalledTimes(1)
    expect(cb2).toHaveBeenCalledTimes(0)
  })

  it('safely ignores flush for unregistered entities', async () => {
    const store = useJournalFlushRegistry.getState()

    // Should not throw
    await store.flush(ENTITIES.ARTISTA)
    expect(true).toBe(true) // Reached without throwing
  })
})
