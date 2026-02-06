'use client'

import { useEffect, useCallback, useMemo, useState } from 'react'
import { OrganizacionInfoSection } from './OrganizacionInfoSection'
import { OrganizacionEquipoSection } from './OrganizacionEquipoSection'
import { SaveButton, DraftNotification } from '@/app/(admin)/_components/admin'
import {
  useOrganizacionForm,
  setDraftManagerInstance
} from '../_hooks/useOrganizacionForm'
import { createDraftManager } from '@/app/(admin)/_lib/draft'
import { useConfirmNavigation } from '@/hooks/useConfirmNavigation'
import { updateOrganizacion } from '../actions/organizacion.actions'
import type { Organizacion, OrganizacionFormData } from '../_types/organizacion'

interface OrganizacionFormProps {
  initialData: Organizacion
}

const DRAFT_KEY = 'admin:draft:organizacion'

export function OrganizacionForm({ initialData }: OrganizacionFormProps) {
  const initializeForm = useOrganizacionForm((state) => state.initializeForm)
  const isDirty = useOrganizacionForm((state) => state.isDirty)
  const isSaving = useOrganizacionForm((state) => state.isSaving)
  const formData = useOrganizacionForm((state) => state.formData)
  const markAsSaving = useOrganizacionForm((state) => state.markAsSaving)
  const markAsSaved = useOrganizacionForm((state) => state.markAsSaved)
  const restoreDraft = useOrganizacionForm((state) => state.restoreDraft)
  const clearDraft = useOrganizacionForm((state) => state.clearDraft)
  const [hasDraftNotification, setHasDraftNotification] = useState(false)

  // Convert initial data to form data
  const initialFormData: OrganizacionFormData = {
    nombre: initialData.nombre,
    descripcion: initialData.descripcion || '',
    mision: initialData.mision || '',
    vision: initialData.vision || '',
    equipo:
      initialData.equipo?.map((member) => ({
        id: member.id,
        nombre: member.nombre,
        cargo: member.cargo || '',
        rrss: member.rrss || ''
      })) || []
  }

  // Initialize form with data
  useEffect(() => {
    initializeForm(initialFormData)
  }, [initialData]) // eslint-disable-line react-hooks/exhaustive-deps

  // Create draft manager instance (memoized to avoid recreating)
  const draftManager = useMemo(
    () =>
      createDraftManager(
        DRAFT_KEY,
        useOrganizacionForm,
        (state) => state.formData,
        (state) => state.isDirty && state.shouldPersist,
        1500 // debounce 1.5s
      ),
    []
  )

  // Setup draft manager on mount and cleanup on unmount
  useEffect(() => {
    // Register draft manager with the store so clearDraft() works
    setDraftManagerInstance(draftManager)

    // Check for existing draft on mount
    const existingDraft = draftManager.getDraft()
    if (
      existingDraft &&
      (!initialData.updatedAt ||
        new Date(existingDraft.updatedAt) > new Date(initialData.updatedAt))
    ) {
      setHasDraftNotification(true)
    }

    // Start auto-save
    const cleanup = draftManager.start()

    // Cleanup on unmount
    return cleanup
  }, [draftManager, initialData.updatedAt])

  // Navigation confirmation
  useConfirmNavigation({
    shouldConfirm: isDirty,
    message: 'Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?'
  })

  // Handle restore draft
  const handleRestoreDraft = useCallback(() => {
    const draft = draftManager.getDraft()
    if (draft) {
      restoreDraft(draft.data)
      setHasDraftNotification(false)
    }
  }, [draftManager, restoreDraft])

  // Handle dismiss draft
  const handleDismissDraft = useCallback(() => {
    draftManager.clear()
    setHasDraftNotification(false)
  }, [draftManager])

  // Handle save
  const handleSave = useCallback(async () => {
    markAsSaving()
    
    try {
      const result = await updateOrganizacion(formData)
      
      if (result.success) {
        markAsSaved()
        clearDraft()
        draftManager.clear()
        setHasDraftNotification(false)
      } else {
        throw new Error(result.error || 'Error al guardar')
      }
    } catch (error) {
      throw error
    }
  }, [formData, markAsSaving, markAsSaved, clearDraft, draftManager])

  return (
    <div className='space-y-6'>
      {/* Draft notification */}
      {hasDraftNotification && (
        <DraftNotification
          onRestore={handleRestoreDraft}
          onDismiss={handleDismissDraft}
        />
      )}

      <div className='grid gap-6 md:grid-cols-2'>
        <OrganizacionInfoSection />
        <OrganizacionEquipoSection />
      </div>
      {/* Form sections */}

      {/* Save button - fixed at bottom */}
      <div className='sticky bottom-6 flex justify-end'>
        <div className='rounded-lg border bg-white p-4 shadow-lg'>
          <SaveButton 
            onSave={handleSave} 
            isDirty={isDirty}
            isSaving={isSaving}
          />
        </div>
      </div>
    </div>
  )
}
