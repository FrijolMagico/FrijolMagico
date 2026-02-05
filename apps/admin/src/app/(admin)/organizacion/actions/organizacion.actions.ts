'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@frijolmagico/database/orm'
import { core } from '@frijolmagico/database/schema'
import { eq, and } from 'drizzle-orm'

const { organizacion, organizacionEquipo } = core
import type {
  OrganizacionFormData,
  UpdateOrganizacionResult
} from '../types/organizacion'

const ORGANIZATION_ID = 1

export async function updateOrganizacion(
  data: OrganizacionFormData
): Promise<UpdateOrganizacionResult> {
  try {
    // Update organizacion
    await db
      .update(organizacion)
      .set({
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        mision: data.mision || null,
        vision: data.vision || null,
        updatedAt: new Date().toISOString()
      })
      .where(eq(organizacion.id, ORGANIZATION_ID))

    // Handle equipo members
    const existingMembers = await db
      .select()
      .from(organizacionEquipo)
      .where(eq(organizacionEquipo.organizacionId, ORGANIZATION_ID))

    const existingIds = new Set(existingMembers.map((m) => m.id))

    // Process each member in the form data
    for (const member of data.equipo) {
      if (member.isDeleted && member.id) {
        // Delete existing member
        await db
          .delete(organizacionEquipo)
          .where(
            and(
              eq(organizacionEquipo.id, member.id),
              eq(organizacionEquipo.organizacionId, ORGANIZATION_ID)
            )
          )
      } else if (member.isNew) {
        // Insert new member
        await db.insert(organizacionEquipo).values({
          organizacionId: ORGANIZATION_ID,
          nombre: member.nombre,
          cargo: member.cargo || null,
          rrss: member.rrss || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      } else if (member.id && existingIds.has(member.id)) {
        // Update existing member
        await db
          .update(organizacionEquipo)
          .set({
            nombre: member.nombre,
            cargo: member.cargo || null,
            rrss: member.rrss || null,
            updatedAt: new Date().toISOString()
          })
          .where(
            and(
              eq(organizacionEquipo.id, member.id),
              eq(organizacionEquipo.organizacionId, ORGANIZATION_ID)
            )
          )
      }
    }

    revalidatePath('/organizacion')
    revalidatePath('/(sections)/nosotros')

    return { success: true }
  } catch (error) {
    console.error('Error updating organizacion:', error)
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Error desconocido al actualizar'
    }
  }
}
