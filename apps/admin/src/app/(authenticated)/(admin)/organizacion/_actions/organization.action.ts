'use server'

import { eq } from 'drizzle-orm'
import { updateTag } from 'next/cache'

import { db } from '@frijolmagico/database/orm'
import { core } from '@frijolmagico/database/schema'

import { ORGANIZATION_CACHE_TAG, ORGANIZATION_ID } from '../_constants'
import {
  OrganizationFormInput,
  organizationUpdateSchema
} from '../_schemas/organizacion.schema'
import { ActionState } from '@/shared/types/actions'

const { organization } = core

export async function updateOrganization(
  _prevState: ActionState<OrganizationFormInput>,
  formData: FormData
): Promise<ActionState<OrganizationFormInput>> {
  try {
    const raw = {
      nombre: formData.get('nombre'),
      descripcion: formData.get('descripcion'),
      mision: formData.get('mision'),
      vision: formData.get('vision')
    }

    // Transform undefined (missing field) to null for DB compatibility
    const sanitized = {
      nombre: raw.nombre ?? null,
      descripcion: raw.descripcion ?? null,
      mision: raw.mision ?? null,
      vision: raw.vision ?? null
    }

    const validated = organizationUpdateSchema.safeParse(sanitized)

    if (!validated.success) {
      return {
        success: false,
        errors: [
          {
            entityType: 'organizacion',
            message: validated.error.message
          }
        ]
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
        nombre: validated.data.nombre ?? '', // Provide default empty string if null
        descripcion: validated.data.descripcion,
        mision: validated.data.mision,
        vision: validated.data.vision
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
