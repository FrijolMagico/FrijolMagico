'use client'

import { Button } from '@/shared/components/ui/button'
import { EdicionFilters } from './edicion-filters'
import { EdicionTable } from './edicion-table'
import { EdicionPagination } from './edicion-pagination'
import { EdicionDialog } from './edicion-dialog'
import { EdicionSaveBar } from './edicion-save-bar'
import { useEdicionDialog } from '../_store/edicion-dialog-store'
import { Plus } from 'lucide-react'

export function EdicionContainer() {
  const openDialog = useEdicionDialog((state) => state.openDialog)

  return (
    <div className='space-y-4'>
      <div className='flex justify-end'>
        <Button variant='outline' size='sm' onClick={() => openDialog(null)}>
          <Plus />
          Agregar Edición
        </Button>
      </div>
      <EdicionFilters />
      <EdicionTable />
      <EdicionPagination />
      <EdicionDialog />
      <EdicionSaveBar />
    </div>
  )
}
