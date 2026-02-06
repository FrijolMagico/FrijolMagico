'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2 } from 'lucide-react'
import { EditableTextField } from './EditableTextField'
import { EditableRichTextField } from '@/app/(admin)/_components/tiptap'
import { useOrganizacionForm } from '../_hooks/useOrganizacionForm'

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
      <CardContent className='space-y-6'>
        <EditableTextField
          label='Nombre de la Organización'
          field='nombre'
          value={formData.nombre}
          onChange={setField}
          placeholder='Frijol Mágico'
        />

        <EditableRichTextField
          label='Descripción'
          value={formData.descripcion}
          onChange={(value) => setField('descripcion', value)}
          placeholder='Describe la organización...'
          minHeight='120px'
        />
        <EditableRichTextField
          label='Misión'
          value={formData.mision}
          onChange={(value) => setField('mision', value)}
          placeholder='Nuestra misión es...'
        />

        <EditableRichTextField
          label='Visión'
          value={formData.vision}
          onChange={(value) => setField('vision', value)}
          placeholder='Nuestra visión es...'
        />
      </CardContent>
    </Card>
  )
}
