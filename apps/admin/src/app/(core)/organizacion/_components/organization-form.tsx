'use client'

import { Controller, useFormContext } from 'react-hook-form'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel
} from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import { RichTextarea } from '@/shared/components/rich-textarea'
import type { OrganizationFormInput } from '../_schemas/organizacion.schema'
import { ORGANIZATION_FIELDS } from '../_constants'

interface OrganizationFormProps {
  id: string
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>
}

export function OrganizationForm({ id, onSubmit }: OrganizationFormProps) {
  const {
    control,
    formState: { errors }
  } = useFormContext<OrganizationFormInput>()

  return (
    <form id={id} onSubmit={onSubmit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor={ORGANIZATION_FIELDS.NAME}>
            Nombre de la Organización
          </FieldLabel>
          <Controller
            name={ORGANIZATION_FIELDS.NAME}
            control={control}
            render={({ field }) => (
              <Input
                id={ORGANIZATION_FIELDS.NAME}
                {...field}
                value={field.value ?? ''}
                onChange={field.onChange}
                placeholder='Frijol Mágico'
                className='w-full'
                aria-invalid={!!errors.nombre}
              />
            )}
          />
          {errors.nombre && <FieldError>{errors.nombre.message}</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor={ORGANIZATION_FIELDS.DESCRIPTION}>
            Descripción
          </FieldLabel>
          <Controller
            name={ORGANIZATION_FIELDS.DESCRIPTION}
            control={control}
            render={({ field }) => (
              <Textarea
                id={ORGANIZATION_FIELDS.DESCRIPTION}
                {...field}
                value={field.value ?? ''}
                onChange={field.onChange}
                placeholder='Describe la organización...'
                className='field-sizing-content!'
                rows={2}
                aria-invalid={!!errors.descripcion}
              />
            )}
          />
          {errors.descripcion && (
            <FieldError>{errors.descripcion.message}</FieldError>
          )}
        </Field>

        <Field>
          <FieldLabel htmlFor='mision'>Misión</FieldLabel>
          <Controller
            name={ORGANIZATION_FIELDS.MISSION}
            control={control}
            render={({ field }) => (
              <RichTextarea
                id={ORGANIZATION_FIELDS.MISSION}
                value={field.value ?? ''}
                onChange={field.onChange}
                placeholder='Nuestra misión es...'
              />
            )}
          />
          {errors.mision && <FieldError>{errors.mision.message}</FieldError>}
        </Field>

        <Field>
          <FieldLabel htmlFor={ORGANIZATION_FIELDS.VISION}>Visión</FieldLabel>
          <Controller
            name={ORGANIZATION_FIELDS.VISION}
            control={control}
            render={({ field }) => (
              <RichTextarea
                id={ORGANIZATION_FIELDS.VISION}
                value={field.value ?? ''}
                onChange={field.onChange}
                placeholder='Nuestra visión es...'
              />
            )}
          />
          {errors.vision && <FieldError>{errors.vision.message}</FieldError>}
        </Field>
      </FieldGroup>
    </form>
  )
}
