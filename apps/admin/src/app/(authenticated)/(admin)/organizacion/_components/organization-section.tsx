import { getOrganizationData } from '../_lib/get-general-data'
import { OrganizationCard } from './organization-card'
import { EmptyState } from '@/shared/components/empty-state'

export async function OrganizationSection() {
  const organization = await getOrganizationData()

  if (!organization) {
    return (
      <EmptyState
        title='Error al cargar la organización'
        description='No se pudo cargar la información de la organización.'
        action={{
          label: 'Intentar otra vez',
          onClick: async () => await getOrganizationData()
        }}
      />
    )
  }

  return <OrganizationCard initialData={organization} />
}
