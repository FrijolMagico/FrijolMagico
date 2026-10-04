import { CatalogPanel } from './CatalogPanel'
import { getCatalogData } from '../lib/getCatalogData'

export async function CatalogPanelServer() {
  const { data, error } = await getCatalogData()
  if (error) return null

  return <CatalogPanel catalogData={data} />
}
