'use client'

import { useActionState } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { useFormFields } from '../_hooks/use-form-fields'
import { OrganizationForm } from './organization-form'
import type { Organization } from '../_types'
import { IconSeedingFilled, IconUpload } from '@tabler/icons-react'
import { updateOrganization } from '../_actions/organization.action'
import {
  OrganizationFormInput,
  organizationFormSchema
} from '../_schemas/organizacion.schema'
import { toast } from 'sonner'
import { Badge } from '@/shared/components/ui/badge'
import { ActionState } from '@/shared/types/actions'

const FORM_ID = 'org-form'

interface OrganizationCardProps {
  initialData: Organization
}

export function OrganizationCard({ initialData }: OrganizationCardProps) {
  const { fields, setField, isDirty, isValid, errors, reset } =
    useFormFields<OrganizationFormInput>(
      {
        nombre: initialData.nombre,
        descripcion: initialData.descripcion,
        mision: initialData.mision,
        vision: initialData.vision
      },
      {
        schema: organizationFormSchema
      }
    )

  const [, formAction, isPending] = useActionState(
    async (
      prevState: ActionState<OrganizationFormInput>,
      formData: FormData
    ) => {
      const result = await updateOrganization(prevState, formData)

      if (!result.success) {
        toast.error(
          result.errors
            ? result.errors.map((e) => e.message).join(', ')
            : 'Error al actualizar la organización'
        )
        return result
      }

      reset({
        nombre: result.data?.nombre ?? '',
        descripcion: result.data?.descripcion ?? '',
        mision: result.data?.mision ?? '',
        vision: result.data?.vision ?? ''
      })
      toast.success('Organización actualizada correctamente')
      return result
    },
    {
      success: false
    }
  )

  return (
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
          form={FORM_ID}
          disabled={!isDirty || isPending || !isValid}
        >
          <IconUpload />
          {isPending ? 'Guardando...' : 'Guardar'}
        </Button>
      </CardHeader>

      <CardContent className='space-y-6'>
        <OrganizationForm
          id={FORM_ID}
          fields={fields}
          setField={setField}
          errors={errors}
          formAction={formAction}
        />
      </CardContent>
    </Card>
  )
}
