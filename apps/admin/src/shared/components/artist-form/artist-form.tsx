'use client'

import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/components/ui/select'
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError
} from '@/shared/components/ui/field'

interface ArtistFormLayoutProps {
  formData: {
    nombre: string
    pseudonimo: string
    rut: string
    telefono: string
    correo: string
    estadoId: string | number
    ciudad: string
    pais: string
  }
  errors?: { pseudonimo?: string; estadoId?: string }
  onFieldChange: (field: string, value: string) => void
  customFields?: React.ReactNode
  actions?: React.ReactNode
}

export function ArtistFormLayout({
  formData,
  errors,
  onFieldChange,
  customFields,
  actions
}: ArtistFormLayoutProps) {
  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor='nombre'>Nombre</FieldLabel>
        <Input
          id='nombre'
          value={formData.nombre}
          onChange={(e) => onFieldChange('nombre', e.target.value)}
          placeholder='Nombre completo'
        />
      </Field>

      <Field>
        <FieldLabel htmlFor='pseudonimo'>
          Pseudónimo <span className='text-destructive'>*</span>
        </FieldLabel>
        <Input
          id='pseudonimo'
          value={formData.pseudonimo || ''}
          onChange={(e) => onFieldChange('pseudonimo', e.target.value)}
          placeholder='@usuario'
          aria-invalid={!!errors?.pseudonimo}
        />
        {errors?.pseudonimo && (
          <FieldError>{errors.pseudonimo}</FieldError>
        )}
      </Field>

      {customFields}

      <div className='grid grid-cols-2 gap-4'>
        <Field>
          <FieldLabel htmlFor='rut'>RUT</FieldLabel>
          <Input
            id='rut'
            value={formData.rut || ''}
            onChange={(e) => onFieldChange('rut', e.target.value)}
            placeholder='12.345.678-9'
          />
        </Field>
        <Field>
          <FieldLabel htmlFor='telefono'>Teléfono</FieldLabel>
          <Input
            id='telefono'
            value={formData.telefono || ''}
            onChange={(e) => onFieldChange('telefono', e.target.value)}
            placeholder='+56912345678'
          />
        </Field>
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <Field>
          <FieldLabel htmlFor='correo'>Correo electrónico</FieldLabel>
          <Input
            id='correo'
            type='email'
            value={formData.correo}
            onChange={(e) => onFieldChange('correo', e.target.value)}
            placeholder='artista@ejemplo.com'
          />
        </Field>
        <Field>
          <FieldLabel htmlFor='estadoId'>Estado</FieldLabel>
          <Select
            value={String(formData.estadoId)}
            onValueChange={(val) => onFieldChange('estadoId', val || '1')}
          >
            <SelectTrigger id='estadoId'>
              <SelectValue placeholder='Estado' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='2'>Activo</SelectItem>
              <SelectItem value='3'>Inactivo</SelectItem>
              <SelectItem value='4'>Vetado</SelectItem>
              <SelectItem value='5'>Cancelado</SelectItem>
              <SelectItem value='1'>Desconocido</SelectItem>
            </SelectContent>
          </Select>
          {errors?.estadoId && <FieldError>{errors.estadoId}</FieldError>}
        </Field>
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <Field>
          <FieldLabel htmlFor='ciudad'>Ciudad</FieldLabel>
          <Input
            id='ciudad'
            value={formData.ciudad || ''}
            onChange={(e) => onFieldChange('ciudad', e.target.value)}
            placeholder='Santiago'
          />
        </Field>
        <Field>
          <FieldLabel htmlFor='pais'>País</FieldLabel>
          <Input
            id='pais'
            value={formData.pais || ''}
            onChange={(e) => onFieldChange('pais', e.target.value)}
            placeholder='Chile'
          />
        </Field>
      </div>

      {actions}
    </FieldGroup>
  )
}
