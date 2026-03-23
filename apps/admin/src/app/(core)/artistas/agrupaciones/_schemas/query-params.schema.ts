import { z } from 'zod'
import {
  paginationParamsSchema,
  searchParamsSchema
} from '@/shared/schemas/query-params.schema'

export const agrupacionQueryParamsSchema = z.object({
  ...paginationParamsSchema.shape,
  ...searchParamsSchema.shape,
  mostrar_eliminados: z.boolean().optional().default(false)
})

export type AgrupacionQueryParams = z.infer<typeof agrupacionQueryParamsSchema>
