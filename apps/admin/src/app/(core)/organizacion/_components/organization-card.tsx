'use client'

import { useTransition } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { OrganizationForm } from './organization-form'
import { IconSeedingFilled, IconUpload } from '@tabler/icons-react'
import { updateOrganization } from '../_actions/organization.action'
import {
  type Organization,
  type OrganizationFormInput,
  organizationFormSchema
} from '../_schemas/organizacion.schema'
import { toast } from 'sonner'
import { Badge } from '@/shared/components/ui/badge'
import { ORGANIZATION_FORM_ID } from '../_constants'

interface OrganizationCardProps {
  initialData: Organization
}

export function OrganizationCard({ initialData }: OrganizationCardProps) {
  const [loading, startTransition] = useTransition()

  const methods = useForm<OrganizationFormInput>({
    resolver: zodResolver(organizationFormSchema),
    mode: 'onChange',
    defaultValues: {
      nombre: initialData.nombre ?? '',
      descripcion: initialData.descripcion ?? '',
      mision: initialData.mision ?? '',
      vision: initialData.vision ?? ''
    }
  })

  const {
    formState: { isDirty, isValid },
    reset
  } = methods

  const onSubmit = (formData: OrganizationFormInput) => {
    startTransition(async () => {
      const { success, errors, data } = await updateOrganization(
        {
          success: false
        },
        formData
      )

      if (!success) {
        toast.error(
          errors
            ? errors.map((e) => e.message).join(', ')
            : 'Error al actualizar la organización'
        )
        return
      }

      reset({
        nombre: data?.nombre ?? '',
        descripcion: data?.descripcion ?? '',
        mision: data?.mision ?? '',
        vision: data?.vision ?? ''
      })

      toast.success('Organización actualizada correctamente')
    })
  }

  return (
    <FormProvider {...methods}>
      <Card>
        <CardHeader className='flex flex-row items-center justify-between'>
          <CardTitle className='flex items-center gap-2'>
            <IconSeedingFilled />
            Información General
            {isDirty && (
              <Badge variant='outline' className='ml-2'>
                Sin guardar
              </Badge>
            )}
          </CardTitle>

          <Button
            type='submit'
            form={ORGANIZATION_FORM_ID}
            disabled={!isDirty || loading || !isValid}
          >
            <IconUpload />
            {loading ? 'Guardando...' : 'Guardar'}
          </Button>
        </CardHeader>

        <CardContent className='space-y-6'>
          <OrganizationForm
            id={ORGANIZATION_FORM_ID}
            onSubmit={methods.handleSubmit(onSubmit)}
          />
        </CardContent>
      </Card>
    </FormProvider>
  )
}
