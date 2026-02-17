'use client'

import { useEffect, Suspense } from 'react'
import {
  useOrganizationActions,
  useOrganizationEffectiveData
} from '../_hooks/use-organization-ui'
import { useAutoJournal } from '@/shared/ui-state/entity-state/hooks/use-auto-journal'
import { RawOrganization } from '../_types'
import { Label } from '@/shared/components/ui/label'
import { Input } from '@/shared/components/ui/input'
import { RichTextFieldDynamic } from '@/shared/components/form/rich-text-field.dynamic'
import { RichTextFieldSkeleton } from '@/shared/components/form/rich-text-field.skeleton'
import { RichTextFieldErrorBoundary } from '@/shared/components/form/rich-text-field-error'

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
  const { set, update, commitCurrentEdits } = useOrganizationActions()
  const effectiveData = useOrganizationEffectiveData()

  const { handleChange, handleBlur } = useAutoJournal({
    effectiveData,
    actions: { update, commitCurrentEdits }
  })

  useEffect(() => {
    set(initialData)
  }, [initialData, set])

  const data = effectiveData || initialData

  return (
    <div className='space-y-6'>
      <div className='space-y-2'>
        <Label htmlFor='nombre'>Nombre de la Organización</Label>
        <div className='border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 field-sizing-content gap-0 overflow-hidden rounded-md border bg-transparent p-0 shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3'>
          <Input
            id='nombre'
            value={data.nombre || ''}
            onChange={(e) => handleChange('nombre', e.currentTarget.value)}
            onBlur={() => handleBlur('nombre', data.nombre || '')}
            placeholder='Frijol Mágico'
            className='w-full'
          />
        </div>
      </div>

      <div className='space-y-2'>
        <Label>Descripción</Label>
        <RichTextFieldErrorBoundary>
          <Suspense fallback={<RichTextFieldSkeleton />}>
            <RichTextFieldDynamic
              id='descripcion'
              value={data.descripcion || ''}
              onChange={(value: string) => handleChange('descripcion', value)}
              onBlur={() => handleBlur('descripcion', data.descripcion || '')}
              placeholder='Describe la organización...'
              minHeight='120px'
            />
          </Suspense>
        </RichTextFieldErrorBoundary>
      </div>

      <div className='space-y-2'>
        <Label>Misión</Label>
        <RichTextFieldErrorBoundary>
          <Suspense fallback={<RichTextFieldSkeleton />}>
            <RichTextFieldDynamic
              id='mision'
              value={data.mision || ''}
              onChange={(value: string) => handleChange('mision', value)}
              onBlur={() => handleBlur('mision', data.mision || '')}
              placeholder='Nuestra misión es...'
            />
          </Suspense>
        </RichTextFieldErrorBoundary>
      </div>

      <div className='space-y-2'>
        <Label>Visión</Label>
        <RichTextFieldErrorBoundary>
          <Suspense fallback={<RichTextFieldSkeleton />}>
            <RichTextFieldDynamic
              id='vision'
              value={data.vision || ''}
              onChange={(value: string) => handleChange('vision', value)}
              onBlur={() => handleBlur('vision', data.vision || '')}
              placeholder='Nuestra visión es...'
            />
          </Suspense>
        </RichTextFieldErrorBoundary>
      </div>
    </div>
  )
}
