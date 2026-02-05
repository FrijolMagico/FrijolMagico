import { db } from '@frijolmagico/database/orm'
import { core } from '@frijolmagico/database/schema'
import { eq } from 'drizzle-orm'

const { organizacion } = core
import type { Organizacion } from '../types/organizacion'

const ORGANIZATION_ID = 1

export async function getOrganizacionData(): Promise<Organizacion | null> {
  try {
    const result = await db.query.organizacion.findFirst({
      where: eq(organizacion.id, ORGANIZATION_ID),
      with: {
        equipo: true
      }
    })

    if (!result) {
      console.warn('⚠️ No organization found with id:', ORGANIZATION_ID)
      return null
    }

    return result as Organizacion
  } catch (error) {
    console.error('❌ Error fetching organization data:', error)
    return null
  }
}
