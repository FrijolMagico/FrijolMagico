'use client'

import { create } from 'zustand'
import { generateKeyBetween } from 'fractional-indexing'
import type {
  CatalogoArtista,
  CatalogoEntryFormData,
  ArtistaFormData,
  PaginatedResult,
  CatalogoFilters,
  PendingChanges
} from '../_types/catalogo'

// Draft manager instances (will be set by components)
let catalogoDraftManager: { clear: () => void } | null = null
let artistaDraftManager: { clear: () => void } | null = null

export function setCatalogoDraftManager(manager: { clear: () => void }) {
  catalogoDraftManager = manager
}

export function setArtistaDraftManager(manager: { clear: () => void }) {
  artistaDraftManager = manager
}

interface CatalogoFormState {
  // Lista
  artistas: CatalogoArtista[]
  originalArtistas: CatalogoArtista[] | null
  page: number
  totalPages: number
  filters: CatalogoFilters

  // Drag & Drop
  isDragging: boolean
  draggedArtistaId: number | null

  // Pending changes (for batch save)
  pendingChanges: PendingChanges

  // Dialogs (stacked)
  catalogoDialogOpen: boolean
  artistaDialogOpen: boolean
  selectedArtista: CatalogoArtista | null

  // Forms
  catalogoFormData: CatalogoEntryFormData | null
  artistaFormData: ArtistaFormData | null
  isDirty: boolean
  isSaving: boolean
  shouldPersist: boolean

  // Actions - Lista
  initializeList: (data: PaginatedResult<CatalogoArtista>) => void
  setPage: (page: number) => void
  setFilters: (filters: Partial<CatalogoFilters>) => void
  updateArtistaInList: (artistaId: number, updates: Partial<CatalogoArtista>) => void

  // Actions - Drag & Drop
  startDrag: (artistaId: number) => void
  endDrag: () => void
  reorderArtistas: (newOrder: CatalogoArtista[], draggedArtistaId?: number) => void

  // Actions - Toggles (local only, tracked in pending)
  toggleField: (
    artistaId: number,
    field: 'destacado' | 'activo',
    value: boolean
  ) => void

  // Actions - Check if can edit
  canEdit: () => boolean
  getPendingChangesCount: () => number

  // Actions - Dialogs
  openCatalogoDialog: (artista: CatalogoArtista) => void
  openArtistaDialog: () => void
  closeArtistaDialog: () => void
  closeAllDialogs: () => void

  // Actions - Forms
  updateCatalogoField: <K extends keyof CatalogoEntryFormData>(
    field: K,
    value: CatalogoEntryFormData[K]
  ) => void
  updateArtistaField: <K extends keyof ArtistaFormData>(
    field: K,
    value: ArtistaFormData[K]
  ) => void
  markAsSaving: () => void
  markAsSaved: () => void
  resetToOriginal: () => void
  restoreDraft: (type: 'catalogo' | 'artista' | 'list', data: unknown) => void
  clearCatalogoDraft: () => void
  clearArtistaDraft: () => void
  clearListDraft: () => void
}

// Default form data creators (for future use)
// const createDefaultCatalogoFormData = (): CatalogoEntryFormData => ({
//   destacado: false,
//   activo: true,
//   descripcion: ''
// })

// const createDefaultArtistaFormData = (): ArtistaFormData => ({
//   nombre: '',
//   pseudonimo: '',
//   correo: '',
//   rrss: '',
//   ciudad: '',
//   pais: ''
// })

