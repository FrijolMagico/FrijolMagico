import { ArtistHistory } from '../_schemas/history.schema'

export interface History {
  pseudonimos: string[]
  correos: string[]
  ciudades: string[]
  paises: string[]
  rrss: Record<string, string[]>
}

export interface AgrupateHistory {
  [key: number]: History
}

export function agrupateHistory(
  historyRecords: ArtistHistory[]
): AgrupateHistory {
  return historyRecords.reduce<AgrupateHistory>((acc, record) => {
    const { artistaId, pseudonimo, correo, ciudad, pais, rrss } = record

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

    if (pseudonimo && !entry.pseudonimos.includes(pseudonimo)) {
      entry.pseudonimos.push(pseudonimo)
    }
    if (correo && !entry.correos.includes(correo)) {
      entry.correos.push(correo)
    }
    if (ciudad && !entry.ciudades.includes(ciudad)) {
      entry.ciudades.push(ciudad)
    }
    if (pais && !entry.paises.includes(pais)) {
      entry.paises.push(pais)
    }
    if (rrss) {
      for (const [platform, urls] of Object.entries(rrss)) {
        if (!entry.rrss[platform]) {
          entry.rrss[platform] = []
        }
        for (const url of urls) {
          if (!entry.rrss[platform].includes(url)) {
            entry.rrss[platform].push(url)
          }
        }
      }
    }

    return acc
  }, {})
}
