'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2 } from 'lucide-react'
import { EditableTextField } from './EditableTextField'
import { EditableRichTextField } from './EditableRichTextField'
import { useOrganizacionForm } from '../hooks/useOrganizacionForm'

export function OrganizacionInfoSection() {
  const formData = useOrganizacionForm((state) => state.formData)
  const setField = useOrganizacionForm((state) => state.setField)

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Building2 className='h-5 w-5' />
          Información General
        </CardTitle>
      </CardHeader>
      <CardContent className='grid grid-cols-2 grid-rows-2 gap-6'>
        <EditableTextField
          label='Nombre de la Organización'
          field='nombre'
          value={formData.nombre}
          onChange={setField}
          placeholder='Frijol Mágico'
        />

        <EditableRichTextField
          label='Descripción'
          field='descripcion'
          value={formData.descripcion}
          onChange={setField}
          placeholder='Describe la organización...'
          minHeight='120px'
        />

        <EditableRichTextField
          label='Misión'
          field='mision'
          value={formData.mision}
          onChange={setField}
          placeholder='Nuestra misión es...'
        />

        <EditableRichTextField
          label='Visión'
          field='vision'
          value={formData.vision}
          onChange={setField}
          placeholder='Nuestra visión es...'
        />
      </CardContent>
    </Card>
  )
}
