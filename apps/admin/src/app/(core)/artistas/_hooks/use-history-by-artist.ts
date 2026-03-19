import type { ArtistHistory } from '../_schemas/history.schema'

export function useHistoryByArtist(historyData: ArtistHistory[]) {
  const historyByArtistId = new Map<number, ArtistHistory[]>()
  const artistIdsWithHistory = new Set<number>()

  for (const record of historyData) {
    const artistId = record.artistaId
    artistIdsWithHistory.add(artistId)

    if (!historyByArtistId.has(artistId)) {
      historyByArtistId.set(artistId, [])
    }
    historyByArtistId.get(artistId)!.push(record)
  }

  return { historyByArtistId, artistIdsWithHistory }
}
