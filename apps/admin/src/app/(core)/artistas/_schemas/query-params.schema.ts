import { z } from 'zod'
import {
  paginationParamsSchema,
  searchParamsSchema
} from '@/shared/schemas/query-params.schema'

export const artistQueryParamsSchema = z.object({
  ...paginationParamsSchema.shape,
  ...searchParamsSchema.shape,
  mostrar_eliminados: z.boolean().optional().default(false),
  pais: z.string().nullable(),
  ciudad: z.string().nullable(),
  estado: z.number().min(1).max(5).nullable()
})

export type ArtistQueryParams = z.infer<typeof artistQueryParamsSchema>
