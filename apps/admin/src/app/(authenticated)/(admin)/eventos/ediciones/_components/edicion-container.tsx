'use client'

import { Button } from '@/shared/components/ui/button'
import { EdicionFilters } from './edicion-filters'
import { EdicionTable } from './edicion-table'
import { EdicionPagination } from './edicion-pagination'
import { EdicionDialog } from './edicion-dialog'
import { useEdicionDialog } from '../_store/edicion-dialog-store'
import { IconPlus } from '@tabler/icons-react'
import type { EdicionEntry, EdicionDiaEntry, LugarEntry } from '../_types'
import type { EventoEntry } from '../../_types'
import { useEdicionList } from '../_hooks/use-edicion-list'

interface EdicionContainerProps {
  ediciones: EdicionEntry[]
  dias: EdicionDiaEntry[]
  lugares: LugarEntry[]
  eventos: EventoEntry[]
}

export function EdicionContainer({
  ediciones,
  dias,
  lugares,
  eventos
}: EdicionContainerProps) {
  const openDialog = useEdicionDialog((state) => state.openDialog)

  const { paginatedEdiciones, totalFilteredItems } = useEdicionList(
    ediciones,
    dias,
    eventos
  )

  return (
    <div className='space-y-4'>
      <div className='flex justify-end'>
        <Button variant='outline' size='sm' onClick={() => openDialog(null)}>
          <IconPlus />
          Agregar Edición
        </Button>
      </div>
      <EdicionFilters eventos={eventos} />
      <EdicionTable
        ediciones={paginatedEdiciones}
        dias={dias}
        lugares={lugares}
        eventos={eventos}
      />
      <EdicionPagination totalItems={totalFilteredItems} />
      <EdicionDialog
        ediciones={ediciones}
        dias={dias}
        lugares={lugares}
        eventos={eventos}
      />
    </div>
  )
}
