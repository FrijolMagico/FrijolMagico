import { cacheTag } from 'next/cache'
import { festivalesRepository } from '../adapters/festivalesRepository'

import type { FestivalEdicion } from '../types/festival'
import type { ErrorObject } from '@/types/errors'

export async function getFestivalesData(): Promise<{
  data: FestivalEdicion[]
  error: ErrorObject
}> {
  'use cache'
  cacheTag('web:festivales')
  try {
    const data = await festivalesRepository()

    return {
      data,
      error: null
    }
  } catch (error) {
    const err = error as Error
    console.error('Error fetching festivales:', err.message)

    return {
      data: [],
      error: {
        message:
          'Error al obtener los festivales. Por favor intente nuevamente más tarde.'
      }
    }
  }
}
