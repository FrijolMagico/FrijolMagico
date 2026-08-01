import { describe, expect, test } from 'bun:test'

import { getDataSource, isMockMode } from '@/infra/config/dataSourceConfig'

describe('module mock leak guard — data source config', () => {
  test('loads the real data source config without any Bun mock API attached', () => {
    expect(typeof getDataSource).toBe('function')
    expect(typeof isMockMode).toBe('function')
    expect('mock' in getDataSource).toBe(false)
    expect('mock' in isMockMode).toBe(false)
  })
})
