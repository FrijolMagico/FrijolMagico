import { CatalogPanel } from './CatalogPanel'
import { getCatalogDataForRender } from '../lib/getCatalogData'

export async function CatalogPanelServer() {
  const { data, error } = await getCatalogDataForRender()
  if (error) return null

  return <CatalogPanel catalogData={data} />
}
