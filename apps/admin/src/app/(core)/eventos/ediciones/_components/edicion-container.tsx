'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/shared/components/ui/button'
import { buildAdminListUrl } from '@/shared/lib/admin-list-url'
import { EdicionFilters } from './edicion-filters'
import { EdicionTable } from './edicion-table'
import { EdicionPagination } from './edicion-pagination'
import { EdicionDialog } from './edicion-dialog'
import { useEdicionDialog } from '../_store/edicion-dialog-store'
import { IconPlus } from '@tabler/icons-react'
import type { EdicionEntry, EdicionDiaEntry, LugarEntry } from '../_types'
import type { PaginatedEdicion } from '../_types/paginated-edicion'
import type { EventoEntry } from '../../_types'
import type { EdicionListQueryFilters } from '@/shared/types/admin-list-filters'
import type {
  ListQueryParams,
  PaginatedResponse
} from '@/shared/types/pagination'

interface EdicionContainerProps {
  ediciones: PaginatedEdicion[]
  dias: EdicionDiaEntry[]
  lugares: LugarEntry[]
  eventos: EventoEntry[]
  pagination: PaginatedResponse<PaginatedEdicion>
  query: ListQueryParams<EdicionListQueryFilters>
}

export function EdicionContainer({
  ediciones,
  dias,
  lugares,
  eventos,
  pagination,
  query
}: EdicionContainerProps) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const openDialog = useEdicionDialog((state) => state.openDialog)

  const filters = {
    search: query.search,
    eventoId: query.filters.eventoId ?? null
  }

  const replaceListUrl = (nextUrl: string) => {
    router.replace(`${pathname}${nextUrl}`, { scroll: false })
  }

  const handleSearchChange = (search: string) => {
    replaceListUrl(buildAdminListUrl(searchParams, { page: 1, search }))
  }

  const handleEventoChange = (eventoId: string | null) => {
    replaceListUrl(
      buildAdminListUrl(searchParams, {
        page: 1,
        filters: { eventoId }
      })
    )
  }

  const handleClearFilters = () => {
    replaceListUrl(
      buildAdminListUrl(searchParams, {
        page: 1,
        search: '',
        filters: { eventoId: null }
      })
    )
  }

  const handlePageChange = (page: number) => {
    replaceListUrl(buildAdminListUrl(searchParams, { page }))
  }

  return (
    <div className='space-y-4'>
      <div className='flex justify-end'>
        <Button variant='outline' size='sm' onClick={() => openDialog(null)}>
          <IconPlus />
          Agregar Edición
        </Button>
      </div>
      <EdicionFilters
        eventos={eventos}
        filters={filters}
        onSearchChange={handleSearchChange}
        onEventoChange={handleEventoChange}
        onClearFilters={handleClearFilters}
      />
      <EdicionTable
        ediciones={ediciones}
        dias={dias}
        lugares={lugares}
        eventos={eventos}
        onClearFilters={handleClearFilters}
      />
      <EdicionPagination
        page={pagination.page}
        pageSize={pagination.pageSize}
        totalItems={pagination.total}
        onPageChange={handlePageChange}
      />
      <EdicionDialog
        ediciones={ediciones as EdicionEntry[]}
        dias={dias}
        lugares={lugares}
        eventos={eventos}
      />
    </div>
  )
}
