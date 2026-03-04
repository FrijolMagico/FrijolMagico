'use client'

import type { Organization } from '../_types'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import { RichTextarea } from '@/shared/components/rich-textarea'
import {
  useOrganizationOperationStore,
  useOrganizationProjectionStore
} from '../_store/organization-ui-store'
import { ORGANIZATION_ID } from '../_constants'
import { Field, FieldGroup, FieldLabel } from '@/shared/components/ui/field'

interface OrganizationFormProps {
  initialData: Organization
}

export function OrganizationForm({ initialData }: OrganizationFormProps) {
  const projected = useOrganizationProjectionStore(
    (s) => s.byId[String(ORGANIZATION_ID)]
  )

  const source = projected ?? initialData

  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor='nombre'>Nombre de la Organización</FieldLabel>
        <Input
          id='nombre'
          value={source.nombre || ''}
          onChange={(e) =>
            useOrganizationOperationStore
              .getState()
              .update(String(ORGANIZATION_ID), {
                nombre: e.currentTarget.value
              })
          }
          placeholder='Frijol Mágico'
          className='w-full'
        />
      </Field>

      <Field>
        <FieldLabel htmlFor='descripcion'>Descripción</FieldLabel>
        <Textarea
          id='descripcion'
          value={source.descripcion || ''}
          onChange={(e) =>
            useOrganizationOperationStore
              .getState()
              .update(String(ORGANIZATION_ID), {
                descripcion: e.currentTarget.value
              })
          }
          placeholder='Describe la organización...'
          className='field-sizing-content! min-h-42'
          rows={2}
        />
      </Field>

      <Field>
        <FieldLabel htmlFor='mision'>Misión</FieldLabel>
        <RichTextarea
          id='mision'
          value={source.mision || ''}
          onChange={(value: string) =>
            useOrganizationOperationStore
              .getState()
              .update(String(ORGANIZATION_ID), { mision: value })
          }
          placeholder='Nuestra misión es...'
        />
      </Field>

      <Field>
        <FieldLabel htmlFor='vision'>Visión</FieldLabel>
        <RichTextarea
          id='vision'
          value={source.vision || ''}
          onChange={(value: string) =>
            useOrganizationOperationStore
              .getState()
              .update(String(ORGANIZATION_ID), { vision: value })
          }
          placeholder='Nuestra visión es...'
        />
      </Field>
    </FieldGroup>
  )
}
