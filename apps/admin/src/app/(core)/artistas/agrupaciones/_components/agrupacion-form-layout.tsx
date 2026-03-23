'use client'

import { Controller, useFormContext } from 'react-hook-form'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/shared/components/ui/field'
import { Input } from '@/shared/components/ui/input'
import { Switch } from '@/shared/components/ui/switch'
import { Textarea } from '@/shared/components/ui/textarea'
import type { AgrupacionFormInput } from '../_schemas/agrupacion.schema'

export function AgrupacionFormLayout() {
  const {
    control,
    register,
    formState: { errors }
  } = useFormContext<AgrupacionFormInput>()

  return (
    <FieldGroup className='pt-4'>
      <Field>
        <FieldLabel htmlFor='nombre'>
          Nombre <span className='text-destructive'>*</span>
        </FieldLabel>
        <Input
          id='nombre'
          {...register('nombre')}
          placeholder='Nombre de la agrupación'
          aria-invalid={Boolean(errors.nombre)}
        />
        {errors.nombre && <FieldError>{errors.nombre.message}</FieldError>}
      </Field>

      <Field>
        <FieldLabel htmlFor='descripcion'>Descripción</FieldLabel>
        <Textarea
          id='descripcion'
          {...register('descripcion')}
          placeholder='Descripción breve de la agrupación'
          className='min-h-24'
        />
        {errors.descripcion && (
          <FieldError>{errors.descripcion.message}</FieldError>
        )}
      </Field>

      <Field>
        <FieldLabel htmlFor='correo'>Correo</FieldLabel>
        <Input
          id='correo'
          type='email'
          {...register('correo')}
          placeholder='agrupacion@ejemplo.cl'
          aria-invalid={Boolean(errors.correo)}
        />
        {errors.correo && <FieldError>{errors.correo.message}</FieldError>}
      </Field>

      <div className='flex items-center gap-3'>
        <Controller
          name='activo'
          control={control}
          render={({ field }) => (
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
              aria-label='Estado activo'
            />
          )}
        />
        <FieldLabel>Activa</FieldLabel>
      </div>
    </FieldGroup>
  )
}
