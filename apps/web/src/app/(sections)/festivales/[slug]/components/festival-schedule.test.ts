import { describe, expect, test } from 'bun:test'

import { buildFestivalSchedule } from './festival-schedule'

import type { FestivalActivity } from '../../types/festival'

const makeActivity = (
  title: string,
  type: string,
  occurrences: FestivalActivity['ocurrencias']
): FestivalActivity => ({
  titulo: title,
  descripcion: null,
  ubicacion: null,
  ocurrencias: occurrences,
  tipo: type,
  participante_pseudonimo: null,
  registration: null
})

const occurrence = (
  id: number,
  date: string,
  start: string | null,
  duration: number | null,
  registrationUrl: string | null = null
): FestivalActivity['ocurrencias'][number] => ({
  id,
  fecha: date,
  hora_inicio: start,
  duracion_minutos: duration,
  registration_url: registrationUrl
})

describe('buildFestivalSchedule', () => {
  test('groups by chronological day and type, sorting entries by time with stable ties', () => {
    const schedule = buildFestivalSchedule(
      [
        makeActivity('Later', 'charla', [occurrence(1, '2026-10-04', '12:00', 30)]),
        makeActivity('Second tie', 'taller', [occurrence(2, '2026-10-03', '09:00', 30)]),
        makeActivity('Music', 'musica', [occurrence(3, '2026-10-03', '08:00', 30)]),
        makeActivity('First tie', 'taller', [occurrence(4, '2026-10-03', '09:00', 30)]),
        makeActivity('Earlier', 'charla', [occurrence(5, '2026-10-04', '10:00', 30)])
      ],
      false
    )

    expect(schedule.days.map(({ date }) => date)).toEqual(['2026-10-03', '2026-10-04'])
    expect(schedule.days[0].groups.map(({ type }) => type)).toEqual(['taller', 'musica'])
    expect(schedule.days[0].groups[0].entries.map(({ activity }) => activity.titulo)).toEqual([
      'Second tie',
      'First tie'
    ])
    expect(schedule.days[1].groups[0].entries.map(({ activity }) => activity.titulo)).toEqual([
      'Earlier',
      'Later'
    ])
  })

  test('assigns arbitrarily many columns to overlaps and reuses columns at interval ends', () => {
    const schedule = buildFestivalSchedule(
      [
        makeActivity('A', 'taller', [occurrence(1, '2026-10-03', '09:00', 120)]),
        makeActivity('B', 'taller', [occurrence(2, '2026-10-03', '09:00', 60)]),
        makeActivity('C', 'taller', [occurrence(3, '2026-10-03', '09:30', 90)]),
        makeActivity('D', 'taller', [occurrence(4, '2026-10-03', '10:00', 30)]),
        makeActivity('E', 'taller', [occurrence(5, '2026-10-03', '11:00', 30)])
      ],
      false
    )
    const group = schedule.days[0].groups[0]

    expect(group.entries.map(({ activity, column }) => [activity.titulo, column])).toEqual([
      ['A', 0],
      ['B', 1],
      ['C', 2],
      ['D', 1],
      ['E', 0]
    ])
    expect(group.columnCount).toBe(3)
  })

  test('shares overlap columns across types and reuses the peak-concurrency column pool', () => {
    const schedule = buildFestivalSchedule(
      [
        makeActivity('Workshop', 'taller', [occurrence(1, '2026-10-03', '09:00', 120)]),
        makeActivity('Talk', 'charla', [occurrence(2, '2026-10-03', '09:00', 30)]),
        makeActivity('Music', 'musica', [occurrence(3, '2026-10-03', '09:15', 45)]),
        makeActivity('Later talk', 'charla', [occurrence(4, '2026-10-03', '10:00', 30)])
      ],
      false
    )
    const groups = schedule.days[0].groups
    const entries = groups.flatMap(({ entries: groupEntries }) => groupEntries)

    expect(entries.map(({ activity, column }) => [activity.titulo, column])).toEqual([
      ['Workshop', 0],
      ['Talk', 1],
      ['Later talk', 1],
      ['Music', 2]
    ])
    expect(groups.map(({ columnCount }) => columnCount)).toEqual([3, 3, 3])
  })

  test('preserves each occurrence and its registration URL when an activity repeats', () => {
    const first = occurrence(1, '2026-10-03', '09:00', 30, 'https://example.org/one')
    const second = occurrence(2, '2026-10-04', '10:00', 45, 'https://example.org/two')
    const activity = makeActivity('Repeated', 'taller', [first, second])
    const schedule = buildFestivalSchedule([activity], false)

    expect(schedule.days.flatMap(({ groups }) => groups.flatMap(({ entries }) => entries))).toEqual([
      expect.objectContaining({ activity, occurrence: first, occurrenceIndex: 0 }),
      expect.objectContaining({ activity, occurrence: second, occurrenceIndex: 1 })
    ])
    expect(schedule.days.map(({ groups }) => groups[0].entries[0].occurrence.registration_url)).toEqual([
      'https://example.org/one',
      'https://example.org/two'
    ])
  })

  test('keeps null or invalid times as active-edition unscheduled entries only', () => {
    const dated = makeActivity('Dated', 'charla', [occurrence(1, '2026-10-03', null, null)])
    const undated = makeActivity('Undated', 'taller', [])
    const invalidDuration = makeActivity('No duration', 'musica', [
      occurrence(2, '2026-10-03', '20:00', null)
    ])
    const active = buildFestivalSchedule([dated, undated, invalidDuration], false)

    expect(active.days).toEqual([])
    expect(active.unscheduled.map(({ activity, occurrence: item }) => [activity.titulo, item?.id ?? null])).toEqual([
      ['Dated', 1],
      ['Undated', null],
      ['No duration', 2]
    ])

    const past = buildFestivalSchedule([dated, undated, invalidDuration], true)
    expect(past).toEqual({ days: [], unscheduled: [] })
  })
})
