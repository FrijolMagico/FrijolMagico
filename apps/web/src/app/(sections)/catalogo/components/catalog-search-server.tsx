import { CatalogSearchSection } from './CatalogSearchSection'
import { getCatalogDataForRender } from '../lib/getCatalogData'
import { projectCatalogSearchOptions } from '../application/catalog-payloads'

export async function CatalogSearchServer() {
  const { data, error } = await getCatalogDataForRender()
  if (error) return null

  return (
    <CatalogSearchSection filterOptions={projectCatalogSearchOptions(data)} />
  )
}
