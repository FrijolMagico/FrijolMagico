import { aboutRepository } from '../adapters/aboutRepository'

import type { AboutData } from '../types/about'
import type { ErrorObject } from '@/types/errors'

export async function getAboutData(): Promise<{
  data: AboutData | null
  error: ErrorObject
}> {
  try {
    const data = await aboutRepository()
    return { data, error: null }
  } catch (error) {
    const err = error as Error
    console.error(err.message)
    return {
      data: null,
      error: {
        message:
          'Error al obtener la información. Por favor intente nuevamente.',
      },
    }
  }
}
