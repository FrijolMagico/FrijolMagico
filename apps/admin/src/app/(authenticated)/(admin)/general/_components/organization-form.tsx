'use client'

import { RichTextField } from '@/shared/components/form/rich-text-field'
import { TextField } from '@/shared/components/form/text-field'
import { useEffect } from 'react'
import {
  useOrganizationActions,
  useOrganizationEffectiveData
} from '../_hooks/use-organization-ui'
import { RawOrganization } from '../_types'

interface OrganizationFormProps {
  initialData: RawOrganization
}

/**
 * Formulario de información general de la organización.
 *
 * ## Flujo de Datos
 *
 * Este componente implementa el patrón Entity State (singleton mode):
 *
 * 1. **Server Component** → fetch datos originales
 * 2. **Set Data** → `set(initialData)` en useEffect
 * 3. **User Input** → `update({ field: value })` en onChange
 * 4. **Display** → `effectiveData` desde `selectOne()`
 */
export function OrganizationForm({ initialData }: OrganizationFormProps) {
  const { set, update } = useOrganizationActions()
  const effectiveData = useOrganizationEffectiveData()

  useEffect(() => {
    set(initialData)
  }, [initialData, set])

  // TODO: avoid magic strings, instead use enums or constants objects in the constans/configs file for this scope
  const handleFieldChange = async (
    field: 'nombre' | 'descripcion' | 'mision' | 'vision',
    value: string
  ) => {
    update({ [field]: value })
  }

  const data = effectiveData || initialData

  return (
    <div className='space-y-6'>
      <TextField
        label='Nombre de la Organización'
        field='nombre'
        value={data.nombre}
        onChange={(_, value) => handleFieldChange('nombre', value)}
        placeholder='Frijol Mágico'
      />

      <RichTextField
        label='Descripción'
        value={data.descripcion || ''}
        onChange={(value) => handleFieldChange('descripcion', value)}
        placeholder='Describe la organización...'
        minHeight='120px'
      />

      <RichTextField
        label='Misión'
        value={data.mision || ''}
        onChange={(value) => handleFieldChange('mision', value)}
        placeholder='Nuestra misión es...'
      />

      <RichTextField
        label='Visión'
        value={data.vision || ''}
        onChange={(value) => handleFieldChange('vision', value)}
        placeholder='Nuestra visión es...'
      />
    </div>
  )
}
