'use server'

import 'server-only'

import { z } from 'zod'

import { requireAuth } from '@/shared/lib/auth/utils'
import { getArtistDetail } from '../_lib/get-artist-detail'

export async function getArtistDetailAction(artistId: number) {
  await requireAuth()
  return getArtistDetail(z.number().int().positive().parse(artistId))
}
