'use client'

import { IconPlus } from '@tabler/icons-react'
import { useQueryStates } from 'nuqs'
import { Button } from '@/shared/components/ui/button'
import { PaginationControls } from '@/shared/components/pagination-controls'
import type { PaginatedResponse } from '@/shared/types/pagination'
import type { EditionDay, Place } from '../_schemas/edicion.schema'
import { edicionSearchParams } from '../_lib/search-params'
import type { PaginatedEdition } from '../_types/paginated-edition'
import type { EventoLookup } from '../_types'
import { EdicionDialog } from './edicion-dialog'
import { EdicionFilters } from './edicion-filters'
import { EdicionTable } from './edicion-table'
import { useEdicionDialog } from '../_store/edicion-dialog-store'

interface EdicionContainerProps {
  ediciones: PaginatedEdition[]
  dias: EditionDay[]
  lugares: Place[]
  eventos: EventoLookup[]
  pagination: PaginatedResponse<PaginatedEdition>
}

export function EdicionContainer({
  ediciones,
  dias,
  lugares,
  eventos,
  pagination
}: EdicionContainerProps) {
  const [filters, setFilters] = useQueryStates(edicionSearchParams, {
    shallow: false
  })
  const openDialog = useEdicionDialog((state) => state.openDialog)

  const handleSearchChange = (search: string) => {
    void setFilters({ page: 1, search })
  }

  const handleEventoChange = (evento: number | null) => {
    void setFilters({ page: 1, evento })
  }

  const handleClearFilters = () => {
    void setFilters({ page: 1, search: '', evento: null })
  }

  const handlePageChange = (page: number) => {
    void setFilters({ page })
  }

  return (
    <div className='space-y-4'>
      <div className='flex justify-end'>
        <EdicionFilters
          eventos={eventos}
          filters={filters}
          onSearchChange={handleSearchChange}
          onEventoChange={handleEventoChange}
          onClearFilters={handleClearFilters}
        />
        <Button variant='outline' size='sm' onClick={() => openDialog(null)}>
          <IconPlus />
          Agregar Edición
        </Button>
      </div>

      <PaginationControls
        {...pagination}
        onPageChange={handlePageChange}
        itemNoun='ediciones'
      />
      <EdicionTable
        ediciones={ediciones}
        dias={dias}
        lugares={lugares}
        eventos={eventos}
        onClearFilters={handleClearFilters}
      />

      <PaginationControls
        {...pagination}
        onPageChange={handlePageChange}
        itemNoun='ediciones'
      />

      <EdicionDialog
        ediciones={ediciones}
        dias={dias}
        lugares={lugares}
        eventos={eventos}
      />
    </div>
  )
}
