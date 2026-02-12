'use server'

import { db } from '@frijolmagico/database/orm'
import { core } from '@frijolmagico/database/schema'
import { eq } from 'drizzle-orm'

import { ORG_CACHE_TAG, ORG_ID, TEAM_CACHE_TAG } from '../_constants'
import { cacheTag } from 'next/cache'
import { RawOrganization, RawTeamMember } from '../_types'

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
    const organizacion = await getOrganization()

    if (!organizacion) {
      console.warn('⚠️ No organization found with id:', ORG_ID)
      return null
    }

    return organizacion
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
    const equipo = await getTeam()

    if (!equipo || equipo.length === 0) {
      console.warn('⚠️ No team members found for organization id:', ORG_ID)
      return null
    }

    return equipo
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
  cacheTag(ORG_CACHE_TAG)

  return await db.query.organizacion.findFirst({
    where: eq(core.organizacion.id, ORG_ID)
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
    where: eq(core.organizacionEquipo.organizacionId, ORG_ID)
  })
}
