'use client'

import { useRef } from 'react'
import type { Catalog } from '../_schemas/catalogo.schema'
import type { Artist } from '../../_schemas/artista.schema'
import { useCatalogPaginationStore } from '../_store/catalog-pagination-store'
import { useCatalogFilterStore } from '../_store/catalog-filter-store'
import { usePaginationUrlSync } from '@/shared/ui-state/pagination'
import {
  useFilterUrlSync,
  boolOrNullSerializer,
  stringSerializer
} from '@/shared/ui-state/filters/filter-url-sync'
import { CatalogFilters } from './catalog-filters'
import { CatalogTableContainer } from './catalog-table-container'
import { AddCatalogDialog } from './add-catalog-dialog'
import { EditCatalogDialog } from './edit-catalog-dialog'

interface CatalogContainerProps {
  catalog: Catalog[]
  artists: Artist[]
}

export function CatalogContainer({ catalog, artists }: CatalogContainerProps) {
  usePaginationUrlSync(useCatalogPaginationStore, {
    pageParam: 'page',
    pageSizeParam: 'pageSize',
    defaultPageSize: 20
  })

  useFilterUrlSync(useCatalogFilterStore, {
    params: {
      activo: { paramName: 'activo', serializer: boolOrNullSerializer },
      destacado: { paramName: 'destacado', serializer: boolOrNullSerializer },
      search: { paramName: 'search', serializer: stringSerializer }
    }
  })

  return (
    <div className='grid space-y-4'>
      <div className='flex items-center justify-between'>
        <CatalogFilters />
        <AddCatalogDialog artists={artists} />
      </div>

      <CatalogTableContainer catalog={catalog} artists={artists} />

      <EditCatalogDialog />
    </div>
  )
}
