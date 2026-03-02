'use client'

import type { Organization } from '../_types'
import { Label } from '@/shared/components/ui/label'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import { RichTextarea } from '@/shared/components/rich-textarea'
import {
  useOrganizationOperationStore,
  useOrganizationProjectionStore
} from '../_store/organization-ui-store'
import { ORGANIZATION_ID } from '../_constants'

interface OrganizationFormProps {
  initialData: Organization
}

export function OrganizationForm({ initialData }: OrganizationFormProps) {
  const projected = useOrganizationProjectionStore(
    (s) => s.byId[String(ORGANIZATION_ID)]
  )

  const source = projected ?? initialData

  return (
    <div className='space-y-6'>
      <div className='space-y-2'>
        <Label htmlFor='nombre'>Nombre de la Organización</Label>
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
      </div>

      <div className='space-y-2'>
        <Label htmlFor='descripcion'>Descripción</Label>
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
      </div>

      <div className='space-y-2'>
        <Label htmlFor='mision'>Misión</Label>
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
      </div>

      <div className='space-y-2'>
        <Label htmlFor='vision'>Visión</Label>
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
      </div>
    </div>
  )
}
