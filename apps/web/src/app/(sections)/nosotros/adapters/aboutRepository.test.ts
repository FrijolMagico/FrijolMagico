import { beforeEach, describe, expect, mock, test } from 'bun:test'

import { executeQueryMock } from '@/test-utils/mockDatabase'

const getDataSourceMock = mock(() => 'database' as 'database' | 'mock')

mock.module('@/infra/config/dataSourceConfig', () => ({
  getDataSource: getDataSourceMock
}))

import { aboutRepository } from './aboutRepository'

beforeEach(() => {
  executeQueryMock.mockReset()
  getDataSourceMock.mockReturnValue('database')
})

describe('aboutRepository', () => {
  test('returns organization data when the query succeeds', async () => {
    const organization = {
      id: 1,
      nombre: 'Asociación Cultural',
      descripcion: 'Una comunidad cultural',
      mision: 'Fomentar la cultura',
      vision: 'Una comunidad activa'
    }
    executeQueryMock.mockResolvedValueOnce({ data: [organization], error: null })

    await expect(aboutRepository()).resolves.toEqual(organization)
  })

  test('returns null when the successful query has no rows', async () => {
    executeQueryMock.mockResolvedValueOnce({ data: [], error: null })

    await expect(aboutRepository()).resolves.toBeNull()
  })

  test('propagates query failures', async () => {
    const failure = new Error('Organization query failed')
    executeQueryMock.mockResolvedValueOnce({ data: [], error: failure })

    await expect(aboutRepository()).rejects.toBe(failure)
  })

  test('rejects an explicitly selected mock data source', async () => {
    getDataSourceMock.mockReturnValue('mock')

    await expect(aboutRepository()).rejects.toThrow('Unsupported data source: mock')
    expect(executeQueryMock).not.toHaveBeenCalled()
  })
})
