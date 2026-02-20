'use client'

import { Organization } from '../_types'
import { Label } from '@/shared/components/ui/label'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import { RichTextarea } from '@/shared/components/rich-textarea'
import {
  useOrganizationOperationStore,
  useOrganizationProjectionStore
} from '../_store/organization-ui-store'
import { ORGANIZATION_ID } from '../_constants'
import { useAutoJournal } from '@/shared/ui-state/operation-log/hooks/use-auto-journal'
import { useProjectionSync } from '../_hooks/use-organization-ui'

interface OrganizationFormProps {
  initialData: Organization
}

export function OrganizationForm({ initialData }: OrganizationFormProps) {
  const update = useOrganizationOperationStore((s) => s.update)
  const commitPendingOperations = useOrganizationOperationStore(
    (s) => s.commitPendingOperations
  )
  const projected = useOrganizationProjectionStore(
    (s) => s.byId[String(ORGANIZATION_ID)]
  )

  const source = projected ?? initialData

  useProjectionSync<Organization>({
    initialData: [initialData],
    operationStore: useOrganizationOperationStore,
    projectionStore: useOrganizationProjectionStore
  })

  const { handleChange, handleBlur } = useAutoJournal({
    data: source,
    actions: {
      update,
      save: commitPendingOperations
    }
  })

  console.log('(UI)[OrganizationForm]: ', {
    source
  })

  return (
    <div className='space-y-6'>
      <div className='space-y-2'>
        <Label htmlFor='nombre'>Nombre de la Organización</Label>
        <Input
          id='nombre'
          value={source.nombre || ''}
          onChange={(e) =>
            handleChange(
              'nombre',
              e.currentTarget.value,
              String(ORGANIZATION_ID)
            )
          }
          onBlur={() =>
            handleBlur('nombre', source.nombre || '', String(ORGANIZATION_ID))
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
            handleChange(
              'descripcion',
              e.currentTarget.value,
              String(ORGANIZATION_ID)
            )
          }
          onBlur={() =>
            handleBlur(
              'descripcion',
              source.descripcion || '',
              String(ORGANIZATION_ID)
            )
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
            handleChange('mision', value, String(ORGANIZATION_ID))
          }
          onBlur={() =>
            handleBlur('mision', source.mision || '', String(ORGANIZATION_ID))
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
            handleChange('vision', value, String(ORGANIZATION_ID))
          }
          onBlur={() =>
            handleBlur('vision', source.vision || '', String(ORGANIZATION_ID))
          }
          placeholder='Nuestra visión es...'
        />
      </div>
    </div>
  )
}
