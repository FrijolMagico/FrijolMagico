'use client'

import { useState } from 'react'
import { EntityFormDialog } from '@/shared/components/entity-form-dialog/entity-form-dialog'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError
} from '@/shared/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/components/ui/select'
import { useArtistDialog } from '../_store/artist-dialog-store'
import { useArtistsOperationStore } from '../_store/artista-ui-store'
import { artistaFormSchema } from '../_schemas/artista.schema'

function toSlug(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
}

const STATUS_SLUG_MAP: Record<number, string> = {
  1: 'desconocido',
  2: 'activo',
  3: 'inactivo',
  4: 'vetado',
  5: 'cancelado'
}

type AddArtistFormData = {
  pseudonimo: string
  nombre: string
  correo: string
  estadoId: string
  ciudad: string
  pais: string
}

function AddArtistFormContent({
  onApply,
  onCancel
}: {
  onApply: (data: AddArtistFormData) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    pseudonimo: '',
    nombre: '',
    correo: '',
    estadoId: '2',
    ciudad: '',
    pais: ''
  })
  const [errors, setErrors] = useState<{
    pseudonimo?: string
    estadoId?: string
  }>({})

  const handlePseudonimoChange = (val: string) => {
    setFormData((prev) => ({ ...prev, pseudonimo: val }))
  }

  const handleApply = () => {
    setErrors({})
    const result = artistaFormSchema.safeParse({
      pseudonimo: formData.pseudonimo,
      slug: toSlug(formData.pseudonimo), // auto-generate slug
      nombre: formData.nombre || undefined,
      correo: formData.correo || undefined,
      ciudad: formData.ciudad || undefined,
      pais: formData.pais || undefined,
      estadoId: formData.estadoId
    })

    if (!result.success) {
      const fieldErrors: {
        pseudonimo?: string
        estadoId?: string
      } = {}
      for (const issue of result.error.issues) {
        if (issue.path[0] === 'pseudonimo')
          fieldErrors.pseudonimo = issue.message
        if (issue.path[0] === 'estadoId') fieldErrors.estadoId = issue.message
      }
      setErrors(fieldErrors)
      return
    }

    onApply(formData)
  }

  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor='pseudonimo'>
          Pseudónimo <span className='text-destructive'>*</span>
        </FieldLabel>
        <Input
          id='pseudonimo'
          value={formData.pseudonimo}
          onChange={(e) => handlePseudonimoChange(e.target.value)}
          placeholder='@usuario'
          aria-invalid={!!errors.pseudonimo}
        />
        {errors.pseudonimo && <FieldError>{errors.pseudonimo}</FieldError>}
      </Field>

      <Field>
        <FieldLabel htmlFor='nombre'>Nombre</FieldLabel>
        <Input
          id='nombre'
          value={formData.nombre}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, nombre: e.target.value }))
          }
          placeholder='Nombre completo'
        />
      </Field>

      <div className='grid grid-cols-2 gap-4'>
        <Field>
          <FieldLabel htmlFor='correo'>Correo electrónico</FieldLabel>
          <Input
            id='correo'
            type='email'
            value={formData.correo}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, correo: e.target.value }))
            }
            placeholder='artista@ejemplo.com'
          />
        </Field>
        <Field>
          <FieldLabel htmlFor='estadoId'>Estado</FieldLabel>
          <Select
            value={formData.estadoId}
            onValueChange={(val) =>
              setFormData((prev) => ({ ...prev, estadoId: val as string }))
            }
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
          {errors.estadoId && <FieldError>{errors.estadoId}</FieldError>}
        </Field>
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <Field>
          <FieldLabel htmlFor='ciudad'>Ciudad</FieldLabel>
          <Input
            id='ciudad'
            value={formData.ciudad}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, ciudad: e.target.value }))
            }
            placeholder='Santiago'
          />
        </Field>
        <Field>
          <FieldLabel htmlFor='pais'>País</FieldLabel>
          <Input
            id='pais'
            value={formData.pais}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, pais: e.target.value }))
            }
            placeholder='Chile'
          />
        </Field>
      </div>

      <div className='flex justify-end gap-2 pt-4'>
        <Button variant='outline' onClick={onCancel}>
          Cancelar
        </Button>
        <Button onClick={handleApply}>Agregar artista</Button>
      </div>
    </FieldGroup>
  )
}

export function AddArtistDialog() {
  const addDialogOpen = useArtistDialog((s) => s.addDialogOpen)
  const closeAddDialog = useArtistDialog((s) => s.closeAddDialog)
  const add = useArtistsOperationStore((s) => s.add)

  const handleApply = (formData: AddArtistFormData) => {
    const numericEstadoId = Number(formData.estadoId)
    const generatedSlug = toSlug(formData.pseudonimo)
    add({
      nombre: formData.nombre.trim() || null,
      pseudonimo: formData.pseudonimo.trim(),
      slug: generatedSlug,
      rut: null,
      correo: formData.correo.trim() || null,
      telefono: null,
      ciudad: formData.ciudad.trim() || null,
      pais: formData.pais.trim() || null,
      rrss: null,
      estadoId: numericEstadoId,
      estadoSlug: STATUS_SLUG_MAP[numericEstadoId] ?? 'desconocido',
      deletedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    closeAddDialog()
  }

  return (
    <EntityFormDialog
      open={addDialogOpen}
      onOpenChange={(open) => !open && closeAddDialog()}
      title='Agregar Artista'
    >
      {addDialogOpen && (
        <AddArtistFormContent onApply={handleApply} onCancel={closeAddDialog} />
      )}
    </EntityFormDialog>
  )
}