export const useCatalogoForm = create<CatalogoFormState>((set, get) => ({
  // Initial state
  artistas: [],
  originalArtistas: null,
  page: 1,
  totalPages: 1,
  filters: { activo: null, destacado: null, search: '' },
  isDragging: false,
  draggedArtistaId: null,
  pendingChanges: { reorders: [], toggles: [] },
  catalogoDialogOpen: false,
  artistaDialogOpen: false,
  selectedArtista: null,
  catalogoFormData: null,
  artistaFormData: null,
  isDirty: false,
  isSaving: false,
  shouldPersist: true,

  // Lista
  initializeList: (data) => {
    set({
      artistas: data.data,
      originalArtistas: data.data,
      page: data.page,
      totalPages: data.totalPages,
      pendingChanges: { reorders: [], toggles: [] },
      isDirty: false,
      isSaving: false
    })
  },

  setPage: (page) => {
    set({ page })
  },

  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
      page: 1 // Reset to first page when filters change
    }))
  },

  updateArtistaInList: (artistaId, updates) => {
    set((state) => ({
      artistas: state.artistas.map((a) =>
        a.artistaId === artistaId ? { ...a, ...updates } : a
      )
    }))
  },

  // Drag & Drop
  startDrag: (artistaId) => {
    set({
      isDragging: true,
      draggedArtistaId: artistaId
    })
  },

  endDrag: () => {
    set({
      isDragging: false,
      draggedArtistaId: null
    })
  },

  reorderArtistas: (newOrder, draggedArtistaId?: number) => {
    set((state) => {
      if (!state.originalArtistas || !draggedArtistaId) return state

      // Create map for efficient lookup
      const originalById = new Map(state.originalArtistas.map(a => [a.artistaId, a]))

      // Find the dragged item in the new order
      const draggedNewIndex = newOrder.findIndex(item => item.artistaId === draggedArtistaId)
      if (draggedNewIndex === -1) return state

      const draggedItem = newOrder[draggedNewIndex]
      
      // Get the CURRENT item from state.artistas (includes previous changes), not original
      const currentDraggedItem = state.artistas.find(a => a.artistaId === draggedArtistaId)
      const currentOrder = currentDraggedItem?.orden ?? originalById.get(draggedArtistaId)?.orden ?? ''
      
      if (!currentDraggedItem && !originalById.has(draggedArtistaId)) return state

      // Get the neighbors in the NEW order
      const prevItem = newOrder[draggedNewIndex - 1]
      const nextItem = newOrder[draggedNewIndex + 1]
      
      // Get their CURRENT order values from newOrder (which includes accumulated changes)
      const prevOrder = prevItem?.orden ?? null
      const nextOrder = nextItem?.orden ?? null
      
      // Debug logging
      console.log('Reorder debug:', {
        draggedArtistaId,
        draggedNewIndex,
        currentOrder,
        prevOrder,
        nextOrder,
        prevItem: prevItem?.artistaId,
        nextItem: nextItem?.artistaId
      })
      
      // Generate new key between neighbors for the dragged item only
      let newOrden: string
      try {
        newOrden = generateKeyBetween(prevOrder, nextOrder)
        console.log('Generated key:', newOrden, 'between', prevOrder, 'and', nextOrder)
      } catch (e) {
        console.error('Error generating key between', prevOrder, 'and', nextOrder, e)
        // Fallback: if moving to first position, use a key that comes before the next item
        if (!prevOrder && nextOrder) {
          newOrden = nextOrder + 'Z'
        } else if (prevOrder && !nextOrder) {
          newOrden = prevOrder + 'm'
        } else {
          newOrden = 'a0'
        }
      }
      
      // Only add to reorders if the order actually changed from CURRENT value
      const orderChanged = newOrden !== currentOrder
      
      if (!orderChanged) {
        return state
      }

      // Build the reorders list with only the dragged item
      const reorders = [...state.pendingChanges.reorders]
      
      // Remove any existing reorder for this artistaId
      const existingIndex = reorders.findIndex(r => r.artistaId === draggedArtistaId)
      if (existingIndex !== -1) {
        reorders.splice(existingIndex, 1)
      }
      
      // Add the new reorder
      reorders.push({ artistaId: draggedArtistaId, newOrden })

      // Build updated artistas list - only update the dragged item
      const updatedArtistas = newOrder.map(item => {
        if (item.artistaId === draggedArtistaId) {
          return { ...item, orden: newOrden }
        }
        return item
      })

      return {
        artistas: updatedArtistas,
        pendingChanges: {
          ...state.pendingChanges,
          reorders
        },
        isDirty: reorders.length > 0 || state.pendingChanges.toggles.length > 0
      }
    })
  },

  // Toggle field locally (tracked in pending)
  toggleField: (artistaId, field, value) => {
    set((state) => {
      // Update local state
      const newArtistas = state.artistas.map((a) =>
        a.artistaId === artistaId ? { ...a, [field]: value } : a
      )

      // Track in pending changes (remove duplicate toggles for same artista/field)
      const otherToggles = state.pendingChanges.toggles.filter(
        (t) => !(t.artistaId === artistaId && t.field === field)
      )

      const newToggles = [...otherToggles, { artistaId, field, value }]

      return {
        artistas: newArtistas,
        pendingChanges: {
          ...state.pendingChanges,
          toggles: newToggles
        },
        isDirty:
          newToggles.length > 0 || state.pendingChanges.reorders.length > 0
      }
    })
  },

  // Check if can edit (no pending changes)
  canEdit: () => {
    const state = get()
    return (
      state.pendingChanges.reorders.length === 0 &&
      state.pendingChanges.toggles.length === 0
    )
  },

  // Get count of pending changes
  getPendingChangesCount: () => {
    const state = get()
    return (
      state.pendingChanges.reorders.length +
      state.pendingChanges.toggles.length
    )
  },

  // Dialogs
  openCatalogoDialog: (artista) => {
    set({
      selectedArtista: artista,
      catalogoFormData: {
        destacado: artista.destacado,
        activo: artista.activo,
        descripcion: artista.descripcion || ''
      },
      artistaFormData: {
        nombre: artista.nombre || '',
        pseudonimo: artista.pseudonimo,
        correo: artista.correo || '',
        rrss: artista.rrss || '',
        ciudad: artista.ciudad || '',
        pais: artista.pais || ''
      },
      catalogoDialogOpen: true,
      artistaDialogOpen: false,
      isDirty: false,
      shouldPersist: true
    })
  },

  openArtistaDialog: () => {
    set({ artistaDialogOpen: true })
  },

  closeArtistaDialog: () => {
    set({ artistaDialogOpen: false })
  },

  closeAllDialogs: () => {
    set({
      catalogoDialogOpen: false,
      artistaDialogOpen: false,
      selectedArtista: null,
      catalogoFormData: null,
      artistaFormData: null,
      isDirty: false,
      shouldPersist: true
    })
  },

  // Forms
  updateCatalogoField: (field, value) => {
    set((state) => ({
      catalogoFormData: state.catalogoFormData
        ? { ...state.catalogoFormData, [field]: value }
        : null,
      isDirty: true
    }))
  },

  updateArtistaField: (field, value) => {
    set((state) => ({
      artistaFormData: state.artistaFormData
        ? { ...state.artistaFormData, [field]: value }
        : null,
      isDirty: true
    }))
  },

  markAsSaving: () => {
    set({ isSaving: true, shouldPersist: false })
  },

  markAsSaved: () => {
    const state = get()
    set({
      isDirty: false,
      isSaving: false,
      shouldPersist: true,
      originalArtistas: state.artistas,
      pendingChanges: { reorders: [], toggles: [] }
    })

    // Update selected artista with new data if exists
    if (state.selectedArtista && state.catalogoFormData) {
      set((s) => ({
        selectedArtista: s.selectedArtista
          ? {
              ...s.selectedArtista,
              destacado: state.catalogoFormData!.destacado,
              activo: state.catalogoFormData!.activo,
              descripcion: state.catalogoFormData!.descripcion
            }
          : null
      }))
    }
  },

  resetToOriginal: () => {
    const state = get()
    if (state.originalArtistas) {
      set({
        artistas: state.originalArtistas,
        pendingChanges: { reorders: [], toggles: [] },
        isDirty: false
      })
    }
  },

  restoreDraft: (type, data) => {
    if (type === 'catalogo') {
      set({
        catalogoFormData: data as CatalogoEntryFormData,
        isDirty: true
      })
    } else if (type === 'artista') {
      set({
        artistaFormData: data as ArtistaFormData,
        isDirty: true
      })
    } else if (type === 'list') {
      const listData = data as {
        artistas: CatalogoArtista[]
        pendingChanges: PendingChanges
      }
      set({
        artistas: listData.artistas,
        pendingChanges: listData.pendingChanges,
        isDirty:
          listData.pendingChanges.reorders.length > 0 ||
          listData.pendingChanges.toggles.length > 0
      })
    }
  },

  clearCatalogoDraft: () => {
    if (catalogoDraftManager) {
      catalogoDraftManager.clear()
    }
  },

  clearArtistaDraft: () => {
    if (artistaDraftManager) {
      artistaDraftManager.clear()
    }
  },

  clearListDraft: () => {
    // Clear list draft from localStorage
    try {
      localStorage.removeItem('admin:draft:catalogo-list')
    } catch {
      // Ignore errors
    }
  }
}))
