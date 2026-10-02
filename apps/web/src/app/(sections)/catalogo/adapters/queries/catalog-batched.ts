export const CATALOG_BASE_QUERY = `SELECT
  a.id,
  COALESCE(catalog_pseudonym.pseudonimo, a.pseudonimo, a.nombre) as name,
  a.slug,
  a.correo as email,
  a.rrss,
  a.ciudad as city,
  a.pais as country,
  ca.descripcion as bio,
  ca.orden,
  ca.destacado,
  (
    SELECT ai.imagen_url
    FROM artista_imagen ai
    WHERE ai.artista_id = a.id AND ai.tipo = 'avatar' AND ai.deleted_at IS NULL
    ORDER BY ai.created_at DESC, ai.id DESC
    LIMIT 1
  ) as avatar,
  (
    SELECT ag.nombre
    FROM agrupacion_artista aa
    JOIN agrupacion ag ON aa.agrupacion_id = ag.id
    WHERE aa.artista_id = a.id AND aa.activo = 1
    LIMIT 1
  ) as collective
FROM catalogo_artista ca
JOIN artista a ON ca.artista_id = a.id
LEFT JOIN artista_pseudonimo catalog_pseudonym ON catalog_pseudonym.id = ca.pseudonimo_id
WHERE ca.activo = 1 AND ca.deleted_at IS NULL
ORDER BY ca.orden ASC`

export const CATALOG_PARTICIPATION_QUERY = `SELECT
  artist_id,
  participation_id,
  event_id,
  edition_id,
  edition,
  event,
  participation_type,
  category,
  via_collective
FROM (
  SELECT
    ped.artista_id as artist_id,
    pexp.id as participation_id,
    ee.evento_id as event_id,
    ee.id as edition_id,
    ee.numero_edicion as edition,
    ev.nombre as event,
    'exhibicion' as participation_type,
    d.slug as category,
    NULL as via_collective
  FROM participacion_edicion ped
  JOIN participacion_exposicion pexp ON pexp.participacion_id = ped.id
  JOIN disciplina d ON pexp.disciplina_id = d.id
  JOIN evento_edicion ee ON ped.edicion_id = ee.id
  JOIN evento ev ON ee.evento_id = ev.id
  WHERE ped.artista_id IS NOT NULL AND pexp.estado IN ('confirmado', 'completado')

  UNION ALL

  SELECT
    ped.artista_id,
    pact.id,
    ee.evento_id,
    ee.id,
    ee.numero_edicion,
    ev.nombre,
    'actividad',
    ta.slug,
    NULL
  FROM participacion_edicion ped
  JOIN participacion_actividad pact ON pact.participacion_id = ped.id
  JOIN tipo_actividad ta ON pact.tipo_actividad_id = ta.id
  JOIN evento_edicion ee ON ped.edicion_id = ee.id
  JOIN evento ev ON ee.evento_id = ev.id
  WHERE ped.artista_id IS NOT NULL AND pact.estado IN ('confirmado', 'completado')

  UNION ALL

  SELECT
    aa.artista_id,
    pexp.id,
    ee.evento_id,
    ee.id,
    ee.numero_edicion,
    ev.nombre,
    'exhibicion',
    d.slug,
    ag.nombre
  FROM agrupacion_artista aa
  JOIN participacion_edicion ped ON ped.agrupacion_id = aa.agrupacion_id
  JOIN agrupacion ag ON aa.agrupacion_id = ag.id
  JOIN participacion_exposicion pexp ON pexp.participacion_id = ped.id
  JOIN disciplina d ON pexp.disciplina_id = d.id
  JOIN evento_edicion ee ON ped.edicion_id = ee.id
  JOIN evento ev ON ee.evento_id = ev.id
  WHERE pexp.estado IN ('confirmado', 'completado')

  UNION ALL

  SELECT
    aa.artista_id,
    pact.id,
    ee.evento_id,
    ee.id,
    ee.numero_edicion,
    ev.nombre,
    'actividad',
    ta.slug,
    ag.nombre
  FROM agrupacion_artista aa
  JOIN participacion_edicion ped ON ped.agrupacion_id = aa.agrupacion_id
  JOIN agrupacion ag ON aa.agrupacion_id = ag.id
  JOIN participacion_actividad pact ON pact.participacion_id = ped.id
  JOIN tipo_actividad ta ON pact.tipo_actividad_id = ta.id
  JOIN evento_edicion ee ON ped.edicion_id = ee.id
  JOIN evento ev ON ee.evento_id = ev.id
  WHERE pact.estado IN ('confirmado', 'completado')
) participation
JOIN catalogo_artista ca ON ca.artista_id = participation.artist_id
WHERE ca.activo = 1 AND ca.deleted_at IS NULL`

