import type { Edition } from '../_schemas/edition.schema'
import type { EditionDay } from '../_schemas/edition-day.schema'
import type { Place } from '../_schemas/place.schema'
import type { PaginatedEdition } from '../_types/paginated-edition'
import type { EventoLookup } from '../_types'
import { formatEdicionFechas } from './format-edicion-fechas'

function getModalidadLabel(modalidades: Array<string | null>): string | null {
  const uniqueModalidades = Array.from(
    new Set(modalidades.filter((modalidad) => modalidad !== null))
  )

  if (uniqueModalidades.length === 0) {
    return null
  }

  if (uniqueModalidades.length === 1) {
    return uniqueModalidades[0]
  }

  return 'mixto'
}

export function composeEditions(
  editions: Edition[],
  days: EditionDay[],
  places: Place[],
  eventos: EventoLookup[]
): PaginatedEdition[] {
  const daysByEditionId = new Map<number, EditionDay[]>()
  const placesById = new Map(places.map((place) => [place.id, place]))
  const eventosById = new Map(eventos.map((evento) => [evento.id, evento]))

  for (const day of days) {
    const editionDays = daysByEditionId.get(day.eventoEdicionId) ?? []
    editionDays.push(day)
    daysByEditionId.set(day.eventoEdicionId, editionDays)
  }

  return editions.map((edition) => {
    const editionDays = [...(daysByEditionId.get(edition.id) ?? [])].sort(
      (left, right) => left.fecha.localeCompare(right.fecha)
    )
    const firstDay = editionDays[0]

    return {
      ...edition,
      eventoNombre: eventosById.get(edition.eventoId)?.nombre ?? '',
      dateRange: formatEdicionFechas(editionDays),
      firstDate: firstDay?.fecha ?? '',
      lugarNombre: firstDay?.lugarId
        ? (placesById.get(firstDay.lugarId)?.nombre ?? null)
        : null,
      modalidadLabel: getModalidadLabel(
        editionDays.map((day) => day.modalidad ?? null)
      )
    }
  })
}
