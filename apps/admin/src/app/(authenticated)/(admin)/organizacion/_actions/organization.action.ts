'use server'

import { eq } from 'drizzle-orm'
import { updateTag } from 'next/cache'

import { db } from '@frijolmagico/database/orm'
import { core } from '@frijolmagico/database/schema'
import { requireAuth } from '@/lib/auth/utils'

import { ORGANIZATION_CACHE_TAG, ORGANIZATION_ID } from '../_constants'
import {
  OrganizationFormInput,
  organizationFormSchema,
  organizationUpdateSchema
} from '../_schemas/organizacion.schema'
import { ActionState } from '@/shared/types/actions'

const { organization } = core

export async function updateOrganization(
  _prevState: ActionState<OrganizationFormInput>,
  data: OrganizationFormInput
): Promise<ActionState<OrganizationFormInput>> {
  try {
    await requireAuth()

    const clientValidated = organizationFormSchema.safeParse(data)

    if (!clientValidated.success) {
      return {
        success: false,
        errors: clientValidated.error.issues.map((issue) => ({
          entityType: 'organizacion',
          message: issue.message
        }))
      }
    }

    const sanitized = {
      nombre: clientValidated.data.nombre,
      descripcion: clientValidated.data.descripcion ?? null,
      mision: clientValidated.data.mision ?? null,
      vision: clientValidated.data.vision ?? null
    }

    const validated = organizationUpdateSchema.safeParse(sanitized)

    if (!validated.success) {
      return {
        success: false,
        errors: validated.error.issues.map((issue) => ({
          entityType: 'organizacion',
          message: issue.message
        }))
      }
    }

    await db
      .update(organization)
      .set(validated.data)
      .where(eq(organization.id, ORGANIZATION_ID))

    updateTag(ORGANIZATION_CACHE_TAG)

    return {
      success: true,
      data: {
        nombre: validated.data.nombre ?? '',
        descripcion: validated.data.descripcion ?? '',
        mision: validated.data.mision ?? '',
        vision: validated.data.vision ?? ''
      }
    }
  } catch (error) {
    return {
      success: false,
      errors: [
        {
          entityType: 'organizacion',
          message: error instanceof Error ? error.message : 'Error desconocido'
        }
      ]
    }
  }
}
