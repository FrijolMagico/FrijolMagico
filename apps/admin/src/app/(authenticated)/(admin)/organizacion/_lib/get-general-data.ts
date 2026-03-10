'use server'

import { cacheTag } from 'next/cache'

import { db } from '@frijolmagico/database/orm'
import { core } from '@frijolmagico/database/schema'
import { eq } from 'drizzle-orm'

import type { Organization, TeamMember } from '../_types'

import {
  ORGANIZATION_CACHE_TAG,
  ORGANIZATION_ID,
  TEAM_CACHE_TAG
} from '../_constants'

export async function getOrganizationData(): Promise<Organization | null> {
  'use cache'
  cacheTag(ORGANIZATION_CACHE_TAG)

  const organization = await db.query.organization.findFirst({
    where: eq(core.organization.id, ORGANIZATION_ID)
  })

  if (organization === undefined) return null

  return {
    ...organization,
    id: String(organization.id)
  }
}

export async function getTeamData(): Promise<TeamMember[] | null> {
  'use cache'
  cacheTag(TEAM_CACHE_TAG)

  const team = await db.query.organizationMember.findMany({
    where: eq(core.organizationMember.organizationId, ORGANIZATION_ID)
  })

  if (team === undefined) return null

  return team.map((member) => ({
    ...member,
    id: String(member.id),
    organizationId: String(member.organizationId),
    rrss: member.rrss ? JSON.parse(member.rrss) : null
  }))
}
