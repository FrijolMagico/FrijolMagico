import { ErrorSection } from '@/components/ErrorSection'
import { projectCatalogList } from '../application/catalog-payloads'
import { CatalogList } from './CatalogList'
import { getCatalogData } from '../lib/getCatalogData'

export async function CatalogListServer() {
  const { data, error } = await getCatalogData()
  if (error) return <ErrorSection error={error.message} />

  return <CatalogList catalog={projectCatalogList(data)} />
}
