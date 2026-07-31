import type { ArtistHistory } from '../_schemas/history.schema'

/** Valid field names for artist history, used as a single source of truth across actions and hooks. */
export const HISTORY_FIELD_NAMES = ['pseudonimo', 'correo', 'ciudad', 'pais', 'rrss'] as const

/** History fields that can be stored in artista_historial */
export type HistoryFieldName = typeof HISTORY_FIELD_NAMES[number]

export interface HistoryFieldEntry {
  value: string
  /** The DB row id (artista_historial.id) that originated this value. Used for field-level delete. */
  historyId: number
  /** Which field this entry belongs to, needed when rendering mixed groups (e.g. ubicaciones = ciudad + pais). */
  field: HistoryFieldName
  /** For rrss entries, the platform key. Included directly so consumers don't need to rediscover it via Object.entries(). */
  platform?: string
}

export interface History {
  pseudonimos: HistoryFieldEntry[]
  correos: HistoryFieldEntry[]
  ciudades: HistoryFieldEntry[]
  paises: HistoryFieldEntry[]
  rrss: Record<string, HistoryFieldEntry[]>
}

export interface AggregatedHistory {
  [key: number]: History
}

/** Empty history to use when an artist has no records yet. */
export const EMPTY_HISTORY: History = {
  pseudonimos: [],
  correos: [],
  ciudades: [],
  paises: [],
  rrss: {}
}

export function aggregateHistoryRecords(
  historyRecords: ArtistHistory[]
): AggregatedHistory {
  return historyRecords.reduce<AggregatedHistory>((acc, record) => {
    const { artistaId, id, pseudonimo, correo, ciudad, pais, rrss } = record

    if (!acc[artistaId]) {
      acc[artistaId] = {
        pseudonimos: [],
        correos: [],
        ciudades: [],
        paises: [],
        rrss: {}
      }
    }

    const entry = acc[artistaId]

    if (pseudonimo && !entry.pseudonimos.some((p) => p.value === pseudonimo)) {
      entry.pseudonimos.push({ value: pseudonimo, historyId: id, field: 'pseudonimo' })
    }
    if (correo && !entry.correos.some((c) => c.value === correo)) {
      entry.correos.push({ value: correo, historyId: id, field: 'correo' })
    }
    if (ciudad && !entry.ciudades.some((c) => c.value === ciudad)) {
      entry.ciudades.push({ value: ciudad, historyId: id, field: 'ciudad' })
    }
    if (pais && !entry.paises.some((p) => p.value === pais)) {
      entry.paises.push({ value: pais, historyId: id, field: 'pais' })
    }
    if (rrss) {
      for (const [platform, urls] of Object.entries(rrss)) {
        if (!entry.rrss[platform]) {
          entry.rrss[platform] = []
        }
        for (const url of urls) {
          if (!entry.rrss[platform].some((u) => u.value === url)) {
            entry.rrss[platform].push({ value: url, historyId: id, field: 'rrss', platform })
          }
        }
      }
    }

    return acc
  }, {})
}
