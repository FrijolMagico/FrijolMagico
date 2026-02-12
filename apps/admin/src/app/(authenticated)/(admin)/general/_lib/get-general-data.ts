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
 * ## Error Handling
 *
 * - Retorna `null` si no encuentra organización
 * - Loguea warning en consola del servidor
 * - No lanza excepciones (safe error handling)
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
 * @returns Org o null si no existe
 */
export async function getOrganizationData(): Promise<RawOrganization | null> {
  try {
    const organization = await getOrganization()

    if (!organization) {
      console.warn('⚠️ No organization found with id:', ORGANIZATION_ID)
      return null
    }

    return organization
  } catch (error) {
    console.error('❌ Error fetching organization data:', error)
    return null
  }
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
  try {
    const team = await getTeam()

    if (!team) {
      console.warn(
        '⚠️ No team members found for organization id:',
        ORGANIZATION_ID
      )
      return null
    }

    return team
  } catch (error) {
    console.error('❌ Error fetching team data:', error)
    return null
  }
}

/**
 * Query cached de organización.
 *
 * @private
 */
async function getOrganization(): Promise<RawOrganization | undefined> {
  'use cache'
  cacheTag(ORGANIZATION_CACHE_TAG)

  return await db.query.organizacion.findFirst({
    where: eq(core.organizacion.id, ORGANIZATION_ID)
  })
}

/**
 * Query cached de equipo.
 *
 * @private
 */
async function getTeam(): Promise<RawTeamMember[] | undefined> {
  'use cache'
  cacheTag(TEAM_CACHE_TAG)

  return await db.query.organizacionEquipo.findMany({
    where: eq(core.organizacionEquipo.organizacionId, ORGANIZATION_ID)
  })
}
