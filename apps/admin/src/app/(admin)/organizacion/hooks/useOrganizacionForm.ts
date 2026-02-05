'use client'

import { create } from 'zustand'
import type {
  OrganizacionFormData,
  OrganizacionEquipoFormData
} from '../types/organizacion'

// Import draft manager singleton (imported after store creation to avoid circular dependency)
let draftManagerInstance: { clear: () => void } | null = null

/**
 * Set the draft manager instance for this store
 * Called by OrganizacionForm after creating the draft manager
 */
export function setDraftManagerInstance(manager: { clear: () => void }) {
  draftManagerInstance = manager
}

interface OrganizacionFormState {
  // Form data
  formData: OrganizacionFormData
  originalData: OrganizacionFormData | null

  // UI state
  isDirty: boolean
  isSaving: boolean
  lastSaved: string | null

  // Draft persistence control
  shouldPersist: boolean

  // Actions
  initializeForm: (data: OrganizacionFormData) => void
  setField: <K extends keyof OrganizacionFormData>(
    field: K,
    value: OrganizacionFormData[K]
  ) => void
  addEquipoMember: () => void
  updateEquipoMember: (
    index: number,
    field: keyof OrganizacionEquipoFormData,
    value: string
  ) => void
  removeEquipoMember: (index: number) => void
  markAsSaving: () => void
  markAsSaved: () => void
  resetForm: () => void
  hasUnsavedChanges: () => boolean
  restoreDraft: (draft: OrganizacionFormData) => void
  clearDraft: () => void
}

const createDefaultFormData: OrganizacionFormData = {
  nombre: '',
  descripcion: '',
  mision: '',
  vision: '',
  equipo: []
}

export const useOrganizacionForm = create<OrganizacionFormState>(
  (set, get) => ({
    formData: createDefaultFormData,
    originalData: null,
    isDirty: false,
    isSaving: false,
    lastSaved: null,
    shouldPersist: true,

    initializeForm: (data) => {
      set({
        formData: data,
        originalData: data,
        isDirty: false,
        isSaving: false
      })
    },

    setField: (field, value) => {
      set((state) => ({
        formData: { ...state.formData, [field]: value },
        isDirty: true
      }))
    },

    addEquipoMember: () => {
      set((state) => ({
        formData: {
          ...state.formData,
          equipo: [
            ...state.formData.equipo,
            {
              nombre: '',
              cargo: '',
              rrss: '',
              isNew: true
            }
          ]
        },
        isDirty: true
      }))
    },

    updateEquipoMember: (index, field, value) => {
      set((state) => {
        const newEquipo = [...state.formData.equipo]
        newEquipo[index] = { ...newEquipo[index], [field]: value }
        return {
          formData: { ...state.formData, equipo: newEquipo },
          isDirty: true
        }
      })
    },

    removeEquipoMember: (index) => {
      set((state) => {
        const member = state.formData.equipo[index]
        let newEquipo

        if (member.isNew) {
          // Remove new members completely
          newEquipo = state.formData.equipo.filter((_, i) => i !== index)
        } else {
          // Mark existing members as deleted
          newEquipo = state.formData.equipo.map((m, i) =>
            i === index ? { ...m, isDeleted: true } : m
          )
        }

        return {
          formData: { ...state.formData, equipo: newEquipo },
          isDirty: true
        }
      })
    },

    markAsSaving: () => {
      set({ isSaving: true, shouldPersist: false })
    },

    markAsSaved: () => {
      const currentFormData = get().formData
      set({
        originalData: currentFormData,
        isDirty: false,
        isSaving: false,
        shouldPersist: true,
        lastSaved: new Date().toISOString()
      })
    },

    resetForm: () => {
      const { originalData } = get()
      if (originalData) {
        set({
          formData: originalData,
          isDirty: false
        })
      }
    },

    hasUnsavedChanges: () => {
      const state = get()
      return state.isDirty
    },

    restoreDraft: (draft) => {
      set({
        formData: draft,
        isDirty: true
      })
    },

    clearDraft: () => {
      // Clear the draft from localStorage via the draft manager
      if (draftManagerInstance) {
        draftManagerInstance.clear()
      } else {
        console.warn(
          'Draft manager not initialized. Call from OrganizacionForm after mount.'
        )
      }
    }
  })
)
