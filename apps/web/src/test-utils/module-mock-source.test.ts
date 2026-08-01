import { describe, expect, mock, test } from 'bun:test'

const getDataSource = mock(() => 'mock')
const isMockMode = mock(() => true)

mock.module('@/infra/config/dataSourceConfig', () => ({
  getDataSource,
  isMockMode
}))

const { getDataSource: mockedGetDataSource, isMockMode: mockedIsMockMode } =
  await import('@/infra/config/dataSourceConfig')

describe('module mock source — data source config', () => {
  test('sees the registered mock on every exported function', () => {
    expect('mock' in mockedGetDataSource).toBe(true)
    expect('mock' in mockedIsMockMode).toBe(true)
  })
})
