import { randomUUID } from 'node:crypto'

import { z } from 'zod'

import type { ExpectedActiveAvatar } from '../catalogo/_lib/avatar-history-contracts'

const artistAvatarUploadSchema = z
  .object({
    artistId: z.number().int().positive(),
    blob: z.instanceof(Blob).refine((blob) => blob.type === 'image/webp', {
      message: 'El avatar debe estar en formato WebP'
    }),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    expectedActive: z
      .object({
        id: z.number().int().positive(),
        path: z.string().min(1),
        version: z.string().nullable()
      })
      .nullable()
      .optional(),
    catalogId: z.number().int().positive().optional(),
    requestedActive: z.boolean().optional()
  })
  .refine((input) => input.width === 800 && input.height === 800, {
    message: 'El avatar preparado debe medir exactamente 800×800 px'
  })

export type ArtistAvatarUpload = z.infer<typeof artistAvatarUploadSchema>

export interface ArtistAvatarKey {
  path: string
  version: string
}

export interface ArtistAvatarReceiptClaims {
  artistId: number
  path: string
  version: string
  expectedActive: ExpectedActiveAvatar | null | undefined
  catalogId: number | undefined
  requestedActive: boolean | undefined
}

export interface ArtistAvatarEligibility {
  id: number
  slug: string
  artistDeletedAt: string | null
  catalogDeletedAt: string | null
}

export function parseArtistAvatarUpload(input: unknown): ArtistAvatarUpload {
  return artistAvatarUploadSchema.parse(input)
}

export function createArtistAvatarKey(
  canonicalSlug: string,
  version: string = randomUUID()
): ArtistAvatarKey {
  return {
    path: `artistas/${canonicalSlug}/avatar-${version}.webp`,
    version
  }
}

export function requireEligibleArtist(
  candidate: ArtistAvatarEligibility | null
): { artistId: number; canonicalSlug: string } {
  if (
    !candidate ||
    candidate.artistDeletedAt !== null ||
    candidate.catalogDeletedAt !== null
  )
    throw new Error('Artist avatar is ineligible')
  return { artistId: candidate.id, canonicalSlug: candidate.slug }
}
