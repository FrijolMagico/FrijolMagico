import type { CatalogSearchPayload } from '../types/catalog-payloads'
import { CatalogSearchBar } from './CatalogSearchBar'
import { CatalogFilterBar } from './CatalogFilterBar'

export const CatalogSearchSection = ({
  filterOptions
}: {
  filterOptions: CatalogSearchPayload
}) => {
  return (
    <>
      <section className='flex w-full flex-col justify-center gap-4 pb-6 sm:flex-row'>
        <CatalogSearchBar />
        <CatalogFilterBar filterOptions={filterOptions} />
      </section>
    </>
  )
}
