'use client'

import { RichTextField } from '@/shared/components/form/rich-text-field'
import { Suspense, useEffect } from 'react'
import {
  useOrganizationActions,
  useOrganizationEffectiveData
} from '../_hooks/use-organization-ui'
import { RawOrganization } from '../_types'
import { Label } from '@/shared/components/ui/label'
import { Input } from '@/shared/components/ui/input'
import { RichTextFieldSkeleton } from '@/shared/components/form/rich-text-field.skeleton'

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
    // TODO: implement in this level the update only if actually change anything
    console.log({
      updating: `${field}: ${value}`,
      prevValue: effectiveData?.[field] || initialData[field]
    })

    if (value === initialData[field]) {
      console.log('Data is exactly the original, no changes will made.')
    }

    update({ [field]: value })
  }

  const data = effectiveData || initialData

  return (
    <div className='space-y-6'>
      <div className='space-y-2'>
        <Label>Nombre de la Organización</Label>
        <div className='border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 field-sizing-content gap-0 overflow-hidden rounded-md border bg-transparent p-0 shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3'>
          <Input
            id='nombre'
            value={data.nombre || ''}
            onChange={(e) => handleFieldChange('nombre', e.currentTarget.value)}
            placeholder='Frijol Mágico'
            className='w-full'
          />
        </div>
      </div>

      <div className='space-y-2'>
        <Label>Descripción</Label>
        <div className='border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 field-sizing-content gap-0 overflow-hidden rounded-md border bg-transparent p-0 shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3'>
          <Suspense fallback={<RichTextFieldSkeleton />}>
            <RichTextField
              value={data.descripcion || ''}
              onChange={(value) => handleFieldChange('descripcion', value)}
              placeholder='Describe la organización...'
              minHeight='120px'
            />
          </Suspense>
        </div>
      </div>

      <div className='space-y-2'>
        <Label>Misión</Label>
        <div className='border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 field-sizing-content gap-0 overflow-hidden rounded-md border bg-transparent p-0 shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3'>
          <Suspense fallback={<RichTextFieldSkeleton />}>
            <RichTextField
              value={data.mision || ''}
              onChange={(value) => handleFieldChange('mision', value)}
              placeholder='Nuestra misión es...'
            />
          </Suspense>
        </div>
      </div>

      <div className='space-y-2'>
        <Label>Vision</Label>
        <div className='border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 field-sizing-content gap-0 overflow-hidden rounded-md border bg-transparent p-0 shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3'>
          <Suspense fallback={<RichTextFieldSkeleton />}>
            <RichTextField
              value={data.vision || ''}
              onChange={(value) => handleFieldChange('vision', value)}
              placeholder='Nuestra visión es...'
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
