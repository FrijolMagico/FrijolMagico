import type { IdMapping, SectionName } from './types'

export function generateTempId(): string {
  return `temp-${crypto.randomUUID()}`
}

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

export function isTempId(id: string): boolean {
  return id.startsWith('temp-') && id.length > 5
}

export function extractUuidFromTempId(tempId: string): string | null {
  if (!isTempId(tempId)) return null
  return tempId.slice(5)
}

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
