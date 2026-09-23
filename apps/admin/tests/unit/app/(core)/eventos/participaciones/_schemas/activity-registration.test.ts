import { describe, expect, test } from 'bun:test'
import {
  activityFormSchema,
  activityRegistrationFormSchema,
  parseActivityRegistrationInput
} from '@/core/eventos/participaciones/_schemas/activity.schema'

const complete = {
  url: 'https://example.cl/inscripcion',
  startDate: '2026-07-01',
  startTime: '10:00',
  endDate: '2026-07-02',
  endTime: '11:00'
}
const fields = Object.keys(complete) as (keyof typeof complete)[]

describe('activity registration input', () => {
  test('normalizes whitespace-only fields to absent and preserves complete input', () => {
    expect(
      activityRegistrationFormSchema.parse(
        Object.fromEntries(fields.map((field) => [field, '  ']))
      )
    ).toBeNull()
    expect(
      activityRegistrationFormSchema.parse({
        ...complete,
        url: '  https://example.cl/inscripcion  '
      })
    ).toEqual(complete)
  })

  test('rejects every nonempty partial subset', () => {
    for (let mask = 1; mask < 31; mask++) {
      if (mask === 31) continue
      const input = Object.fromEntries(
        fields.map((field, index) => [
          field,
          mask & (1 << index) ? complete[field] : ''
        ])
      )
      expect(activityRegistrationFormSchema.safeParse(input).success).toBe(
        false
      )
    }
  })

  test('rejects malformed, insecure and disguised HTTPS URLs', () => {
    for (const url of [
      'http://example.cl',
      'https://',
      'not a url',
      'https://example.cl:bad',
      'https://user:secret@example.cl'
    ]) {
      expect(
        activityRegistrationFormSchema.safeParse({ ...complete, url }).success
      ).toBe(false)
    }
  })

  test('rejects equal, reversed and invalid local windows', () => {
    for (const patch of [
      { endDate: complete.startDate, endTime: complete.startTime },
      { endDate: '2026-06-30' },
      { startDate: '2026-02-30' },
      { startTime: '25:00' },
      { startDate: '2026-09-06', startTime: '00:30' }
    ]) {
      expect(
        activityRegistrationFormSchema.safeParse({ ...complete, ...patch })
          .success
      ).toBe(false)
    }
  })

  test('enclosing form passes empty, omitted and complete registration through the action-input boundary', () => {
    const form = {
      participantType: 'artista',
      modoIngresoId: 1,
      tipoActividadId: 1,
      notas: '',
      estado: 'seleccionado',
      puntaje: null,
      detail: {
        titulo: '',
        descripcion: '',
        duracionMinutos: null,
        cupos: null,
        horaInicio: '',
        ubicacion: ''
      },
      entity: { artistaId: 1, agrupacionId: null, bandaId: null }
    }
    const emptyForm = activityFormSchema.parse({
      ...form,
      registration: {
        url: '  ',
        startDate: '  ',
        startTime: '  ',
        endDate: '  ',
        endTime: '  '
      }
    })
    // RHF retains the five string inputs; normalization is at the action boundary.
    expect(emptyForm.registration).toEqual({
      url: '',
      startDate: '',
      startTime: '',
      endDate: '',
      endTime: ''
    })
    expect(
      parseActivityRegistrationInput(emptyForm.registration, 'taller')
    ).toBeNull()
    expect(
      parseActivityRegistrationInput(
        activityFormSchema.parse(form).registration,
        'taller'
      )
    ).toBeNull()
    expect(
      parseActivityRegistrationInput(
        activityFormSchema.parse({ ...form, registration: complete })
          .registration,
        'taller'
      )
    ).toEqual(complete)
    expect(
      activityFormSchema.safeParse({
        ...form,
        registration: { ...complete, endTime: '' }
      }).success
    ).toBe(false)
    expect(
      parseActivityRegistrationInput(emptyForm.registration, 'musica')
    ).toBeNull()
    expect(() =>
      parseActivityRegistrationInput(
        activityFormSchema.parse({ ...form, registration: complete })
          .registration,
        'musica'
      )
    ).toThrow('No se permite inscripción para actividades de música')
  })

  test('normalized action boundary rejects forged music registration and accepts absence', () => {
    expect(parseActivityRegistrationInput(complete, 'taller')).toEqual(complete)
    expect(parseActivityRegistrationInput(null, 'musica')).toBeNull()
    expect(() => parseActivityRegistrationInput(complete, 'musica')).toThrow(
      'No se permite inscripción para actividades de música'
    )
    expect(() =>
      parseActivityRegistrationInput(
        { ...complete, url: 'http://example.cl' },
        'taller'
      )
    ).toThrow()
  })
})
