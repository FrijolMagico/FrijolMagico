import { afterEach, describe, expect, mock, test } from 'bun:test'
import { redirect } from 'next/navigation'

const catalogRepositoryMock = mock(async () => [])

mock.module('../adapters/catalogRepository', () => ({
  catalogRepository: catalogRepositoryMock
}))

const { getCatalogData } = await import('./getCatalogData')

afterEach(() => {
  catalogRepositoryMock.mockReset()
  catalogRepositoryMock.mockResolvedValue([])
})

describe('getCatalogData errors', () => {
  test('rethrows Next redirect signals without logging', async () => {
    let signal: unknown
    try {
      redirect('/catalogo')
    } catch (error) {
      signal = error
    }
    if (!(signal instanceof Error)) {
      throw new Error('Expected Next redirect signal')
    }

    const errorLog = mock(() => {})
    const originalError = console.error
    console.error = errorLog
    catalogRepositoryMock.mockRejectedValue(signal)

    try {
      await expect(getCatalogData()).rejects.toBe(signal)
      expect(errorLog).not.toHaveBeenCalled()
    } finally {
      console.error = originalError
    }
  })

  test('logs ordinary repository errors and returns the existing fallback', async () => {
    const repositoryError = new Error('catalog query failed')
    const errorLog = mock(() => {})
    const originalError = console.error
    console.error = errorLog
    catalogRepositoryMock.mockRejectedValue(repositoryError)

    try {
      await expect(getCatalogData()).resolves.toEqual({
        data: [],
        error: {
          message:
            'Error al obtener los artistas del catalogo. Por favor intente nuevamente mas tarde.'
        }
      })
      expect(errorLog).toHaveBeenCalledWith('catalog query failed')
    } finally {
      console.error = originalError
    }
  })
})
