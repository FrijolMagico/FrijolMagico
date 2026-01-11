import { unstable_cache } from 'next/cache'

import { festivalesRepository } from '../adapters/festivalesRepository'

import type { FestivalEdicion } from '../types/festival'
import type { ErrorObject } from '@/types/errors'

const getCachedFestivalesData = unstable_cache(
  async (): Promise<FestivalEdicion[]> => {
    return festivalesRepository()
  },
  ['festivales-list'],
  {
    revalidate: false,
    tags: ['festivales'],
  },
)

export async function getFestivalesData(): Promise<{
  data: FestivalEdicion[]
  error: ErrorObject
}> {
  try {
    const data = await getCachedFestivalesData()

    return {
      data,
      error: null,
    }
  } catch (error) {
    const err = error as Error
    console.error('Error fetching festivales:', err.message)

    return {
      data: [],
      error: {
        message:
          'Error al obtener los festivales. Por favor intente nuevamente más tarde.',
      },
    }
  }
}
