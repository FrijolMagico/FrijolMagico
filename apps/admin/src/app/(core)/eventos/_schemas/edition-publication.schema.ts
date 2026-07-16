import { z } from 'zod'

export const editionPublicationSchema = z.object({
  id: z.number().int().positive(),
  published: z.boolean()
})

export type EditionPublicationInput = z.infer<typeof editionPublicationSchema>
