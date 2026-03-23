import { z } from 'zod'
import { DEFAULT_PAGE_SIZE } from '../_constants'

export const bandQueryParamsSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().default(DEFAULT_PAGE_SIZE),
  mostrar_eliminados: z.boolean().default(false)
})

export type BandQueryParams = z.infer<typeof bandQueryParamsSchema>
