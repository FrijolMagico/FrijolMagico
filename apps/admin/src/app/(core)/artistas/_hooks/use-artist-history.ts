'use client'

import { useCallback, useOptimistic, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { useArtistDialog } from '../_store/artist-dialog-store'
import { insertArtistHistoryItemAction } from '../_actions/insert-artist-history.action'
import { deleteArtistHistoryFieldAction } from '../_actions/delete-artist-history-field.action'
import type { InsertHistoryFormInput } from '../_actions/insert-artist-history.action'
import type { History, HistoryFieldEntry } from '../_lib/aggregate-history'

export type ArtistHistoryView = History & { pseudonimo: string }

export type OptimisticAction =
  | {
      type: 'ADD_FIELD'
      field: 'pseudonimo' | 'correo' | 'ciudad' | 'pais'
      value: string
      tempId: number
    }
  | {
      type: 'ADD_RRSS'
      platform: string
      url: string
      tempId: number
    }
  | { type: 'DELETE_FIELD'; entry: HistoryFieldEntry }
  | { type: 'DELETE_RRSS'; entry: HistoryFieldEntry }

export const FIELD_TO_STORE_KEY: Record<string, keyof History> = {
  pseudonimo: 'pseudonimos',
  correo: 'correos',
  ciudad: 'ciudades',
  pais: 'paises',
}

export function optimisticReducer(
  state: ArtistHistoryView,
  action: OptimisticAction,
): ArtistHistoryView {
  switch (action.type) {
    case 'ADD_FIELD': {
      const storeKey = FIELD_TO_STORE_KEY[action.field]
      const arr = state[storeKey] as HistoryFieldEntry[]
      // Idempotent: skip if the value already exists in the base state.
      // This prevents duplicates when the base is updated inside the same
      // transition — React re-runs the reducer with the new base + pending action.
      if (arr.some((e) => e.value === action.value)) {
        return state
      }
      return {
        ...state,
        [storeKey]: [
          ...arr,
          { value: action.value, historyId: action.tempId, field: action.field },
        ],
      }
    }

    case 'ADD_RRSS': {
      const platform = action.platform.toLowerCase()
      const existing = state.rrss[platform] ?? []
      // Idempotent: skip if the URL already exists in the platform's array
      if (existing.some((e) => e.value === action.url)) {
        return state
      }
      return {
        ...state,
        rrss: {
          ...state.rrss,
          [platform]: [
            ...existing,
            { value: action.url, historyId: action.tempId, field: 'rrss', platform },
          ],
        },
      }
    }

    case 'DELETE_FIELD': {
      const storeKey = FIELD_TO_STORE_KEY[action.entry.field]
      const arr = state[storeKey] as HistoryFieldEntry[]
      return {
        ...state,
        [storeKey]: arr.filter(
          (e) =>
            !(
              e.historyId === action.entry.historyId &&
              e.value === action.entry.value
            ),
        ),
      }
    }

    case 'DELETE_RRSS': {
      const platform = action.entry.platform
      if (!platform) return state

      const existing = state.rrss[platform]
      if (!existing) return state

      const filtered = existing.filter(
        (e) =>
          !(
            e.historyId === action.entry.historyId &&
            e.value === action.entry.value
          ),
      )

      const newRrss = { ...state.rrss }
      if (filtered.length === 0) {
        delete newRrss[platform]
      } else {
        newRrss[platform] = filtered
      }

      return { ...state, rrss: newRrss }
    }
  }
}

interface FormState {
  pendingFields: Record<string, string>
  rrssOpen: boolean
  rrssPlatform: string
  rrssUrl: string
}

const INITIAL_FORM: FormState = {
  pendingFields: {},
  rrssOpen: false,
  rrssPlatform: '',
  rrssUrl: '',
}

const TEMP_ID_THRESHOLD = 1_000_000_000_000

let tempIdCounter = Date.now()
function nextTempId(): number {
  tempIdCounter++
  return tempIdCounter
}

function getInsertedId(
  result: Awaited<ReturnType<typeof insertArtistHistoryItemAction>>,
): number | undefined {
  if (
    result.success &&
    result.data &&
    typeof result.data === 'object' &&
    'historyId' in result.data
  ) {
    return (result.data as { historyId: number }).historyId
  }
  return undefined
}

function syncSaveToZustand(
  capturedFields: Record<string, string>,
  capturedPlatform: string,
  capturedUrl: string,
  hasRrss: boolean,
  insertedId: number,
) {
  useArtistDialog.setState((state) => {
    if (!state.selectedArtistHistory) return state
    const updated: Record<string, unknown> = { ...state.selectedArtistHistory }

    for (const key of ['pseudonimo', 'correo', 'ciudad', 'pais'] as const) {
      const value = capturedFields[key]?.trim()
      if (value) {
        const storeKey = FIELD_TO_STORE_KEY[key]
        const entries = updated[storeKey] as HistoryFieldEntry[]
        updated[storeKey] = [
          ...entries,
          { value, historyId: insertedId, field: key },
        ]
      }
    }

    if (hasRrss) {
      const platform = capturedPlatform.toLowerCase()
      const currentRrss =
        (updated.rrss as Record<string, HistoryFieldEntry[]>) ?? {}
      const platformEntries = currentRrss[platform] ?? []
      updated.rrss = {
        ...currentRrss,
        [platform]: [
          ...platformEntries,
          {
            value: capturedUrl,
            historyId: insertedId,
            field: 'rrss',
            platform,
          },
        ],
      }
    }

    return { selectedArtistHistory: updated as unknown as ArtistHistoryView }
  })
}

function syncDeleteToZustand(entry: HistoryFieldEntry) {
  const storeKey = FIELD_TO_STORE_KEY[entry.field]
  if (!storeKey) return

  useArtistDialog.setState((state) => {
    if (!state.selectedArtistHistory) return state
    const updated: Record<string, unknown> = { ...state.selectedArtistHistory }
    const entries = updated[storeKey] as HistoryFieldEntry[]
    updated[storeKey] = entries.filter(
      (e) => !(e.historyId === entry.historyId && e.value === entry.value),
    )
    return { selectedArtistHistory: updated as unknown as ArtistHistoryView }
  })
}

function syncDeleteRrssToZustand(entry: HistoryFieldEntry) {
  const platform = entry.platform
  if (!platform) return

  useArtistDialog.setState((state) => {
    if (!state.selectedArtistHistory) return state
    const updated: Record<string, unknown> = { ...state.selectedArtistHistory }
    const rrss = { ...(updated.rrss as Record<string, HistoryFieldEntry[]>) }
    const filtered = rrss[platform].filter(
      (e) => !(e.historyId === entry.historyId && e.value === entry.value),
    )
    if (filtered.length === 0) {
      delete rrss[platform]
    } else {
      rrss[platform] = filtered
    }
    updated.rrss = rrss
    return { selectedArtistHistory: updated as unknown as ArtistHistoryView }
  })
}

export function useArtistHistory(
  history: ArtistHistoryView,
  artistId: number,
) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const [saveError, setSaveError] = useState<string | null>(null)

  const [optimisticHistory, addOptimistic] = useOptimistic<
    ArtistHistoryView,
    OptimisticAction
  >(history, optimisticReducer)

  const setPendingField = useCallback((name: string, value: string) => {
    setForm((prev) => ({
      ...prev,
      pendingFields: { ...prev.pendingFields, [name]: value },
    }))
  }, [])

  const openRrssAdd = useCallback(() => {
    setForm((prev) => ({ ...prev, rrssOpen: true }))
  }, [])

  const setRrssPlatform = useCallback((value: string) => {
    setForm((prev) => ({ ...prev, rrssPlatform: value }))
  }, [])

  const setRrssUrl = useCallback((value: string) => {
    setForm((prev) => ({ ...prev, rrssUrl: value }))
  }, [])

  const hasPendingItems =
    Object.values(form.pendingFields).some((v) => v.trim().length > 0) ||
    (form.rrssPlatform.trim().length > 0 && form.rrssUrl.trim().length > 0)

  const handleSave = useCallback(async () => {
    // Capture form values before any state mutations
    const capturedFields = { ...form.pendingFields }
    const capturedPlatform = form.rrssPlatform.trim()
    const capturedUrl = form.rrssUrl.trim()
    const hasRrss = capturedPlatform.length > 0 && capturedUrl.length > 0

    const data: InsertHistoryFormInput = { artistaId: artistId }
    let hasData = false

    for (const key of ['pseudonimo', 'correo', 'ciudad', 'pais'] as const) {
      const value = capturedFields[key]
      if (value?.trim()) {
        data[key] = value.trim()
        hasData = true
      }
    }

    if (hasRrss) {
      data.rrss = {
        [capturedPlatform.toLowerCase()]: capturedUrl,
      }
    }

    if (!hasData && !hasRrss) return

    // Reset add inputs immediately
    setForm(INITIAL_FORM)
    setSaveError(null)

    // Fire server action — addOptimistic MUST be inside startTransition
    startTransition(async () => {
      try {
      // Optimistic UI update — shows entries before server responds
      const tempId = nextTempId()
      for (const key of ['pseudonimo', 'correo', 'ciudad', 'pais'] as const) {
        const value = capturedFields[key]?.trim()
        if (value) {
          addOptimistic({ type: 'ADD_FIELD', field: key, value, tempId })
        }
      }
      if (hasRrss) {
        addOptimistic({
          type: 'ADD_RRSS',
          platform: capturedPlatform.toLowerCase(),
          url: capturedUrl,
          tempId,
        })
      }

      const result = await insertArtistHistoryItemAction(data)

      if (!result.success) {
        const errorMsg =
          result.errors && result.errors.length > 0
            ? result.errors[0].message
            : 'Error al guardar'
        setSaveError(errorMsg)
        toast.error(errorMsg)
        // Optimistic state reverts on next render since base wasn't updated
        return
      }

      // Sync base state with real server data
      const insertedId = getInsertedId(result)
      if (insertedId) {
        syncSaveToZustand(capturedFields, capturedPlatform, capturedUrl, hasRrss, insertedId)
      }

      toast.success('Elemento de historial agregado exitosamente')
      router.refresh()
    } catch (error) {
      setSaveError('Error inesperado al guardar')
      toast.error('Error inesperado al guardar')
      console.error('Save failed:', error)
    }
    })
  }, [artistId, form, addOptimistic, router])
  const handleDelete = useCallback(
    (entry: HistoryFieldEntry) => {
      startTransition(async () => {
        try {
          // Optimistic UI update — removes entry before server responds
          addOptimistic({ type: 'DELETE_FIELD', entry })

          // If this entry hasn't been persisted yet (optimistic-only), skip server call
          if (entry.historyId > TEMP_ID_THRESHOLD) {
            return
          }

          const result = await deleteArtistHistoryFieldAction(
            entry.historyId,
            entry.field,
          )

          if (!result.success) {
            const errorMsg =
              result.errors && result.errors.length > 0
                ? result.errors[0].message
                : 'Error al eliminar'

            toast.error(errorMsg)
            // Optimistic state reverts on next render since base wasn't updated
            return
          }

          // Sync base state: remove the deleted entry
          const FIELD_LABELS: Record<string, string> = {
            pseudonimo: 'Pseudónimo',
            correo: 'Correo',
            ciudad: 'Ciudad',
            pais: 'País',
            rrss: 'Red social',
          }

          syncDeleteToZustand(entry)

          toast.success(
            `${FIELD_LABELS[entry.field] ?? 'Elemento'} eliminado del historial`,
          )
          router.refresh()
        } catch (error) {
          toast.error('Error inesperado al eliminar')
          console.error('Delete failed:', error)
        }
      })
    },
    [addOptimistic, router],
  )

  const handleDeleteRrss = useCallback(
    (entry: HistoryFieldEntry) => {
      startTransition(async () => {
        try {
          // Optimistic UI update — removes RRSS entry before server responds
          addOptimistic({ type: 'DELETE_RRSS', entry })

          // If this entry hasn't been persisted yet, skip server call
          if (entry.historyId > TEMP_ID_THRESHOLD) {
            return
          }

          const platform = entry.platform
          const result = await deleteArtistHistoryFieldAction(
            entry.historyId,
            entry.field,
            platform,
          )

          if (!result.success) {
            const errorMsg =
              result.errors && result.errors.length > 0
                ? result.errors[0].message
                : 'Error al eliminar'
            toast.error(errorMsg)
            return
          }

          // Sync base state
          syncDeleteRrssToZustand(entry)

          toast.success('Red social eliminada del historial')
          router.refresh()
        } catch (error) {
          toast.error('Error inesperado al eliminar red social')
          console.error('Delete RRSS failed:', error)
        }
      })
    },
    [addOptimistic, router],
  )

  return {
    optimisticHistory,
    form,
    saveError,
    setPendingField,
    openRrssAdd,
    setRrssPlatform,
    setRrssUrl,
    hasPendingItems,
    handleSave,
    handleDelete,
    handleDeleteRrss,
    clearSaveError: () => { setSaveError(null) },
  }
}
