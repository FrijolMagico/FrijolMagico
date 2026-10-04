import { ErrorSection } from '@/components/ErrorSection'
import { projectCatalogList } from '../application/catalog-payloads'
import { CatalogList } from './CatalogList'
import { getCatalogDataForRender } from '../lib/getCatalogData'

export async function CatalogListServer() {
  const { data, error } = await getCatalogDataForRender()
  if (error) return <ErrorSection error={error.message} />

  return <CatalogList catalog={projectCatalogList(data)} />
}
