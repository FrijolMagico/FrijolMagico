import { getDataFromCMS } from '@/infra/getDataFromCMS'
import { getDataSource } from '@/infra/config/dataSourceConfig'

import { getDataFromMock } from './mocks/scheduleData.mock'

import { SCHEDULE_CONFIG } from '../constants/scheduleConfig'

import type { RawSchedule } from '../types/schedule'

export async function scheduleRepository(): Promise<RawSchedule[][]> {
  const source = getDataSource({ prod: 'cms' })

  if (source === 'mock') {
    return getDataFromMock()
  }

  const data = await getDataFromCMS<RawSchedule>(SCHEDULE_CONFIG)

  if (!data) {
    throw new Error(
      'Data not found or an error occurred while fetching festival schedule.',
    )
  }

  return data as RawSchedule[][]
}
