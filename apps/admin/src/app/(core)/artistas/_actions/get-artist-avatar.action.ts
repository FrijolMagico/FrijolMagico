'use server'

import 'server-only'

import { z } from 'zod'

import { requireAuth } from '@/shared/lib/auth/utils'
import { getArtistAvatar } from '../_lib/get-artist-avatar'

const artistIdSchema = z.number().int().positive()

export async function getArtistAvatarAction(artistaId: number) {
  await requireAuth()
  return getArtistAvatar(artistIdSchema.parse(artistaId))
}
