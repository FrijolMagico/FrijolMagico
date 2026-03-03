import { HistoryEntry } from '../_types'

export interface AggregatedHistory {
  pseudonimos: string[]
  correos: string[]
  ciudades: string[]
  paises: string[]
  rrssList: Record<string, string>[]
}

export function aggregateHistory(historyRecords: HistoryEntry[]): AggregatedHistory {
  const aggregated: AggregatedHistory = {
    pseudonimos: [],
    correos: [],
    ciudades: [],
    paises: [],
    rrssList: []
  }

  const uniquePseudonimos = new Set<string>()
  const uniqueCorreos = new Set<string>()
  const uniqueCiudades = new Set<string>()
  const uniquePaises = new Set<string>()

  for (const record of historyRecords) {
    if (record.pseudonimo && !uniquePseudonimos.has(record.pseudonimo)) {
      uniquePseudonimos.add(record.pseudonimo)
      aggregated.pseudonimos.push(record.pseudonimo)
    }

    if (record.correo && !uniqueCorreos.has(record.correo)) {
      uniqueCorreos.add(record.correo)
      aggregated.correos.push(record.correo)
    }

    if (record.ciudad && !uniqueCiudades.has(record.ciudad)) {
      uniqueCiudades.add(record.ciudad)
      aggregated.ciudades.push(record.ciudad)
    }

    if (record.pais && !uniquePaises.has(record.pais)) {
      uniquePaises.add(record.pais)
      aggregated.paises.push(record.pais)
    }

    if (record.rrss && Object.keys(record.rrss).length > 0) {
      aggregated.rrssList.push(record.rrss)
    }
  }

  return aggregated
}
