'use server'

import { cacheTag } from 'next/cache'

import { db } from '@frijolmagico/database/orm'
import { core } from '@frijolmagico/database/schema'
import { eq } from 'drizzle-orm'

import { RawOrganization, RawTeamMember } from '../_types'

import {
  ORGANIZATION_CACHE_TAG,
  ORGANIZATION_ID,
  TEAM_CACHE_TAG
} from '../_constants'

/**
 * Obtiene datos de la organización desde la base de datos.
 *
 * @example
 * ```typescript
 * // Server Component
 * import { getOrganizationData } from './_lib/getGeneralData'
 *
 * export default async function Page() {
 *   const data = await getOrganizationData()
 *
 *   if (!data) {
 *     return <div>Error: Organización no encontrada</div>
 *   }
 *
 *   return <OrgForm data={data} />
 * }
 * ```
 *
 * @returns Organization o null si no existe
 */
export async function getOrganizationData(): Promise<RawOrganization | null> {
  'use cache'
  cacheTag(ORGANIZATION_CACHE_TAG)

  const organization = await db.query.organizacion.findFirst({
    where: eq(core.organizacion.id, ORGANIZATION_ID)
  })

  if (organization === undefined) return null
  return organization
}

/**
 * Obtiene miembros del equipo desde la base de datos.
 *
 * @example
 * ```typescript
 * const equipo = await getEquipoData()
 *
 * if (equipo) {
 *   equipo.forEach((miembro) => {
 *     console.log(miembro.nombre, miembro.cargo)
 *   })
 * }
 * ```
 *
 * @returns Array de OrgEquipo o null
 */
export async function getTeamData(): Promise<RawTeamMember[] | null> {
  'use cache'
  cacheTag(TEAM_CACHE_TAG)

  const team = await db.query.organizacionEquipo.findMany({
    where: eq(core.organizacionEquipo.organizacionId, ORGANIZATION_ID)
  })

  if (team === undefined) return null
  return team
}
