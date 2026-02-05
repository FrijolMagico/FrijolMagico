'use client'

import { useEffect, useCallback, useMemo, useState } from 'react'
import { OrganizacionInfoSection } from './OrganizacionInfoSection'
import { OrganizacionEquipoSection } from './OrganizacionEquipoSection'
import { SaveButton } from './SaveButton'
import { DraftNotification } from './DraftNotification'
import {
  useOrganizacionForm,
  setDraftManagerInstance
} from '../hooks/useOrganizacionForm'
import { createDraftManager } from '../lib/draftManager'
import { useConfirmNavigation } from '@/hooks/useConfirmNavigation'
import type { Organizacion, OrganizacionFormData } from '../types/organizacion'

interface OrganizacionFormProps {
  initialData: Organizacion
}

const DRAFT_KEY = 'admin:draft:organizacion'

export function OrganizacionForm({ initialData }: OrganizacionFormProps) {
  const initializeForm = useOrganizacionForm((state) => state.initializeForm)
  const isDirty = useOrganizacionForm((state) => state.isDirty)
  const restoreDraft = useOrganizacionForm((state) => state.restoreDraft)
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

  // Handle successful save
  const handleSaveSuccess = useCallback(() => {
    draftManager.clear()
    setHasDraftNotification(false)
  }, [draftManager])

  return (
    <div className='space-y-6'>
      {/* Draft notification */}
      {hasDraftNotification && (
        <DraftNotification
          onRestore={handleRestoreDraft}
          onDismiss={handleDismissDraft}
        />
      )}

      {/* Form sections */}
      <OrganizacionInfoSection />
      <OrganizacionEquipoSection />

      {/* Save button - fixed at bottom */}
      <div className='sticky bottom-6 flex justify-end'>
        <div className='rounded-lg border bg-white p-4 shadow-lg'>
          <SaveButton onSave={handleSaveSuccess} />
        </div>
      </div>
    </div>
  )
}
