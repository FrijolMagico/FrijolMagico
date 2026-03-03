'use client'

import { Button } from '@/shared/components/ui/button'
import { EdicionFilters } from './edicion-filters'
import { EdicionTable } from './edicion-table'
import { EdicionPagination } from './edicion-pagination'
import { EdicionDialog } from './edicion-dialog'
import { EdicionSaveBar } from './edicion-save-bar'
import { useEdicionDialog } from '../_store/edicion-dialog-store'

export function EdicionContainer() {
  return (
    <div className='space-y-4'>
      <div className='flex justify-end'>
        <Button onClick={() => useEdicionDialog.getState().openDialog(null)}>
          + Agregar Edición
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
