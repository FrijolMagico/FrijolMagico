import { executeQuery } from '@frijolmagico/database/client'
import { getDataSource } from '@/infra/config/dataSourceConfig'

import type { AboutData } from '../types/about'

const ORGANIZATION_ID = 1

export async function aboutRepository(): Promise<AboutData | null> {
  const source = getDataSource({ prod: 'database', dev: 'local' })

  if (source === 'local' || source === 'database') {
    const { data, error } = await executeQuery<AboutData>(
      'SELECT id, nombre, descripcion, mision, vision FROM organizacion WHERE id = ?',
      [ORGANIZATION_ID]
    )

    if (error) {
      throw error
    }

    if (!data || data.length === 0) {
      return null
    }

    return data[0] ?? null
  }

  throw new Error(`Unsupported data source: ${source}`)
}
