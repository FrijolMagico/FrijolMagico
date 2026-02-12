import { OrganizationForm } from './organization-form'
import { getOrganizationData } from '../_lib/get-general-data'

export async function OrganizationContent() {
  const organization = await getOrganizationData()

  if (!organization) {
    return (
      <p className='text-muted-foreground text-sm'>
        No se pudo cargar la información de la organización.
      </p>
    )
  }

  return <OrganizationForm initialData={organization} />
}
