'use client'

import { PaginationControls } from '@/shared/components/pagination-controls'

interface EdicionPaginationProps {
  page: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
}

export function EdicionPagination({
  page,
  pageSize,
  totalItems,
  onPageChange
}: EdicionPaginationProps) {
  return (
    <PaginationControls
      page={page}
      pageSize={pageSize}
      totalItems={totalItems}
      onPageChange={onPageChange}
      itemNoun='ediciones'
    />
  )
}
