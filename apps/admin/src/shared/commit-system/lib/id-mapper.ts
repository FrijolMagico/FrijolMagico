import type { IdMapping, SectionName } from './types'
import { JOURNAL_ENTITIES } from '@/shared/lib/database-entities'

/**
 * Genera un ID temporal único con formato 'temp-{uuid}'
 * Se usa para entidades creadas localmente antes de ser guardadas en DB
 */
export function generateTempId(): string {
  return `temp-${crypto.randomUUID()}`
}

/**
 * Crea un mapping entre un ID temporal y su ID real asignado por la DB
 */
export function createIdMapping(
  tempId: string,
  realId: number,
  section: SectionName
): IdMapping {
  return {
    tempId,
    realId,
    section
  }
}

/**
 * Valida que un ID sea temporal
 */
export function isTempId(id: string): boolean {
  return id.startsWith('temp-') && id.length > 5
}

/**
 * Extrae el UUID de un ID temporal
 * Ej: 'temp-550e8400-e29b-41d4-a716-446655440000' → '550e8400-e29b-41d4-a716-446655440000'
 */
export function extractUuidFromTempId(tempId: string): string | null {
  if (!isTempId(tempId)) return null
  return tempId.slice(5)
}

/**
 * Valida que todos los mappings sean válidos
 */
export function validateIdMappings(mappings: IdMapping[]): boolean {
  return mappings.every((mapping) => {
    const { tempId, realId, section } = mapping
    const validSections: SectionName[] = [
      JOURNAL_ENTITIES.ORGANIZACION,
      JOURNAL_ENTITIES.ORGANIZACION_EQUIPO,
      JOURNAL_ENTITIES.ARTISTA,
      JOURNAL_ENTITIES.CATALOGO_ARTISTA,
      JOURNAL_ENTITIES.ARTISTA_HISTORIAL,
      'evento'
    ]
    return (
      isTempId(tempId) &&
      typeof realId === 'number' &&
      realId > 0 &&
      validSections.includes(section)
    )
  })
}

/**
 * Agrupa mappings por sección
 */
export function groupMappingsBySection(
  mappings: IdMapping[]
): Record<SectionName, IdMapping[]> {
  const grouped: Record<SectionName, IdMapping[]> = {
    [JOURNAL_ENTITIES.ORGANIZACION]: [],
    [JOURNAL_ENTITIES.ORGANIZACION_EQUIPO]: [],
    [JOURNAL_ENTITIES.ARTISTA]: [],
    [JOURNAL_ENTITIES.CATALOGO_ARTISTA]: [],
    [JOURNAL_ENTITIES.ARTISTA_HISTORIAL]: [],
    evento: []
  }

  mappings.forEach((mapping) => {
    grouped[mapping.section].push(mapping)
  })

  return grouped
}


// --- NEW: Generic versions accepting sections as parameter ---

/**
 * Generic version: validates mappings against provided valid sections
 */
export function validateIdMappingsGeneric(
  mappings: IdMapping[],
  validSections: string[]
): boolean {
  return mappings.every((mapping) => {
    const { tempId, realId, section } = mapping
    return (
      isTempId(tempId) &&
      typeof realId === 'number' &&
      realId > 0 &&
      validSections.includes(section)
    )
  })
}

/**
 * Generic version: groups mappings by section, returns partial record
 */
export function groupMappingsBySectionGeneric(
  mappings: IdMapping[],
  sections: string[]
): Record<string, IdMapping[]> {
  const grouped: Record<string, IdMapping[]> = {}

  for (const section of sections) {
    grouped[section] = []
  }

  for (const mapping of mappings) {
    if (grouped[mapping.section]) {
      grouped[mapping.section].push(mapping)
    }
  }

  return grouped
}