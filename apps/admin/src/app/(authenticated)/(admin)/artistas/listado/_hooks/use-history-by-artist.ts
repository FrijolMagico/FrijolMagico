import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useHistoryProjectionStore } from '../_store/history-ui-store'
import type { HistoryEntry } from '../_types'

export function useHistoryByArtist() {
  const { allIds, byId } = useHistoryProjectionStore(
    useShallow((s) => ({ allIds: s.allIds, byId: s.byId }))
  )

  return useMemo(() => {
    const historyByArtistId = new Map<string, HistoryEntry[]>()
    const artistIdsWithHistory = new Set<string>()

    for (const id of allIds) {
      const record = byId[id]
      if (!record) continue

      const artistId = record.artistaId
      artistIdsWithHistory.add(artistId)

      if (!historyByArtistId.has(artistId)) {
        historyByArtistId.set(artistId, [])
      }
      historyByArtistId.get(artistId)!.push(record)
    }

    return { historyByArtistId, artistIdsWithHistory }
  }, [allIds, byId])
}
