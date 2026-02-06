'use client'

import { useEffect, useCallback, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CatalogoFilters } from './CatalogoFilters'
import { CatalogoTable } from './CatalogoTable'
import { CatalogoPagination } from './CatalogoPagination'
import { EditCatalogoDialog } from './EditCatalogoDialog'
import { EditArtistaDialog } from './EditArtistaDialog'
import {
  EmptyState,
  SaveButton,
  DraftNotification
} from '@/app/(admin)/_components/admin'
import {
  useCatalogoForm,
  setCatalogoDraftManager,
  setArtistaDraftManager
} from '../_hooks/useCatalogoForm'
import { createDraftManager } from '@/app/(admin)/_lib/draft'
import { saveCatalogoChanges } from '../actions/catalogo.actions'
import { toast } from 'sonner'
import type {
  CatalogoArtista,
  PaginatedResult,
  CatalogoListFormData
} from '../_types/catalogo'

interface CatalogoArtistasContainerProps {
  initialData: PaginatedResult<CatalogoArtista>
}

const LIST_DRAFT_KEY = 'admin:draft:catalogo-list'
const CATALOG_DRAFT_KEY = 'admin:draft:catalogo'
const ARTISTA_DRAFT_KEY = 'admin:draft:artista'

export function CatalogoArtistasContainer({
  initialData
}: CatalogoArtistasContainerProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const initializeList = useCatalogoForm((state) => state.initializeList)
  const artistas = useCatalogoForm((state) => state.artistas)
  // const originalArtistas = useCatalogoForm((state) => state.originalArtistas)
  // const page = useCatalogoForm((state) => state.page)
  // const filters = useCatalogoForm((state) => state.filters)
  const pendingChanges = useCatalogoForm((state) => state.pendingChanges)
  const isDirty = useCatalogoForm((state) => state.isDirty)
  const isSaving = useCatalogoForm((state) => state.isSaving)
  const catalogoDialogOpen = useCatalogoForm(
    (state) => state.catalogoDialogOpen
  )
  const artistaDialogOpen = useCatalogoForm((state) => state.artistaDialogOpen)
  const selectedArtista = useCatalogoForm((state) => state.selectedArtista)
  const openCatalogoDialog = useCatalogoForm(
    (state) => state.openCatalogoDialog
  )
  const setPage = useCatalogoForm((state) => state.setPage)
  const setFilters = useCatalogoForm((state) => state.setFilters)
  const markAsSaving = useCatalogoForm((state) => state.markAsSaving)
  const markAsSaved = useCatalogoForm((state) => state.markAsSaved)
  // const resetToOriginal = useCatalogoForm((state) => state.resetToOriginal)
  const restoreDraft = useCatalogoForm((state) => state.restoreDraft)
  const clearListDraft = useCatalogoForm((state) => state.clearListDraft)

  const [hasDraftNotification, setHasDraftNotification] = useState(false)

  // Initialize with server data
  useEffect(() => {
    initializeList(initialData)
  }, [initialData, initializeList])

  // Check for existing list draft on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedDraft = localStorage.getItem(LIST_DRAFT_KEY)
        if (savedDraft) {
          const draft = JSON.parse(savedDraft) as {
            data: CatalogoListFormData
            updatedAt: string
          }
          if (draft.data && draft.updatedAt) {
            setHasDraftNotification(true)
          }
        }
      } catch {
        // Ignore parse errors
      }
    }
  }, [])

  // Create list draft manager
  const listDraftManager = useMemo(() => {
    return createDraftManager(
      LIST_DRAFT_KEY,
      useCatalogoForm,
      (state) => ({
        artistas: state.artistas,
        pendingChanges: state.pendingChanges
      }),
      (state) =>
        state.isDirty &&
        state.shouldPersist &&
        (state.pendingChanges.reorders.length > 0 ||
          state.pendingChanges.toggles.length > 0),
      1500
    )
  }, [])

  // Setup list draft manager
  useEffect(() => {
    const cleanup = listDraftManager.start()
    return cleanup
  }, [listDraftManager])

  // Handle URL sync
  const handleFiltersChange = useCallback(
    (newFilters: {
      activo?: boolean
      destacado?: boolean
      search?: string
    }) => {
      const params = new URLSearchParams(searchParams.toString())

      if (newFilters.activo !== undefined) {
        params.set('activo', String(newFilters.activo))
      } else {
        params.delete('activo')
      }

      if (newFilters.destacado !== undefined) {
        params.set('destacado', String(newFilters.destacado))
      } else {
        params.delete('destacado')
      }

      if (newFilters.search) {
        params.set('search', newFilters.search)
      } else {
        params.delete('search')
      }

      router.push(`?${params.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage)
      const params = new URLSearchParams(searchParams.toString())
      params.set('page', String(newPage))
      router.push(`?${params.toString()}`, { scroll: false })
    },
    [router, searchParams, setPage]
  )

  // Handle save all changes
  const handleSave = useCallback(async () => {
    if (
      !isDirty ||
      (pendingChanges.reorders.length === 0 &&
        pendingChanges.toggles.length === 0)
    ) {
      toast.info('No hay cambios para guardar')
      return
    }

    markAsSaving()

    try {
      const result = await saveCatalogoChanges(pendingChanges)

      if (result.success) {
        markAsSaved()
        clearListDraft()
        listDraftManager.clear()
        setHasDraftNotification(false)
        toast.success('Cambios guardados correctamente')
      } else {
        throw new Error(result.error || 'Error al guardar')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al guardar')
      throw error
    }
  }, [
    isDirty,
    pendingChanges,
    markAsSaving,
    markAsSaved,
    clearListDraft,
    listDraftManager
  ])

  // Handle restore draft
  const handleRestoreDraft = useCallback(() => {
    const draft = listDraftManager.getDraft()
    if (draft?.data) {
      restoreDraft('list', draft.data)
      setHasDraftNotification(false)
      toast.success('Borrador restaurado')
    }
  }, [listDraftManager, restoreDraft])

  // Handle dismiss draft
  const handleDismissDraft = useCallback(() => {
    listDraftManager.clear()
    setHasDraftNotification(false)
  }, [listDraftManager])

  // Draft managers for dialogs
  const catalogoDraftManager = useMemo(() => {
    if (!selectedArtista) return null
    return createDraftManager(
      `${CATALOG_DRAFT_KEY}:${selectedArtista.artistaId}`,
      useCatalogoForm,
      (state) => state.catalogoFormData,
      (state) =>
        state.isDirty && state.shouldPersist && !!state.catalogoFormData,
      1500
    )
  }, [selectedArtista])

  const artistaDraftManager = useMemo(() => {
    if (!selectedArtista) return null
    return createDraftManager(
      `${ARTISTA_DRAFT_KEY}:${selectedArtista.artistaId}`,
      useCatalogoForm,
      (state) => state.artistaFormData,
      (state) =>
        state.isDirty && state.shouldPersist && !!state.artistaFormData,
      1500
    )
  }, [selectedArtista])

  // Setup dialog draft managers
  useEffect(() => {
    if (catalogoDraftManager) {
      setCatalogoDraftManager(catalogoDraftManager)
      const cleanup = catalogoDraftManager.start()
      return cleanup
    }
  }, [catalogoDraftManager])

  useEffect(() => {
    if (artistaDraftManager) {
      setArtistaDraftManager(artistaDraftManager)
      const cleanup = artistaDraftManager.start()
      return cleanup
    }
  }, [artistaDraftManager])

  const handleEdit = useCallback(
    (artista: CatalogoArtista) => {
      openCatalogoDialog(artista)
    },
    [openCatalogoDialog]
  )

  if (artistas.length === 0) {
    return (
      <div className='space-y-4'>
        <CatalogoFilters onFiltersChange={handleFiltersChange} />
        <EmptyState
          title='No se encontraron artistas'
          description='No hay artistas que coincidan con los filtros seleccionados.'
          action={{
            label: 'Limpiar filtros',
            onClick: () => {
              setFilters({ activo: null, destacado: null, search: '' })
              handleFiltersChange({})
            }
          }}
        />
      </div>
    )
  }

  return (
    <div className='space-y-4'>
      {hasDraftNotification && (
        <DraftNotification
          title='Borrador guardado'
          message='Tienes cambios sin guardar de una sesión anterior (órdenes o estados modificados). ¿Deseas restaurarlos?'
          onRestore={handleRestoreDraft}
          onDismiss={handleDismissDraft}
        />
      )}

      <CatalogoFilters onFiltersChange={handleFiltersChange} />

      <div className='rounded-md border bg-white'>
        <CatalogoTable onEdit={handleEdit} />
      </div>

      <CatalogoPagination onPageChange={handlePageChange} />

      {/* Sticky Save Button */}
      {isDirty && (
        <div className='sticky bottom-6 flex justify-end'>
          <div className='rounded-lg border bg-white p-4 shadow-lg'>
            <SaveButton
              onSave={handleSave}
              isDirty={isDirty}
              isSaving={isSaving}
            />
          </div>
        </div>
      )}

      {/* Dialog Nivel 1: Catálogo */}
      <EditCatalogoDialog open={catalogoDialogOpen} />

      {/* Dialog Nivel 2: Artista (stacked) */}
      <EditArtistaDialog open={artistaDialogOpen} />
    </div>
  )
}