export const CATALOG_EDITION_DATES_QUERY = `SELECT
  evento_edicion_id as edition_id,
  fecha as date
FROM evento_edicion_dia`

export type ParticipationRow = {
  artist_id: number
  participation_id: number
  event_id: number
  edition_id: number
  edition: string
  event: string
  participation_type: 'exhibicion' | 'actividad'
  category: string
  via_collective: string | null
}

export type EditionDateRow = {
  edition_id: number
  date: string | null
}

export type CatalogBaseRow = {
  id: number
  name: string
  slug: string | null
  email: string | null
  rrss: string | null
  city: string | null
  country: string | null
  bio: string | null
  orden: string
  destacado: number
  avatar: string | null
  collective: string | null
}

type EditionRow = {
  evento_id: number
  edicion: string
  evento: string
  año: string | null
  tipo_participacion: 'exhibicion' | 'actividad'
  categoria: string
  via_agrupacion: string | null
}

export function composeCatalogRows(
  baseRows: CatalogBaseRow[],
  participationRows: ParticipationRow[],
  editionDateRows: EditionDateRow[]
): Record<string, unknown>[] {
  const datesByEdition = new Map<number, (string | null)[]>()
  for (const { edition_id, date } of editionDateRows) {
    const dates = datesByEdition.get(edition_id) ?? []
    dates.push(date)
    datesByEdition.set(edition_id, dates)
  }

  const rowsByArtist = new Map<number, ParticipationRow[]>()
  for (const row of participationRows) {
    const rows = rowsByArtist.get(row.artist_id) ?? []
    rows.push(row)
    rowsByArtist.set(row.artist_id, rows)
  }

  return baseRows.map((artist) => {
    const rows = rowsByArtist.get(artist.id) ?? []
    const editionGroups = new Map<string, { row: ParticipationRow; earliestDate: string | null }>()
    const categoryDates = new Map<string, string | null>()

    for (const row of rows) {
      const dates = datesByEdition.get(row.edition_id) ?? [null]
      const editionKey = JSON.stringify([
        row.edition_id,
        row.event_id,
        row.edition,
        row.event,
        row.participation_type,
        row.category,
        row.via_collective
      ])
      const editionGroup = editionGroups.get(editionKey)
      const earliestDate = dates.reduce<string | null>((earliest, date) =>
        date && (!earliest || date < earliest) ? date : earliest, null)
      if (!editionGroup) {
        editionGroups.set(editionKey, { row, earliestDate })
      } else if (earliestDate && (!editionGroup.earliestDate || earliestDate < editionGroup.earliestDate)) {
        editionGroup.earliestDate = earliestDate
      }

      if (row.participation_type === 'exhibicion') {
        const categoryKey = JSON.stringify([row.participation_id, row.category])
        const previousDate = categoryDates.get(categoryKey)
        const latestDate = dates.reduce<string | null>((latest, date) =>
          date && (!latest || date > latest) ? date : latest, null)
        if (!categoryDates.has(categoryKey) || (latestDate && (!previousDate || latestDate > previousDate))) {
          categoryDates.set(categoryKey, latestDate ?? previousDate ?? null)
        }
      }
    }

    const editions: EditionRow[] = [...editionGroups.values()]
      .sort(({ row: left }, { row: right }) => {
        const participationOrder = (row: ParticipationRow) =>
          row.participation_type === 'exhibicion'
            ? row.via_collective === null
              ? 0
              : 2
            : row.via_collective === null
              ? 1
              : 3
        const branchDifference = participationOrder(left) - participationOrder(right)
        if (branchDifference !== 0) return branchDifference
        if (left.edition_id !== right.edition_id) return left.edition_id - right.edition_id
        if (left.category !== right.category) return left.category < right.category ? -1 : 1
        if (left.via_collective === right.via_collective) return 0
        if (left.via_collective === null) return -1
        if (right.via_collective === null) return 1
        return left.via_collective < right.via_collective ? -1 : 1
      })
      .map(({ row, earliestDate }) => ({
        evento_id: row.event_id,
        edicion: row.edition,
        evento: row.event,
        año: earliestDate?.slice(0, 4) ?? null,
        tipo_participacion: row.participation_type,
        categoria: row.category,
        via_agrupacion: row.via_collective
      }))

    const categoryCandidates = [...categoryDates.entries()].sort((left, right) => {
      if (left[1] === right[1]) return 0
      if (left[1] === null) return 1
      if (right[1] === null) return -1
      return right[1].localeCompare(left[1])
    })

    return {
      ...artist,
      category: categoryCandidates[0]?.[0] ? JSON.parse(categoryCandidates[0][0])[1] : null,
      editions
    }
  })
}
