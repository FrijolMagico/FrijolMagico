import { revalidateTag } from 'next/cache'
import { redirect } from 'next/navigation'
import { getOrganizationData } from '../_lib/get-general-data'
import { OrganizationCard } from './organization-card'
import { EmptyState } from '@/shared/components/empty-state'
import { ORGANIZATION_CACHE_TAG } from '@frijolmagico/cache-tags'

async function retryOrganization() {
  'use server'
  revalidateTag(ORGANIZATION_CACHE_TAG, 'max')
  redirect('/organizacion')
}

export async function OrganizationSection() {
  const organization = await getOrganizationData()

  if (!organization) {
    return (
      <EmptyState
        title='Error al cargar la organización'
        description='No se pudo cargar la información de la organización.'
        action={{ label: 'Intentar otra vez', action: retryOrganization }}
      />
    )
  }

  return <OrganizationCard initialData={organization} />
}
