import { z } from 'zod'
import { createInsertSchema, createUpdateSchema } from 'drizzle-zod'
import { artist as artistSchema } from '@frijolmagico/database/schema'

const artistTable = artistSchema.artist
const artistImageTable = artistSchema.artistImage

export const artistaInsertSchema = createInsertSchema(artistTable, {
  pseudonimo: (s: z.ZodType) =>
    (s as z.ZodString).min(1, { error: 'El pseudónimo es obligatorio' }),
  slug: (s: z.ZodType) =>
    (s as z.ZodString).min(1, { error: 'El slug es obligatorio' }),
  estadoId: (s: z.ZodType) =>
    (s as z.ZodOptional<z.ZodDefault<z.ZodNumber>>).default(1),
  rrss: () =>
    z.preprocess((val) => {
      if (val && typeof val === 'object') return JSON.stringify(val)
      return val
    }, z.string().optional()) as z.ZodType<string | undefined>
})

export const artistaUpdateSchema = createUpdateSchema(artistTable, {
  pseudonimo: (s: z.ZodType) =>
    (s as z.ZodString).min(1, { error: 'El pseudónimo es obligatorio' }),
  rrss: () =>
    z.preprocess((val) => {
      if (val && typeof val === 'object') return JSON.stringify(val)
      return val
    }, z.string().optional()) as z.ZodType<string | undefined>
})

export const artistaImagenInsertSchema = createInsertSchema(artistImageTable, {
  artistaId: () => z.coerce.number().int().positive(),
  imagenUrl: (s: z.ZodType) =>
    (s as z.ZodString).min(1, { error: 'La URL de imagen es obligatoria' }),
  tipo: (s: z.ZodType) => s as z.ZodType<'avatar' | 'galeria'>
})

export const artistaImagenUpdateSchema = createUpdateSchema(artistImageTable)

export type ArtistaInsertInput = z.infer<typeof artistaInsertSchema>
export type ArtistaUpdateInput = z.infer<typeof artistaUpdateSchema>
export type ArtistaImagenInsertInput = z.infer<typeof artistaImagenInsertSchema>
export type ArtistaImagenUpdateInput = z.infer<typeof artistaImagenUpdateSchema>

export type ArtistaInput = ArtistaInsertInput
export type ArtistaImagenInput = ArtistaImagenInsertInput

export const artistaFormSchema = artistaInsertSchema
  .pick({
    nombre: true,
    pseudonimo: true,
    slug: true,
    rut: true,
    correo: true,
    rrss: true,
    ciudad: true,
    pais: true,
    telefono: true
  })
  .extend({
    pseudonimo: z.string().min(1, { message: 'El pseudónimo es obligatorio' }),
    slug: z.string().min(1, { message: 'El slug es obligatorio' }),
    estadoId: z.string().min(1)
  })

export const artistaImagenFormSchema = artistaImagenInsertSchema
  .pick({
    artistaId: true,
    imagenUrl: true,
    tipo: true,
    orden: true,
    metadata: true
  })
  .extend({
    artistaId: z.string().min(1, { message: 'El artista es obligatorio' }),
    imagenUrl: z.string().min(1, { message: 'La URL es obligatoria' })
  })

export type ArtistaFormInput = z.infer<typeof artistaFormSchema>
export type ArtistaImagenFormInput = z.infer<typeof artistaImagenFormSchema>

const artistHistoryTable = artistSchema.artistHistory

export const artistaHistorialInsertSchema = createInsertSchema(
  artistHistoryTable,
  {
    artistaId: () => z.coerce.number().int().positive(),
    rrss: () => z.string().optional()
  }
)

export type ArtistaHistorialInsertInput = z.infer<
  typeof artistaHistorialInsertSchema
>
