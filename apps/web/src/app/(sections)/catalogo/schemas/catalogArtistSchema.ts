import { z } from 'zod'

import { getFirstRrssUrl } from '@frijolmagico/utils/rrss'
import { getDisciplineLabel } from '@/app/(sections)/adapters/mappers/disciplineMapper'

import {
  CatalogArtistFromDBSchema,
  EditionParticipationSchema
} from './catalogDBSchema'

const CDN_BASE_URL = process.env.CDN_URL ?? ''

/**
 * Formatea la URL del avatar agregando el CDN base.
 * Si el avatar es null o es un placeholder local, retorna el path local.
 */
const formatAvatarUrl = (avatar: string | null): string => {
  if (!avatar) return '/sections/catalogo/images/artists/placeholder-avatar.svg'

  // Si ya es una URL completa o es un placeholder local, no modificar
  if (avatar.startsWith('http') || avatar.startsWith('/')) {
    return avatar
  }

  // Agregar CDN base URL
  return `${CDN_BASE_URL}/${avatar}`
}

/**
 * Schema para el colectivo en formato UI (compatibilidad con estructura anterior)
 */
export const CollectiveSchema = z
  .object({
    name: z.string(),
    members: z.array(
      z.object({
        id: z.string(),
        name: z.string()
      })
    )
  })
  .nullable()

/**
 * Schema que transforma datos de la DB al formato de la UI.
 * Aplica las siguientes transformaciones:
 * - id: number → string
 * - category: slug → label (o null si no existe)
 * - destacado: number → boolean
 * - Defaults para campos nullable
 */
export const CatalogArtistSchema = CatalogArtistFromDBSchema.transform(
  (data) => ({
    id: data.id.toString(),
    name: data.name,
    slug: data.slug,
    email: data.email ?? '',
    rrss: getFirstRrssUrl(data.rrss, 'instagram'),
    city: data.city ?? '',
    country: data.country ?? '',
    bio: data.bio ?? '',
    orden: data.orden,
    destacado: data.destacado === 1,
    avatar: formatAvatarUrl(data.avatar),
    category: data.category ? getDisciplineLabel(data.category) : null,
    collective: data.collective,
    editions: data.editions
  })
)

export { EditionParticipationSchema }

export type CatalogArtist = z.infer<typeof CatalogArtistSchema>
export type Collective = z.infer<typeof CollectiveSchema>
