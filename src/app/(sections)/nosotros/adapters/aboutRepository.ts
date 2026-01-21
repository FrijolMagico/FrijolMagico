import { executeQuery } from '@/infra/services/tursoClient'
import { getDataSource } from '@/infra/config/dataSourceConfig'

import { getAboutDataMock } from './mocks/aboutData.mock'

import type { AboutData } from '../types/about'

const ORGANIZATION_ID = 1

export async function aboutRepository(): Promise<AboutData | null> {
  const source = getDataSource({ prod: 'database' })

  if (source === 'mock') {
    return getAboutDataMock()
  }

  if (source === 'local' || source === 'database') {
    const { data, error } = await executeQuery<AboutData>(
      'SELECT id, nombre, descripcion, mision, vision FROM organizacion WHERE id = ?',
      [ORGANIZATION_ID],
    )

    if (error) {
      console.warn(
        '⚠️ Database query failed, falling back to mock data:',
        error.message,
      )
      return getAboutDataMock()
    }

    if (!data || data.length === 0) {
      console.warn('⚠️ No data found in database, falling back to mock data')
      return getAboutDataMock()
    }

    return data[0] || null
  }

  throw new Error(`Unsupported data source: ${source}`)
}
