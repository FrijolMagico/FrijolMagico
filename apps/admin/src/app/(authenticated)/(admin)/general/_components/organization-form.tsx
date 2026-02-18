'use client'

import { useEffect } from 'react'
import {
  useOrganizationActions,
  useOrganizationEffectiveData
} from '../_hooks/use-organization-ui'
import { useAutoJournal } from '@/shared/ui-state/entity-state/hooks/use-auto-journal'
import { RawOrganization } from '../_types'
import { Label } from '@/shared/components/ui/label'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import { RichTextarea } from '@/shared/components/rich-textarea'

interface OrganizationFormProps {
  initialData: RawOrganization
}

export function OrganizationForm({ initialData }: OrganizationFormProps) {
  const { set, update, commitCurrentEdits } = useOrganizationActions()
  const effectiveData = useOrganizationEffectiveData()

  const { handleChange, handleBlur } = useAutoJournal({
    data: effectiveData,
    actions: { update, save: commitCurrentEdits }
  })

  useEffect(() => {
    set(initialData)
  }, [initialData, set])

  const data = effectiveData || initialData

  return (
    <div className='space-y-6'>
      <div className='space-y-2'>
        <Label htmlFor='nombre'>Nombre de la Organización</Label>
        <Input
          id='nombre'
          value={data.nombre || ''}
          onChange={(e) => handleChange('nombre', e.currentTarget.value)}
          onBlur={() => handleBlur('nombre', data.nombre || '')}
          placeholder='Frijol Mágico'
          className='w-full'
        />
      </div>

      <div className='space-y-2'>
        <Label htmlFor='descripcion'>Descripción</Label>
        <Textarea
          id='descripcion'
          value={data.descripcion || ''}
          onChange={(e) => handleChange('descripcion', e.currentTarget.value)}
          onBlur={() => handleBlur('descripcion', data.descripcion || '')}
          placeholder='Describe la organización...'
          className='field-sizing-content! min-h-42'
          rows={2}
        />
      </div>

      <div className='space-y-2'>
        <Label htmlFor='mision'>Misión</Label>
        <RichTextarea
          id='mision'
          value={data.mision || ''}
          onChange={(value: string) => handleChange('mision', value)}
          onBlur={() => handleBlur('mision', data.mision || '')}
          placeholder='Nuestra misión es...'
        />
      </div>

      <div className='space-y-2'>
        <Label htmlFor='vision'>Visión</Label>
        <RichTextarea
          id='vision'
          value={data.vision || ''}
          onChange={(value: string) => handleChange('vision', value)}
          onBlur={() => handleBlur('vision', data.vision || '')}
          placeholder='Nuestra visión es...'
        />
      </div>
    </div>
  )
}
