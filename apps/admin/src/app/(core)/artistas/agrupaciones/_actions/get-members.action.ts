'use server'

import 'server-only'
import { requireAuth } from '@/shared/lib/auth/utils'
import { getMembers } from '../_lib/get-members'

export async function getMembersAction(agrupacionId: number) {
  await requireAuth()

  return getMembers(agrupacionId)
}
