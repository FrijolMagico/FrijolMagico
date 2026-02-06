'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { Pencil, MapPin, Mail } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { EditableRichTextField } from '@/app/(admin)/_components/tiptap'
import { SaveButton, DraftNotification } from '@/app/(admin)/_components/admin'
import { useCatalogoForm, setCatalogoDraftManager } from '../_hooks/useCatalogoForm'
import { createDraftManager } from '@/app/(admin)/_lib/draft'
import { updateCatalogoEntry } from '../actions/catalogo.actions'
import { ArtistaAvatar } from './ArtistaAvatar'
import { toast } from 'sonner'

interface EditCatalogoDialogProps {
  open: boolean
}

const CATALOG_DRAFT_KEY = 'admin:draft:catalogo'

export function EditCatalogoDialog({ open }: EditCatalogoDialogProps) {
  const selectedArtista = useCatalogoForm((state) => state.selectedArtista)
  const catalogoFormData = useCatalogoForm((state) => state.catalogoFormData)
  const isDirty = useCatalogoForm((state) => state.isDirty)
  const isSaving = useCatalogoForm((state) => state.isSaving)
  const updateCatalogoField = useCatalogoForm((state) => state.updateCatalogoField)
  const markAsSaving = useCatalogoForm((state) => state.markAsSaving)
  const markAsSaved = useCatalogoForm((state) => state.markAsSaved)
  const openArtistaDialog = useCatalogoForm((state) => state.openArtistaDialog)
  const closeAllDialogs = useCatalogoForm((state) => state.closeAllDialogs)
  const restoreDraft = useCatalogoForm((state) => state.restoreDraft)
  const clearCatalogoDraft = useCatalogoForm((state) => state.clearCatalogoDraft)
  const updateArtistaInList = useCatalogoForm((state) => state.updateArtistaInList)

  const [hasDraftNotification, setHasDraftNotification] = useState(false)

  // Draft manager
  const draftManager = useMemo(() => {
    if (!selectedArtista || !catalogoFormData) return null
    return createDraftManager(
      `${CATALOG_DRAFT_KEY}:${selectedArtista.artistaId}`,
      useCatalogoForm,
      (state) => state.catalogoFormData,
      (state) => state.isDirty && state.shouldPersist && !!state.catalogoFormData,
      1500
    )
  }, [selectedArtista, catalogoFormData])

  // Setup draft manager
  useEffect(() => {
    if (draftManager && open) {
      setCatalogoDraftManager(draftManager)

      // Check for existing draft
      const existingDraft = draftManager.getDraft()
      if (existingDraft && selectedArtista) {
        const serverTime = new Date(selectedArtista.catalogoUpdatedAt)
        const draftTime = new Date(existingDraft.updatedAt)

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
      restoreDraft('catalogo', draft.data)
      setHasDraftNotification(false)
    }
  }, [draftManager, restoreDraft])

  const handleDismissDraft = useCallback(() => {
    draftManager?.clear()
    setHasDraftNotification(false)
  }, [draftManager])

  const handleSave = useCallback(async () => {
    if (!selectedArtista || !catalogoFormData) return

    markAsSaving()

    try {
      const result = await updateCatalogoEntry(selectedArtista.artistaId, catalogoFormData)

      if (result.success) {
        markAsSaved()
        clearCatalogoDraft()
        draftManager?.clear()
        setHasDraftNotification(false)

        // Update the list
        updateArtistaInList(selectedArtista.artistaId, {
          destacado: catalogoFormData.destacado,
          activo: catalogoFormData.activo,
          descripcion: catalogoFormData.descripcion
        })

        toast.success('Cambios guardados correctamente')
        closeAllDialogs()
      } else {
        throw new Error(result.error || 'Error al guardar')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al guardar')
      throw error
    }
  }, [selectedArtista, catalogoFormData, markAsSaving, markAsSaved, clearCatalogoDraft, draftManager, updateArtistaInList, closeAllDialogs])

  if (!selectedArtista || !catalogoFormData) return null

  return (
    <Dialog open={open} onOpenChange={(open) => !open && closeAllDialogs()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Editar Entrada de Catálogo
          </DialogTitle>
        </DialogHeader>

        {hasDraftNotification && (
          <DraftNotification
            onRestore={handleRestoreDraft}
            onDismiss={handleDismissDraft}
          />
        )}

        {/* Artist Info Display */}
        <div className="rounded-lg border bg-gray-50 p-4 space-y-3">
          <div className="flex items-start gap-3">
            <ArtistaAvatar
              src={selectedArtista.avatarUrl}
              alt={selectedArtista.pseudonimo}
              size="lg"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">
                  {selectedArtista.nombre || selectedArtista.pseudonimo}
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={openArtistaDialog}
                  title="Editar información del artista"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
              {selectedArtista.nombre && (
                <p className="text-sm text-gray-500">@{selectedArtista.pseudonimo}</p>
              )}
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                {(selectedArtista.ciudad || selectedArtista.pais) && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {[selectedArtista.ciudad, selectedArtista.pais].filter(Boolean).join(', ')}
                  </span>
                )}
                {selectedArtista.correo && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {selectedArtista.correo}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Orden: <span className="font-mono">{selectedArtista.orden}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Catalog Fields */}
        <div className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch
                checked={catalogoFormData.destacado}
                onCheckedChange={(checked) =>
                  updateCatalogoField('destacado', checked)
                }
              />
              <Label>Destacado</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={catalogoFormData.activo}
                onCheckedChange={(checked) =>
                  updateCatalogoField('activo', checked)
                }
              />
              <Label>Activo</Label>
            </div>
          </div>

          <EditableRichTextField
            label="Descripción"
            value={catalogoFormData.descripcion}
            onChange={(value) => updateCatalogoField('descripcion', value)}
            placeholder="Descripción del artista para el catálogo..."
            minHeight="200px"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={closeAllDialogs}>
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

