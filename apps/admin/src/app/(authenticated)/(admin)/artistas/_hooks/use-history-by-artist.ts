import { useMemo } from 'react'
import type { HistoryEntry } from '../_types'

export function useHistoryByArtist(historyData: HistoryEntry[]) {

  return useMemo(() => {
    const historyByArtistId = new Map<string, HistoryEntry[]>()
    const artistIdsWithHistory = new Set<string>()

    for (const record of historyData) {
      const artistId = record.artistaId
      artistIdsWithHistory.add(artistId)

      if (!historyByArtistId.has(artistId)) {
        historyByArtistId.set(artistId, [])
      }
      historyByArtistId.get(artistId)!.push(record)
    }

    return { historyByArtistId, artistIdsWithHistory }
  }, [historyData])
}
