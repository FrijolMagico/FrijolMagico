'use server'

import 'server-only'

import { z } from 'zod'

import { requireAuth } from '@/shared/lib/auth/utils'
import { getArtistAvatarHistory } from '../_lib/get-artist-avatar-history'

const artistIdSchema = z.number().int().positive()

export async function getArtistAvatarHistoryAction(artistaId: number) {
  await requireAuth()
  return getArtistAvatarHistory(artistIdSchema.parse(artistaId))
}
