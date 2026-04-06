'use server'

import { db } from '@frijolmagico/database/orm'
import { core } from '@frijolmagico/database/schema'
import { eq } from 'drizzle-orm'

const { organizationMember } = core

import { requireAuth } from '@/shared/lib/auth/utils'
import { updateTag } from 'next/cache'
import { TEAM_CACHE_TAG, ORGANIZATION_ID } from '../_constants'

import { ActionState } from '@/shared/types/actions'
import {
  type TeamMemberUpdateInput,
  type TeamMemberFormInput,
  teamMemberInsertSchema,
  teamMemberUpdateSchema
} from '../_schemas/organizacion.schema'

export async function createTeamMember(
  _prevState: ActionState,
  data: TeamMemberFormInput
): Promise<ActionState> {
  try {
    await requireAuth()

    const validated = teamMemberInsertSchema.safeParse({
      ...data,
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
  _prevState: ActionState<TeamMemberUpdateInput>,
  data: TeamMemberFormInput & { id: number }
): Promise<ActionState<TeamMemberUpdateInput>> {
  try {
    await requireAuth()

    const validated = teamMemberUpdateSchema.safeParse(data)

    if (!validated.success) {
      return {
        success: false,
        errors: validated.error.issues.map((issue) => ({
          entityType: 'organizacion_equipo',
          message: issue.message
        }))
      }
    }

    if (!validated.data.id) {
      return {
        success: false,
        errors: [
          {
            entityType: 'organizacion_equipo',
            message: 'ID del miembro del equipo es requerido'
          }
        ]
      }
    }

    await db
      .update(organizationMember)
      .set(validated.data)
      .where(eq(organizationMember.id, validated.data.id))

    updateTag(TEAM_CACHE_TAG)

    return {
      success: true,
      data: validated.data
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

export async function deleteTeamMember(id: number): Promise<ActionState> {
  try {
    await requireAuth()

    if (!id || typeof id !== 'number') {
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
