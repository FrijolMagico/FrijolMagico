import { describe, expect, it } from 'bun:test'
import { ZodError } from 'zod'
import type { JournalEntry } from '@/shared/change-journal/lib/types'
import {
  mapToOrganizacionEquipoInput,
  mapToOrganizacionInput
} from './organizacion.mapper'

describe('organizacion.mapper', () => {
  describe('mapToOrganizacionInput', () => {
    it('should validate and return valid organizacion input', () => {
      const entry: JournalEntry = {
        entryId: 'entry-1',
        schemaVersion: 1,
        section: 'organizacion',
        scopeKey: 'organizacion:1',
        payload: {
          op: 'set',
          value: {
            id: 1,
            nombre: 'Frijol Mágico',
            descripcion: 'Asociación cultural',
            mision: 'Promover la cultura',
            vision: 'Ser referentes culturales'
          }
        },
        timestampMs: Date.now(),
        clientId: 'client-1'
      }

      const result = mapToOrganizacionInput(entry)

      expect(result).toEqual({
        id: 1,
        nombre: 'Frijol Mágico',
        descripcion: 'Asociación cultural',
        mision: 'Promover la cultura',
        vision: 'Ser referentes culturales'
      })
    })

    it('should validate and return input without optional fields', () => {
      const entry: JournalEntry = {
        entryId: 'entry-2',
        schemaVersion: 1,
        section: 'organizacion',
        scopeKey: 'organizacion:temp-1',
        payload: {
          op: 'set',
          value: {
            nombre: 'Nueva Org'
          }
        },
        timestampMs: Date.now(),
        clientId: 'client-1'
      }

      const result = mapToOrganizacionInput(entry)

      expect(result).toEqual({
        nombre: 'Nueva Org'
      })
    })

    it('should throw error for unset operation', () => {
      const entry: JournalEntry = {
        entryId: 'entry-3',
        schemaVersion: 1,
        section: 'organizacion',
        scopeKey: 'organizacion:1',
        payload: {
          op: 'unset'
        },
        timestampMs: Date.now(),
        clientId: 'client-1'
      }

      expect(() => mapToOrganizacionInput(entry)).toThrow(
        'Cannot map unset operation to OrganizacionInput'
      )
    })

    it('should throw ZodError for invalid payload', () => {
      const entry: JournalEntry = {
        entryId: 'entry-4',
        schemaVersion: 1,
        section: 'organizacion',
        scopeKey: 'organizacion:1',
        payload: {
          op: 'set',
          value: {
            nombre: ''
          }
        },
        timestampMs: Date.now(),
        clientId: 'client-1'
      }

      expect(() => mapToOrganizacionInput(entry)).toThrow(ZodError)
    })

    it('should throw ZodError for missing required fields', () => {
      const entry: JournalEntry = {
        entryId: 'entry-5',
        schemaVersion: 1,
        section: 'organizacion',
        scopeKey: 'organizacion:1',
        payload: {
          op: 'set',
          value: {
            descripcion: 'Solo descripción'
          }
        },
        timestampMs: Date.now(),
        clientId: 'client-1'
      }

      expect(() => mapToOrganizacionInput(entry)).toThrow(ZodError)
    })

    it('should throw ZodError for invalid id type', () => {
      const entry: JournalEntry = {
        entryId: 'entry-6',
        schemaVersion: 1,
        section: 'organizacion',
        scopeKey: 'organizacion:1',
        payload: {
          op: 'set',
          value: {
            id: 'not-a-number',
            nombre: 'Test'
          }
        },
        timestampMs: Date.now(),
        clientId: 'client-1'
      }

      expect(() => mapToOrganizacionInput(entry)).toThrow(ZodError)
    })
  })

  describe('mapToOrganizacionEquipoInput', () => {
    it('should validate and return valid equipo input', () => {
      const entry: JournalEntry = {
        entryId: 'entry-7',
        schemaVersion: 1,
        section: 'organizacion-equipo',
        scopeKey: 'organizacion-equipo:1',
        payload: {
          op: 'set',
          value: {
            id: 1,
            organizacionId: 1,
            nombre: 'Juan Pérez',
            cargo: 'Director',
            rrss: '@juanperez'
          }
        },
        timestampMs: Date.now(),
        clientId: 'client-1'
      }

      const result = mapToOrganizacionEquipoInput(entry)

      expect(result).toEqual({
        id: 1,
        organizacionId: 1,
        nombre: 'Juan Pérez',
        cargo: 'Director',
        rrss: '@juanperez'
      })
    })

    it('should validate and return input without optional fields', () => {
      const entry: JournalEntry = {
        entryId: 'entry-8',
        schemaVersion: 1,
        section: 'organizacion-equipo',
        scopeKey: 'organizacion-equipo:temp-1',
        payload: {
          op: 'set',
          value: {
            organizacionId: 1,
            nombre: 'María González'
          }
        },
        timestampMs: Date.now(),
        clientId: 'client-1'
      }

      const result = mapToOrganizacionEquipoInput(entry)

      expect(result).toEqual({
        organizacionId: 1,
        nombre: 'María González'
      })
    })

    it('should throw error for unset operation', () => {
      const entry: JournalEntry = {
        entryId: 'entry-9',
        schemaVersion: 1,
        section: 'organizacion-equipo',
        scopeKey: 'organizacion-equipo:1',
        payload: {
          op: 'unset'
        },
        timestampMs: Date.now(),
        clientId: 'client-1'
      }

      expect(() => mapToOrganizacionEquipoInput(entry)).toThrow(
        'Cannot map unset operation to OrganizacionEquipoInput'
      )
    })

    it('should throw ZodError for missing organizacionId', () => {
      const entry: JournalEntry = {
        entryId: 'entry-10',
        schemaVersion: 1,
        section: 'organizacion-equipo',
        scopeKey: 'organizacion-equipo:1',
        payload: {
          op: 'set',
          value: {
            nombre: 'Pedro Sánchez'
          }
        },
        timestampMs: Date.now(),
        clientId: 'client-1'
      }

      expect(() => mapToOrganizacionEquipoInput(entry)).toThrow(ZodError)
    })

    it('should throw ZodError for invalid organizacionId', () => {
      const entry: JournalEntry = {
        entryId: 'entry-11',
        schemaVersion: 1,
        section: 'organizacion-equipo',
        scopeKey: 'organizacion-equipo:1',
        payload: {
          op: 'set',
          value: {
            organizacionId: -1,
            nombre: 'Test'
          }
        },
        timestampMs: Date.now(),
        clientId: 'client-1'
      }

      expect(() => mapToOrganizacionEquipoInput(entry)).toThrow(ZodError)
    })

    it('should throw ZodError for empty nombre', () => {
      const entry: JournalEntry = {
        entryId: 'entry-12',
        schemaVersion: 1,
        section: 'organizacion-equipo',
        scopeKey: 'organizacion-equipo:1',
        payload: {
          op: 'set',
          value: {
            organizacionId: 1,
            nombre: ''
          }
        },
        timestampMs: Date.now(),
        clientId: 'client-1'
      }

      expect(() => mapToOrganizacionEquipoInput(entry)).toThrow(ZodError)
    })
  })
})
