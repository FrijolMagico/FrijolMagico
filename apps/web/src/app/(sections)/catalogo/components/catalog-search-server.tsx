import { CatalogSearchSection } from './CatalogSearchSection'
import { getCatalogData } from '../lib/getCatalogData'
import { projectCatalogSearchOptions } from '../application/catalog-payloads'

export async function CatalogSearchServer() {
  const { data, error } = await getCatalogData()
  if (error) return null

  return (
    <CatalogSearchSection filterOptions={projectCatalogSearchOptions(data)} />
  )
}
