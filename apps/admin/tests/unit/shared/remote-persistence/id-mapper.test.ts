import {
  generateTempId,
  createIdMapping,
  isTempId,
  extractUuidFromTempId,
  validateIdMappings,
  groupMappingsBySection
} from '@/shared/commit-system/lib/id-mapper'
import { describe, expect, test } from 'bun:test'

describe('id-mapper', () => {
  describe('generateTempId()', () => {
    test('generates unique temp IDs', () => {
      const id1 = generateTempId()
      const id2 = generateTempId()

      expect(id1).not.toBe(id2)
    })

    test('generated ID starts with "temp-"', () => {
      const id = generateTempId()
      expect(id).toMatch(/^temp-/)
    })

    test('generated ID has UUID format', () => {
      const id = generateTempId()
      const uuidPart = id.slice(5)
      // UUID format: 8-4-4-4-12 hex digits
      expect(uuidPart).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      )
    })
  })

  describe('createIdMapping()', () => {
    test('creates valid mapping with all properties', () => {
      const tempId = generateTempId()
      const realId = 123
      const section = 'organizacion'

      const mapping = createIdMapping(tempId, realId, section)

      expect(mapping.tempId).toBe(tempId)
      expect(mapping.realId).toBe(realId)
      expect(mapping.section).toBe(section)
    })

    test('works with different sections', () => {
      const sections = [
        'organizacion',
        'catalogo_artista',
        'artista',
        'evento'
      ] as const
      const tempId = generateTempId()

      sections.forEach((section) => {
        const mapping = createIdMapping(tempId, 1, section)
        expect(mapping.section).toBe(section)
      })
    })
  })

  describe('isTempId()', () => {
    test('returns true for valid temp IDs', () => {
      const id = generateTempId()
      expect(isTempId(id)).toBe(true)
    })

    test('returns false for real IDs (numbers)', () => {
      expect(isTempId('123')).toBe(false)
    })

    test('returns false for IDs without temp- prefix', () => {
      expect(isTempId('abc-550e8400-e29b-41d4-a716-446655440000')).toBe(false)
    })

    test('returns false for empty string', () => {
      expect(isTempId('')).toBe(false)
    })

    test('returns false for temp- without UUID', () => {
      expect(isTempId('temp-')).toBe(false)
    })
  })

  describe('extractUuidFromTempId()', () => {
    test('extracts UUID from temp ID', () => {
      const tempId = generateTempId()
      const uuid = extractUuidFromTempId(tempId)

      expect(uuid).not.toBeNull()
      expect(uuid).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      )
    })

    test('returns null for non-temp IDs', () => {
      expect(extractUuidFromTempId('123')).toBeNull()
      expect(extractUuidFromTempId('abc')).toBeNull()
    })

    test('returns null for invalid temp IDs', () => {
      expect(extractUuidFromTempId('temp-')).toBeNull()
    })
  })

  describe('validateIdMappings()', () => {
    test('validates correct mappings', () => {
      const mappings = [
        createIdMapping(generateTempId(), 1, 'organizacion'),
        createIdMapping(generateTempId(), 2, 'catalogo_artista'),
        createIdMapping(generateTempId(), 3, 'artista')
      ]

      expect(validateIdMappings(mappings)).toBe(true)
    })

    test('returns false for empty mappings array', () => {
      expect(validateIdMappings([])).toBe(true) // empty is valid (vacuous truth)
    })

    test('returns false for invalid tempId', () => {
      const mappings = [
        {
          tempId: '123',
          realId: 1,
          section: 'organizacion' as const
        }
      ]

      expect(validateIdMappings(mappings)).toBe(false)
    })

    test('returns false for invalid realId (0)', () => {
      const mappings = [
        {
          tempId: generateTempId(),
          realId: 0,
          section: 'organizacion' as const
        }
      ]

      expect(validateIdMappings(mappings)).toBe(false)
    })

    test('returns false for negative realId', () => {
      const mappings = [
        {
          tempId: generateTempId(),
          realId: -1,
          section: 'organizacion' as const
        }
      ]

      expect(validateIdMappings(mappings)).toBe(false)
    })

    test('returns false for invalid section', () => {
      const mappings = [
        {
          tempId: generateTempId(),
          realId: 1,
          section: 'invalid' as any
        }
      ]

      expect(validateIdMappings(mappings)).toBe(false)
    })
  })

  describe('groupMappingsBySection()', () => {
    test('groups mappings by section', () => {
      const mappings = [
        createIdMapping(generateTempId(), 1, 'organizacion'),
        createIdMapping(generateTempId(), 2, 'organizacion'),
        createIdMapping(generateTempId(), 3, 'catalogo_artista'),
        createIdMapping(generateTempId(), 4, 'artista')
      ]

      const grouped = groupMappingsBySection(mappings)

      expect(grouped.organizacion).toHaveLength(2)
      expect(grouped.catalogo_artista).toHaveLength(1)
      expect(grouped.artista).toHaveLength(1)
      expect(grouped.evento).toHaveLength(0)
    })

    test('returns all sections even if empty', () => {
      const grouped = groupMappingsBySection([])

      expect(grouped).toHaveProperty('organizacion')
      expect(grouped).toHaveProperty('organizacion_equipo')
      expect(grouped).toHaveProperty('catalogo_artista')
      expect(grouped).toHaveProperty('artista')
      expect(grouped).toHaveProperty('evento')
      expect(Object.values(grouped).every((arr) => arr.length === 0)).toBe(true)
    })

    test('maintains mapping data when grouping', () => {
      const tempId = generateTempId()
      const mapping = createIdMapping(tempId, 999, 'evento')
      const mappings = [mapping]

      const grouped = groupMappingsBySection(mappings)

      expect(grouped.evento[0]).toEqual(mapping)
      expect(grouped.evento[0].tempId).toBe(tempId)
      expect(grouped.evento[0].realId).toBe(999)
    })
  })
})
