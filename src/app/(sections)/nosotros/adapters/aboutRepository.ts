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

  const { data, error } = await executeQuery<AboutData>(
    'SELECT id, nombre, descripcion, mision, vision FROM organizacion WHERE id = ?',
    [ORGANIZATION_ID],
  )

  if (error) {
    throw new Error(`Error fetching organization data: ${error.message}`)
  }

  return data[0] || null
}
