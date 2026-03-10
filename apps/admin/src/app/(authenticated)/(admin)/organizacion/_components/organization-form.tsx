'use client'

import { Field, FieldGroup, FieldLabel } from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import { RichTextarea } from '@/shared/components/rich-textarea'
import { OrganizationFormInput } from '../_schemas/organizacion.schema'

interface OrganizationFormProps {
  id: string
  fields: OrganizationFormInput
  setField: (field: keyof OrganizationFormInput, value: string) => void
  errors: Partial<Record<keyof OrganizationFormInput, string>>
  formAction: (formData: FormData) => void | Promise<void>
}

export function OrganizationForm({
  id,
  fields,
  setField,
  errors,
  formAction
}: OrganizationFormProps) {
  return (
    <form id={id} action={formAction}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor='nombre'>Nombre de la Organización</FieldLabel>
          <Input
            id='nombre'
            name='nombre'
            value={fields.nombre ?? ''}
            onChange={(e) => setField('nombre', e.target.value)}
            placeholder='Frijol Mágico'
            className='w-full'
            aria-invalid={!!errors.nombre}
          />
          {errors.nombre && (
            <p className='text-destructive text-sm'>{errors.nombre}</p>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor='descripcion'>Descripción</FieldLabel>
          <Textarea
            id='descripcion'
            name='descripcion'
            value={fields.descripcion ?? ''}
            onChange={(e) => setField('descripcion', e.target.value)}
            placeholder='Describe la organización...'
            className='field-sizing-content!'
            rows={2}
            aria-invalid={!!errors.descripcion}
          />
          {errors.descripcion && (
            <p className='text-destructive text-sm'>{errors.descripcion}</p>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor='mision'>Misión</FieldLabel>
          <RichTextarea
            id='mision'
            value={fields.mision ?? ''}
            onChange={(value) => setField('mision', value)}
            placeholder='Nuestra misión es...'
          />
          <textarea
            className='hidden'
            aria-hidden
            name='mision'
            value={fields.mision ?? ''}
            readOnly
          />
          {errors.mision && (
            <p className='text-destructive text-sm'>{errors.mision}</p>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor='vision'>Visión</FieldLabel>
          <RichTextarea
            id='vision'
            value={fields.vision ?? ''}
            onChange={(value) => setField('vision', value)}
            placeholder='Nuestra visión es...'
          />
          <textarea
            className='hidden'
            aria-hidden
            name='vision'
            value={fields.vision ?? ''}
            readOnly
          />
          {errors.vision && (
            <p className='text-destructive text-sm'>{errors.vision}</p>
          )}
        </Field>
      </FieldGroup>
    </form>
  )
}
