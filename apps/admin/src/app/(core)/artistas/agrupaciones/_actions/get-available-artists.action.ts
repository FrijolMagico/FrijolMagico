'use server'

import 'server-only'
import { getAvailableArtists } from '../_lib/get-available-artists'

export async function getAvailableArtistsAction(
  agrupacionId: number,
  search = ''
) {
  return getAvailableArtists(agrupacionId, search)
}
