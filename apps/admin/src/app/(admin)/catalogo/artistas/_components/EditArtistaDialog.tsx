'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { SaveButton, DraftNotification } from '@/app/(admin)/_components/admin'
import { useCatalogoForm, setArtistaDraftManager } from '../_hooks/useCatalogoForm'
import { createDraftManager } from '@/app/(admin)/_lib/draft'
import { updateArtista } from '../actions/catalogo.actions'
import { toast } from 'sonner'

interface EditArtistaDialogProps {
  open: boolean
}

const ARTISTA_DRAFT_KEY = 'admin:draft:artista'

export function EditArtistaDialog({ open }: EditArtistaDialogProps) {
  const selectedArtista = useCatalogoForm((state) => state.selectedArtista)
  const artistaFormData = useCatalogoForm((state) => state.artistaFormData)
  const isDirty = useCatalogoForm((state) => state.isDirty)
  const isSaving = useCatalogoForm((state) => state.isSaving)
  const updateArtistaField = useCatalogoForm((state) => state.updateArtistaField)
  const markAsSaving = useCatalogoForm((state) => state.markAsSaving)
  const markAsSaved = useCatalogoForm((state) => state.markAsSaved)
  const closeArtistaDialog = useCatalogoForm((state) => state.closeArtistaDialog)
  const restoreDraft = useCatalogoForm((state) => state.restoreDraft)
  const clearArtistaDraft = useCatalogoForm((state) => state.clearArtistaDraft)
  const updateArtistaInList = useCatalogoForm((state) => state.updateArtistaInList)

  const [hasDraftNotification, setHasDraftNotification] = useState(false)

  // Draft manager
  const draftManager = useMemo(() => {
    if (!selectedArtista || !artistaFormData) return null
    return createDraftManager(
      `${ARTISTA_DRAFT_KEY}:${selectedArtista.artistaId}`,
      useCatalogoForm,
      (state) => state.artistaFormData,
      (state) => state.isDirty && state.shouldPersist && !!state.artistaFormData,
      1500
    )
  }, [selectedArtista, artistaFormData])

  // Setup draft manager
  useEffect(() => {
    if (draftManager && open) {
      setArtistaDraftManager(draftManager)

      // Check for existing draft
      const existingDraft = draftManager.getDraft()
      if (existingDraft) {
        const draftTime = new Date(existingDraft.updatedAt)
        const serverTime = new Date(selectedArtista?.catalogoUpdatedAt || 0)

        if (draftTime > serverTime) {
          setHasDraftNotification(true)
        }
      }

      const cleanup = draftManager.start()
      return cleanup
    }
  }, [draftManager, open, selectedArtista])

  const handleRestoreDraft = useCallback(() => {
    const draft = draftManager?.getDraft()
    if (draft?.data) {
      restoreDraft('artista', draft.data)
      setHasDraftNotification(false)
    }
  }, [draftManager, restoreDraft])

  const handleDismissDraft = useCallback(() => {
    draftManager?.clear()
    setHasDraftNotification(false)
  }, [draftManager])

  const handleSave = useCallback(async () => {
    if (!selectedArtista || !artistaFormData) return

    markAsSaving()

    try {
      const result = await updateArtista(selectedArtista.artistaId, artistaFormData)

      if (result.success) {
        markAsSaved()
        clearArtistaDraft()
        draftManager?.clear()
        setHasDraftNotification(false)

        // Update the list
        updateArtistaInList(selectedArtista.artistaId, {
          nombre: artistaFormData.nombre,
          pseudonimo: artistaFormData.pseudonimo,
          correo: artistaFormData.correo,
          rrss: artistaFormData.rrss,
          ciudad: artistaFormData.ciudad,
          pais: artistaFormData.pais
        })

        toast.success('Información del artista guardada correctamente')
        closeArtistaDialog()
      } else {
        throw new Error(result.error || 'Error al guardar')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al guardar')
      throw error
    }
  }, [selectedArtista, artistaFormData, markAsSaving, markAsSaved, clearArtistaDraft, draftManager, updateArtistaInList, closeArtistaDialog])

  if (!selectedArtista || !artistaFormData) return null

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => !open && closeArtistaDialog()}
    >
      <DialogContent className="max-w-xl z-[60]">
        <DialogHeader>
          <DialogTitle>Editar Información del Artista</DialogTitle>
        </DialogHeader>

        {hasDraftNotification && (
          <DraftNotification
            onRestore={handleRestoreDraft}
            onDismiss={handleDismissDraft}
          />
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={artistaFormData.nombre}
                onChange={(e) => updateArtistaField('nombre', e.target.value)}
                placeholder="Nombre completo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pseudonimo">
                Pseudónimo <span className="text-red-500">*</span>
              </Label>
              <Input
                id="pseudonimo"
                value={artistaFormData.pseudonimo}
                onChange={(e) => updateArtistaField('pseudonimo', e.target.value)}
                placeholder="@usuario"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="correo">Correo electrónico</Label>
            <Input
              id="correo"
              type="email"
              value={artistaFormData.correo}
              onChange={(e) => updateArtistaField('correo', e.target.value)}
              placeholder="artista@ejemplo.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rrss">Redes Sociales</Label>
            <Textarea
              id="rrss"
              value={artistaFormData.rrss}
              onChange={(e) => updateArtistaField('rrss', e.target.value)}
              placeholder="@instagram, @twitter, etc."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ciudad">Ciudad</Label>
              <Input
                id="ciudad"
                value={artistaFormData.ciudad}
                onChange={(e) => updateArtistaField('ciudad', e.target.value)}
                placeholder="Santiago"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pais">País</Label>
              <Input
                id="pais"
                value={artistaFormData.pais}
                onChange={(e) => updateArtistaField('pais', e.target.value)}
                placeholder="Chile"
              />
            </div>
          </div>

          <p className="text-xs text-gray-500">
            <span className="text-red-500">*</span> Campo único en el sistema
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={closeArtistaDialog}>
            Cancelar
          </Button>
          <SaveButton
            onSave={handleSave}
            isDirty={isDirty}
            isSaving={isSaving}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
