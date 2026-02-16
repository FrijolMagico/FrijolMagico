import { Building2 } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/shared/components/ui/card'
import { getOrganizationData } from '../_lib/get-general-data'
import { OrganizationForm } from './organization-form'

export async function OrganizationSection() {
  const organization = await getOrganizationData()

  if (!organization) {
    return (
      <p className='text-muted-foreground text-sm'>
        No se pudo cargar la información de la organización.
      </p>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Building2 className='h-5 w-5' />
          Información General
        </CardTitle>
      </CardHeader>

      <CardContent className='space-y-6'>
        <OrganizationForm initialData={organization} />
      </CardContent>
    </Card>
  )
}
