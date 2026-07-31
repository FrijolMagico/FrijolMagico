import { describe, it, expect, mock } from 'bun:test'
import type { ArtistHistoryView, OptimisticAction } from '@/core/artistas/_hooks/use-artist-history'
import { EMPTY_HISTORY } from '@/core/artistas/_lib/aggregate-history'
import type { HistoryFieldEntry } from '@/core/artistas/_lib/aggregate-history'

mock.module('server-only', () => ({}))

const { optimisticReducer, FIELD_TO_STORE_KEY } = await import(
  '@/core/artistas/_hooks/use-artist-history'
)

const BASE_STATE: ArtistHistoryView = {
  ...EMPTY_HISTORY,
  pseudonimo: 'Test Artist',
}

describe('optimisticReducer', () => {
  describe('ADD_FIELD', () => {
    it('adds a new field entry', () => {
      const action: OptimisticAction = {
        type: 'ADD_FIELD',
        field: 'pseudonimo',
        value: 'NuevoPseudonimo',
        tempId: 999,
      }
      const result = optimisticReducer(BASE_STATE, action)
      expect(result.pseudonimos).toHaveLength(1)
      expect(result.pseudonimos[0]).toEqual({
        value: 'NuevoPseudonimo',
        historyId: 999,
        field: 'pseudonimo',
      })
    })

    it('is idempotent — skips duplicate values', () => {
      const stateWithEntry: ArtistHistoryView = {
        ...BASE_STATE,
        pseudonimos: [{ value: 'Existente', historyId: 1, field: 'pseudonimo' }],
      }
      const action: OptimisticAction = {
        type: 'ADD_FIELD',
        field: 'pseudonimo',
        value: 'Existente',
        tempId: 999,
      }
      const result = optimisticReducer(stateWithEntry, action)
      expect(result.pseudonimos).toHaveLength(1)
    })

    it('adds multiple fields independently', () => {
      const result1 = optimisticReducer(BASE_STATE, {
        type: 'ADD_FIELD', field: 'correo', value: 'test@test.com', tempId: 1,
      })
      const result2 = optimisticReducer(result1, {
        type: 'ADD_FIELD', field: 'ciudad', value: 'Santiago', tempId: 2,
      })
      expect(result2.correos).toHaveLength(1)
      expect(result2.ciudades).toHaveLength(1)
      expect(result2.correos[0].value).toBe('test@test.com')
      expect(result2.ciudades[0].value).toBe('Santiago')
    })
  })

  describe('ADD_RRSS', () => {
    it('adds a new RRSS entry', () => {
      const action: OptimisticAction = {
        type: 'ADD_RRSS',
        platform: 'instagram',
        url: 'https://instagram.com/test',
        tempId: 100,
      }
      const result = optimisticReducer(BASE_STATE, action)
      expect(result.rrss.instagram).toHaveLength(1)
      expect(result.rrss.instagram[0]).toEqual({
        value: 'https://instagram.com/test',
        historyId: 100,
        field: 'rrss',
        platform: 'instagram',
      })
    })

    it('preserves existing RRSS platforms when adding new ones', () => {
      const stateWithRrss: ArtistHistoryView = {
        ...BASE_STATE,
        rrss: {
          instagram: [{ value: 'https://instagram.com/existing', historyId: 1, field: 'rrss', platform: 'instagram' }],
        },
      }
      const result = optimisticReducer(stateWithRrss, {
        type: 'ADD_RRSS', platform: 'facebook', url: 'https://facebook.com/test', tempId: 2,
      })
      expect(result.rrss.instagram).toHaveLength(1)
      expect(result.rrss.facebook).toHaveLength(1)
    })

    it('adds to existing platform', () => {
      const stateWithRrss: ArtistHistoryView = {
        ...BASE_STATE,
        rrss: {
          instagram: [{ value: 'https://instagram.com/first', historyId: 1, field: 'rrss', platform: 'instagram' }],
        },
      }
      const result = optimisticReducer(stateWithRrss, {
        type: 'ADD_RRSS', platform: 'Instagram', url: 'https://instagram.com/second', tempId: 2,
      })
      expect(result.rrss.instagram).toHaveLength(2)
    })

    it('is idempotent — skips duplicate URL', () => {
      const stateWithRrss: ArtistHistoryView = {
        ...BASE_STATE,
        rrss: {
          instagram: [{ value: 'https://instagram.com/existing', historyId: 1, field: 'rrss', platform: 'instagram' }],
        },
      }
      const result = optimisticReducer(stateWithRrss, {
        type: 'ADD_RRSS', platform: 'instagram', url: 'https://instagram.com/existing', tempId: 2,
      })
      expect(result.rrss.instagram).toHaveLength(1)
    })
  })

  describe('DELETE_FIELD', () => {
    it('removes the matching entry', () => {
      const stateWithEntry: ArtistHistoryView = {
        ...BASE_STATE,
        correos: [
          { value: 'a@test.com', historyId: 10, field: 'correo' },
          { value: 'b@test.com', historyId: 20, field: 'correo' },
        ],
      }
      const action: OptimisticAction = {
        type: 'DELETE_FIELD',
        entry: { value: 'a@test.com', historyId: 10, field: 'correo' },
      }
      const result = optimisticReducer(stateWithEntry, action)
      expect(result.correos).toHaveLength(1)
      expect(result.correos[0].value).toBe('b@test.com')
    })

    it('does nothing if entry does not exist', () => {
      const stateWithEntry: ArtistHistoryView = {
        ...BASE_STATE,
        paises: [{ value: 'Chile', historyId: 1, field: 'pais' }],
      }
      const action: OptimisticAction = {
        type: 'DELETE_FIELD',
        entry: { value: 'Argentina', historyId: 99, field: 'pais' },
      }
      const result = optimisticReducer(stateWithEntry, action)
      expect(result.paises).toHaveLength(1)
    })
  })

  describe('DELETE_RRSS', () => {
    it('removes the matching RRSS entry', () => {
      const stateWithRrss: ArtistHistoryView = {
        ...BASE_STATE,
        rrss: {
          instagram: [
            { value: 'https://instagram.com/a', historyId: 10, field: 'rrss', platform: 'instagram' },
            { value: 'https://instagram.com/b', historyId: 20, field: 'rrss', platform: 'instagram' },
          ],
        },
      }
      const action: OptimisticAction = {
        type: 'DELETE_RRSS',
        entry: { value: 'https://instagram.com/a', historyId: 10, field: 'rrss', platform: 'instagram' },
      }
      const result = optimisticReducer(stateWithRrss, action)
      expect(result.rrss.instagram).toHaveLength(1)
      expect(result.rrss.instagram[0].value).toBe('https://instagram.com/b')
    })

    it('removes the platform when last entry deleted', () => {
      const stateWithRrss: ArtistHistoryView = {
        ...BASE_STATE,
        rrss: {
          instagram: [{ value: 'https://instagram.com/a', historyId: 10, field: 'rrss', platform: 'instagram' }],
          facebook: [{ value: 'https://facebook.com/b', historyId: 20, field: 'rrss', platform: 'facebook' }],
        },
      }
      const action: OptimisticAction = {
        type: 'DELETE_RRSS',
        entry: { value: 'https://instagram.com/a', historyId: 10, field: 'rrss', platform: 'instagram' },
      }
      const result = optimisticReducer(stateWithRrss, action)
      expect(result.rrss.instagram).toBeUndefined()
      expect(result.rrss.facebook).toHaveLength(1)
    })

    it('does nothing when no platform matching', () => {
      const stateWithRrss: ArtistHistoryView = {
        ...BASE_STATE,
        rrss: {
          instagram: [{ value: 'https://instagram.com/a', historyId: 10, field: 'rrss', platform: 'instagram' }],
        },
      }
      const action: OptimisticAction = {
        type: 'DELETE_RRSS',
        entry: { value: 'https://facebook.com/b', historyId: 20, field: 'rrss', platform: 'facebook' },
      }
      const result = optimisticReducer(stateWithRrss, action)
      expect(result.rrss.instagram).toHaveLength(1)
    })
  })
})
