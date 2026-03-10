'use server'

import { db } from '@frijolmagico/database/orm'
import { core } from '@frijolmagico/database/schema'
import { eq } from 'drizzle-orm'

const { organizationMember } = core

import { requireAuth } from '@/lib/auth/utils'
import { updateTag } from 'next/cache'
import { TEAM_CACHE_TAG, ORGANIZATION_ID } from '../_constants'

import { ActionState } from '@/shared/types/actions'
import {
  teamMemberInsertSchema,
  teamMemberUpdateSchema
} from '../_schemas/organizacion.schema'

export async function addTeamMember(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireAuth()

    const raw = {
      name: formData.get('name'),
      position: formData.get('position'),
      rut: formData.get('rut'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      rrss: formData.get('rrss')
    }

    // TODO: We need to validate the rrss field separately because it's a JSON string in the form but an object in our schema

    const validated = teamMemberInsertSchema.safeParse({
      ...raw,
      organizationId: ORGANIZATION_ID
    })

    if (!validated.success) {
      return {
        success: false,
        errors: validated.error.issues.map((issue) => ({
          entityType: 'organizacion_equipo',
          message: issue.message
        }))
      }
    }

    await db.insert(organizationMember).values(validated.data)

    updateTag(TEAM_CACHE_TAG)

    return {
      success: true
    }
  } catch (error) {
    return {
      success: false,
      errors: [
        {
          entityType: 'organizacion_equipo',
          message:
            error instanceof Error
              ? error.message
              : 'Error al añadir al miembro del equipo'
        }
      ]
    }
  }
}

export async function updateTeamMember(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    await requireAuth()

    const memberId = formData.get('memberId')
    if (!memberId || typeof memberId !== 'string') {
      return {
        success: false,
        errors: [
          {
            entityType: 'organizacion_equipo',
            message: 'ID del miembro requerido'
          }
        ]
      }
    }

    const raw = {
      name: formData.get('name'),
      position: formData.get('position'),
      rut: formData.get('rut'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      rrss: formData.get('rrss')
    }

    const validated = teamMemberUpdateSchema.safeParse({
      ...raw,
      rrss: raw.rrss ? JSON.parse(raw.rrss as string) : undefined
    })

    if (!validated.success) {
      return {
        success: false,
        errors: validated.error.issues.map((issue) => ({
          entityType: 'organizacion_equipo',
          message: issue.message
        }))
      }
    }

    await db
      .update(organizationMember)
      .set(validated.data)
      .where(eq(organizationMember.id, Number(memberId)))

    updateTag(TEAM_CACHE_TAG)

    return {
      success: true
    }
  } catch (error) {
    return {
      success: false,
      errors: [
        {
          entityType: 'organizacion_equipo',
          message:
            error instanceof Error
              ? error.message
              : 'Error al actualizar el miembro del equipo'
        }
      ]
    }
  }
}

export async function deleteTeamMember(id: string): Promise<ActionState> {
  try {
    await requireAuth()

    if (!id || typeof id !== 'string') {
      return {
        success: false,
        errors: [
          {
            entityType: 'organizacion_equipo',
            message: 'ID del miembro requerido'
          }
        ]
      }
    }

    await db
      .delete(organizationMember)
      .where(eq(organizationMember.id, Number(id)))

    updateTag(TEAM_CACHE_TAG)

    return {
      success: true
    }
  } catch (error) {
    return {
      success: false,
      errors: [
        {
          entityType: 'organizacion_equipo',
          message:
            error instanceof Error
              ? error.message
              : 'Error al eliminar el miembro del equipo'
        }
      ]
    }
  }
}
